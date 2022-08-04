import ChatInstance from './ChatInstance.js';
import crypto from "crypto";
const randomId = () => crypto.randomBytes(8).toString("hex");

export default class SocketInstance {
    constructor() {
        this.users = [];
        this.messages = [];
        this.rooms = [];
        this.sessions = [];
        this.games = [{ name: 'puissance-4', path: 'p4', rules: "Jouer chacun votre tour, et soyez le premier à alignés 4 jetons en horizontal, vertical ou diagonal ! Enjoy 🥳" }, { name: 'dice-game', path: 'dg', rules: "Jeté le dé et cumulez les scores, attentions si vous faites 1 c'est au tour de votre adversaire, le premier arrive à 100 à gagner ! Enjoy 🥳" }]
    }

    runSocket() {
        this.io.use(async (socket, next) => {
            // SessionID exist
            const sessionID = socket.handshake.auth.sessionID;

            // SessionID Storage exist
            if (sessionID) {
                console.log('session', socket.handshake.auth, this.users)
                const session = this.sessions.find(sess => {
                    if (sess.sessionID === sessionID) return true
                });
                // Session exist in this.sessions
                if (session) {
                    console.log('session ??')
                    socket.session = {
                        sessionID,
                        userID: session.userID,
                        username: session.username
                    }
                    this.newUser({ ...socket.session })
                    return next();
                }
            }

            const username = socket.handshake.auth.username;

            if (!username) {
                return next(new Error("invalid username"));

            }

            socket.session = {
                sessionID: sessionID ? sessionID : randomId(),
                userID: randomId(),
                username: username,
            }
            console.log('session 2', socket.session, this.users)
            this.newUser({ ...socket.session })
            this.newSession({ ...socket.session })

            next();
        });

        this.io.on('connection', (socket) => {
            console.log('connection socket', this.users)
            socket.join(socket.session.sessionID)
            socket.join("global")

            // emit session details
            socket.emit("session", {
                session: {
                    sessionID: socket.session.sessionID,
                    userID: socket.session.userID,
                    username: socket.session.username
                }
            });

            // Load global
            socket.emit('getSync', {
                messages: this.getMessages(),
                rooms: this.getRooms(),
                games: this.getGames(),
                users: this.getUsers(),
                sessions: this.getSessions()
            })

            // Sync
            this.io.emit('userConnected', {
                session: {
                    username: socket.session.username
                },
                users: this.getUsers(),
                sessions: this.getSessions()
            })

            socket.on('getSyncRoom', (data) => {
                console.log('getSyncRoom')
                socket.join(`${data.room}`)
                let room = this.getRoomByName(data.room)

                this.addUserToRoom(data.user, room)

                this.io.emit("syncRooms", { rooms: this.getRooms() })
                this.io.to(`${room.name}`).emit('syncRoom', {
                    room
                })
                // this.io.to(`${room.name}`).emit('flash', {
                //     message: "Un visiteurs venu d'ailleurs, "
                // })

                // console.log('getSyncRoom !', this.getRooms())
            })

            socket.on('editProfile', (data) => {
                this.setUser(data)
                this.setSession(data)
                socket.session.username = data.username
                this.io.emit('syncEditProfile', { users: this.getUsers(), sessions: this.getSessions() })
                socket.emit('syncCurrentPlayer', { user: data })
                this.io.emit('flash', {
                    message: `$${data.username} à éditer son profil`
                })
            })

            socket.on('sendMessage', (data) => {
                // console.log('sendMessage', this.messages)
                this.setMessages(data)
                this.io.emit('syncMessage', data)
                this.io.emit('flash', {
                    message: "nouveau message #global"
                })
            });

            socket.on('sendMessageRoom', (data) => {
                // console.log('sendMessage', this.messages)
                const room = this.setRoom(data.room)
                this.io.to(`${room.name}`).emit('syncRoom', {
                    room
                })
                this.io.to(`${data.room.name}`).emit('flash', {
                    message: "nouveau message #" + data.room.name
                })
            });

            socket.on('selectPlayer', (data) => {
                const user = this.getSessionBySessionID(data.choosePlayer)

                this.addPlayerToRoom(user, data.room)

                this.io.emit('syncRooms', { rooms: this.getRooms() })
                this.io.to(`${data.room.name}`).emit('syncRoom', {
                    room: this.getRoomByName(data.room.name)
                })
                this.io.to(`${data.room.name}`).emit('flash', {
                    message: user.username + " est le player 2 !"
                })
            });

            socket.on('createGame', (data) => {
                socket.join(`${data.room.name}`)
                const rooms = this.createRoom(data.room)
                this.io.emit('newRoom', { rooms })
                socket.emit('createGame', {
                    room: data.room
                })
                this.io.emit('flash', {
                    message: "Nouvelle partie créé 🎉 !",
                })
            });

            socket.on('startGame', (data) => {
                const room = this.setRoom(data)

                this.io.emit("syncRooms", { rooms: this.getRooms })
                this.io.to(`${data.name}`).emit('syncRoom', {
                    room,
                })
            })

            socket.on('refresh', (data) => {
                const room = this.setRoom(data)

                this.io.emit("syncRooms", { rooms: this.rooms })
                this.io.to(`${data.name}`).emit('syncRoom', {
                    room
                })
            })

            socket.on('stop', (data) => {
                // console.log("stop", data)
                const rooms = this.deleteRoom(data)

                this.io.to(`${data.name}`).emit('stop', {
                    room: {}
                })
                this.io.emit('stop', {
                    rooms
                })
                this.io.to(`${data.name}`).emit('flash', {
                    message: "l'hote à fermer la game !",
                })
            })

            socket.on('action', (data) => {
                const room = this.setRoom(data)
                this.io.emit('syncRooms', { rooms: this.getRooms() })
                this.io.to(`${data.name}`).emit('action', {
                    room
                })
            })

            socket.on('winner', (data) => {
                const room = this.setRoom(data)
                this.io.emit('syncRoooms', { rooms: this.getRooms() })
                this.io.to(`${data.name}`).emit('winner', { room })
            })

            // Disconnected
            socket.on('disconnect', () => {
                socket.leave(socket.session.sessionID)
                socket.leave("global")

                this.deleteUser(socket.session.sessionID)
                this.io.emit('userDisconnected', {
                    rooms: this.getRooms(),
                    users: this.getUsers(),
                    sessions: this.getSessions()
                })
                this.io.emit('flash', { message: `${socket.session.username} c'est déconnecter !` })
            });

            // Error
            socket.on("error", (err) => {
                // console.log("An error occurred!");
                // console.log(err);
            });
        })

    }

