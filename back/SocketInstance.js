import ChatInstance from './ChatInstance.js';
import crypto from "crypto";
const randomId = () => crypto.randomBytes(8).toString("hex");

export default class SocketInstance {
    constructor() {
        this.users = []
        this.messages = []
        this.rooms = []
        this.sessions = []
        this.games = [{ name: 'puissance-4', path: 'p4' }, { name: 'dice-game', path: 'dg' }]
    }

    runSocket() {
        this.io.use(async (socket, next) => {
            const sessionID = socket.handshake.auth.sessionID;
            // console.log('session')
            if (sessionID) {
                const session = this.sessions.find(sess => {
                    if (sess.sessionID === sessionID) return true
                });
                // console.log('session2', session)
                if (session) {
                    socket.sessionID = sessionID;
                    socket.userID = session.userID;
                    socket.username = session.username;
                    return next();
                }
            }
            const username = socket.handshake.auth.username;
            if (!username) {
                return next(new Error("invalid username"));
            }
            // console.log('handshake', socket.handshake)
            socket.sessionID = randomId();
            socket.userID = randomId();
            socket.username = username;
            this.sessions.push({ sessionID: socket.sessionID, userID: socket.userID, username: socket.username })
            next();
        });

        this.io.on('connection', (socket) => {
            // console.log('connection socket', socket.id, this.rooms)

            // emit session details
            socket.emit("session", {
                session: {
                    sessionID: socket.sessionID,
                    userID: socket.userID,
                    username: socket.username
                },
                sessions: this.sessions
            });

            socket.join(socket.sessionID)

            // sync
            this.io.emit('userConnected', {
                session: {
                    sessionID: socket.sessionID,
                    userID: socket.userID,
                    username: socket.username
                },
                sessions: this.sessions
            })

            // Accept a login event with user's data
            // socket.on("login", function (userdata) {
            //     socket.handshake.session.userdata = userdata;
            //     socket.handshake.session.save();
            // console.log('session on')
            // });

            // socket.on("logout", function (userdata) {
            //     if (socket.handshake.session.userdata) {
            //         delete socket.handshake.session.userdata;
            //         socket.handshake.session.save();
            // console.log('session off')
            //     }
            // });

            // Load global
            socket.emit('getSync', {
                messages: this.messages,
                rooms: this.rooms,
                sessions: this.sessions,
                games: this.games
            })

            socket.on('getSyncRoom', (data) => {
                socket.join(`${data.room}`)
                // console.log('getSyncRoom', data, this.rooms)
                let room = this.getRoomByName(data.room)

                this.addUserToRoom(data.user, room)

                this.io.emit("syncRooms", { rooms: this.getRooms() })
                this.io.to(`${room.name}`).emit('syncRoom', {
                    room
                })
                this.io.to(`${room.name}`).emit('flash', {
                    message: "Un visiteurs venu d'ailleurs, "
                })

                // console.log('getSyncRoom !', this.getRooms())
            })

            socket.on('editProfile', (data) => {
                this.setSession(data)
                socket.username = data.username
                this.io.emit('syncEditProfile', { user: data, sessions: this.getSessions() })
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
                console.log('createGame', data)
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
                this.io.to(`${data.name}`).emit('flash', {
                    message: "La partie commence 🎉 !",
                })
            })

            socket.on('refresh', (data) => {
                const room = this.setRoom(data)

                this.io.emit("syncRooms", { rooms: this.rooms })
                this.io.to(`${data.name}`).emit('syncRoom', {
                    room,
                })
                this.io.to(`${data.name}`).emit('flash', {
                    message: "partie relancer 🎉 !",
                })
            })

            socket.on('stop', (data) => {
                // console.log("stop", data)
                const rooms = this.deleteRoom(data)

                this.io.to(`${data.name}`).emit('stop', {
                    room: {}, rooms
                })
                this.io.to(`${data.name}`).emit('flash', {
                    message: "l'hote à quitter !",
                })
            })

            socket.on('action', (data) => {
                const room = this.setRoom(data)
                this.io.emit('syncRoooms', { rooms: this.rooms })
                this.io.to(`${data.name}`).emit('action', {
                    room
                })
            })

            socket.on('winner', (data) => {
                console.log('WINNER::', data)
                this.io.to(`${data.name}`).emit('flash', {
                    message: data.message,
                })
            })

            // Disconnected
            socket.on('disconnect', () => {
                const roomsWithUser = this.getRoomsWithUser(socket.sessionID)
                if (roomsWithUser.length > 0) {
                    roomsWithUser.map(room => {
                        room.users.map(u => {
                            if (u.sessionID === socket.sessionID) {
                                this.io.to(`${room.name}`).emit('syncRoom', { room: this.deleteUserToRoom(u, room) })
                            }
                        })
                    })
                }
                this.deleteUser(socket.sessionID)
                this.io.emit('userDisconnected', {
                    rooms: this.getRooms()
                })
                this.io.emit('flash', { message: `${socket.username} c'est déconnecter !` })
            });

            // Error
            socket.on("error", (err) => {
                // console.log("An error occurred!");
                // console.log(err);
            });
        })

    }

    // Sessions / Users
    getSessions() {
        return this.sessions
    }
    getSessionBySessionID(sessionID) {
        return this.sessions.find(u => {
            if (u.sessionID === sessionID) return true;
        })
    }
    deleteUser(sessionID) {
        this.users.splice(this.users.indexOf({ sessionID }), 1)
        this.rooms.map(room => {
            room.users.map(u => {
                if (u.sessionID === sessionID) this.deleteUserToRoom(u, room)
            })
            // room.players.map(u => {
            //     if (u.sessionID === sessionID) this.deletePlayerToRoom(u, room)
            // })
        })
        return this.users
    }
    setSession(user) {
        this.sessions = this.sessions.map((u, i) => {
            if (u.sessionID === user.sessionID) return { ...u, ...user }
            else return u
        })
        return user
    }

    // Messages
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
        if (!isExist) room.users = [...room.users, user]
        return this.setRoom(room)
    }
    deleteUserToRoom(user, room) {
        room.users.splice(room.users.indexOf({ sessionID: user.sessionID }), 1)
        return this.setRoom(room)
    }
    addPlayerToRoom(user, room) {
        const isExist = room.players.find(u => {
            if (u.sessionID === user.sessionID) return true
        })
        if (!isExist) room.players = [...room.players, user]
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

}