    // Users
    getUsers() {
        return this.users;
    }
    // User
    newUser(user) {
        // const userExist = this.users.find(u => {
        //     if (u.sessionID === user.sessionID) return true
        // })
        // if (!userExist) this.users = [...this.users, user]
        this.users = [...this.users, user]

        return this.users
    }

    getUserByID(userID) {
        return this.users.find(u => {
            if (u.userID === userID) return true;
        })
    }
    deleteUser(sessionID) {
        this.users.map((u, i) => {
            if (u.sessionID === sessionID) {
                console.log('u::loop', i, u)
                this.users.splice(i, 1)
            }
        })
        this.rooms.map(room => {
            room.users.map(u => {
                if (u.userID === userID) this.deleteUserToRoom(u, room)
            })
            // room.players.map(u => {
            //     if (u.sessionID === sessionID) this.deletePlayerToRoom(u, room)
            // })
        })
        console.log('Delete User', this.users)
        return this.users;
    }
    setUser(user) {
        this.users = this.users.map((u, i) => {
            if (u.userID === user.userID) return { ...u, ...user }
            else return u
        })
        return user
    }

    // Sessions
    getSessions() {
        return this.sessions
    }

    // Session
    newSession(user) {
        const userExist = this.sessions.find(u => {
            if (u.sessionID === user.sessionID) return true
        })
        if (!userExist) this.sessions = [...this.sessions, user]
        return this.sessions
    }
    setSession(user) {
        this.sessions = this.sessions.map((u, i) => {
            if (u.sessionID === user.sessionID) return { ...u, ...user }
            else return u
        })
        return user
    }
    getSessionBySessionID(sessionID) {
        return this.sessions.find(u => {
            if (u.sessionID === sessionID) return true;
        })
    }
    deleteSession(sessionID) {
        this.sessions.splice(this.sessions.indexOf({ sessionID }), 1)
        this.sessions.map(room => {
            room.users.map(u => {
                if (u.sessionID === sessionID) this.deleteUserToRoom(u, room)
            })
            // room.players.map(u => {
            //     if (u.sessionID === sessionID) this.deletePlayerToRoom(u, room)
            // })
        })
        return this.sessions
    }

    // Messages
    getMessages() {
        return this.messages;
    }
    setMessages(message) {
        if (this.messages.length > 44) this.messages.shift()
        else this.messages = [...this.messages, message]
    }

    // Rooms
    getRooms() {
        return this.rooms
    }
    getRoomsWithUser(sessionID) {
        let arr = [];
        this.rooms.map(room => {
            let eee = room.users.find(u => {
                if (u.sessionID === sessionID) return true
            })
            console.log('getRoomsWithUser::loop', room, eee)
            if (eee) {
                arr.push(room)
            }
        })
        return arr
    }
    setRooms(rooms) {
        this.rooms = rooms
        return this.rooms
    }

    // Room
    createRoom(room) {
        this.rooms = [...this.rooms, room]
        return this.rooms
    }
    addUserToRoom(user, room) {
        const isExist = room.users.find(u => {
            if (u.sessionID === user.sessionID) return true
        })
        if (!isExist) {
            room.users = [...room.users, user]
            // Si la room le permet il ajoute automatiquement en player
            if (room.players.length < room.limitPlayers) this.addPlayerToRoom(user, room)
        }
        return this.setRoom(room)
    }
    addPlayerToRoom(user, room) {
        const isExist = room.players.find(u => {
            if (u.sessionID === user.sessionID) return true
        })
        if (!isExist) room.players = [room.players[0], { ...user, points: 0 }]

        return this.setRoom(room)
    }
    deleteUserToRoom(user, room) {
        room.users.splice(room.users.indexOf({ sessionID: user.sessionID }), 1)
        return this.setRoom(room)
    }
    deletePlayerToRoom(user, room) {
        room.players.splice(room.players.indexOf({ sessionID: user.sessionID }), 1)
        return this.setRoom(room)
    }
    deletePlayerToRoom(user, room) {
        room.players.splice(room.players.indexOf({ sessionID: user.sessionID }), 1)
        return this.setRoom(room)
    }
    getRoomByName(name) {
        return this.rooms.find(r => {
            if (r.name === name) return true;
        })
    }
    setRoom(room) {
        this.rooms = this.rooms.map((r, i) => {
            if (r.name === room.name) return { ...r, ...room }
            else return r
        })
        return room
    }
    deleteRoom(room) {
        this.rooms.splice(this.rooms.indexOf({ name: room.name }), 1)
        return this.rooms
    }

    // Games
    getGames() {
        return this.games;
    }

}
