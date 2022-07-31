import ChatInstance from './ChatInstance.js';
import crypto from "crypto";
const randomId = () => crypto.randomBytes(8).toString("hex");

export default class SocketInstance {
    constructor() {
        this.users = []
        this.messages = []
        this.rooms = []
        this.sessions = []
        // this.chat = new ChatInstance()
    }

    runSocket() {
        this.io.use(async (socket, next) => {
            const sessionID = socket.handshake.auth.sessionID;
            console.log('session')
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
            console.log('connection socket', socket.id, this.rooms)

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
            // this.users = [...this.users, { id: socket.id, name: "anonymous" }]
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
            //     console.log('session on')
            // });

            // socket.on("logout", function (userdata) {
            //     if (socket.handshake.session.userdata) {
            //         delete socket.handshake.session.userdata;
            //         socket.handshake.session.save();
            //         console.log('session off')
            //     }
            // });

            // Load global
            socket.emit('getSync', {
                messages: this.messages,
                rooms: this.rooms,
                sessions: this.sessions
            })

            socket.on('getSyncRoom', (data) => {
                socket.join(`${data.room}`)
                let room = this.rooms.find(r => {
                    if (r.name === data.room) return true
                })
                console.log('getSyncRoom', room, data)

                let userExist = room.users.find((user) => {
                    if (user.sessionID === data.user.sessionID) return true
                })
                if (!userExist) {
                    console.log('getSyncRoom, !userexist')
                    room.users = [...room.users, data.user]
                }

                this.rooms = [...this.rooms.map((r) => {
                    console.log('loop', r.name)
                    if (r.name === data.room) {
                        console.log('match room')
                        r.users = room.users;
                        r.players = room.players;
                        return room
                    } else return r
                })]

                console.log('getSyncRoom2', room)

                this.io.emit("syncRooms", { rooms: this.rooms })
                this.io.to(`${room.name}`).emit('syncRoom', {
                    room
                })
            })

            // Load global
            socket.on('editProfile', (data) => {
                console.log('editProfile', data, this.users)
                this.sessions = [...this.sessions.map((sess, index) => {
                    console.log('loop', sess, data)
                    if (sess.sessionID === data.sessionID) {
                        console.log('match')
                        sess.username = data.username;
                        return sess
                    } else return sess
                })]
                this.io.emit('syncEditProfile', { user: data, sessions: this.sessions })
                console.log('editProfile2', this.sessions)
            })

            socket.on('sendMessage', (data) => {
                console.log('sendMessage', this.messages)
                this.setMessages(data)
                this.io.emit('syncMessage', data)
            });
            socket.on('sendMessageRoom', (data) => {
                console.log('sendMessage', this.messages)
                const room = this.setRoom(data.room)
                this.io.to(`${room.name}`).emit('syncRoom', {
                    room
                })
            });

            socket.on('selectPlayer', (data) => {
                const user = this.sessions.find(u => {
                    if (u.sessionID === data.choosePlayer) return true;
                })
                console.log('user selected', data, user)

                this.rooms = this.rooms.map(r => {
                    if (r.name === data.room.name) return {
                        ...r,
                        players: [r.players[0], user]
                    }
                })

                const room = this.rooms.find(r => {
                    console.log('FIND::', r, data.room.name)
                    if (String(r.name) === String(data.room.name)) return true;
                })

                console.log('SEND SELECTPLAYER', this.rooms, room)

                this.io.emit('syncRooms', { rooms: this.rooms })
                this.io.to(`${data.room.name}`).emit('syncRoom', {
                    room
                })
            });

            socket.on('createGame', (data) => {
                console.log('createGame', data)
                const room = {
                    name: `${data.game}/${data.author.userID}/${data.author.username}`,
                    author: data.author,
                    status: data.game,
                    limitPlayers: 2,
                    users: [data.author],
                    players: [data.author],
                    isPrivate: false,
                    data: {},
                    chat: {
                        messages: []
                    }
                }

                socket.join(`${room.name}`)
                // this.setRooms(room)
                this.rooms = [...this.rooms, room]
                this.setRooms(this.rooms)
                this.io.emit('newRoom', { room, rooms: this.rooms })
                this.io.to(`${room.name}`).emit('createGame', {
                    room, rooms: this.rooms
                })
            });

            socket.on('startGame', (data) => {
                console.log('startGame', data)
                this.rooms = [...this.rooms.map((room, index) => {
                    if (room.name === data.name) return { ...room, ...data }
                    else return
                })]

                const room = this.getRoomByName(data.name)

                console.log('startGame', room, this.rooms)

                this.io.emit("syncRooms", { rooms: this.rooms })
                this.io.to(`${data.name}`).emit('syncRoom', {
                    room,
                })
            })

            socket.on('refresh', (data) => {
                console.log('refresh', data)

                const room = this.setRoom(data)

                // this.rooms = [...this.rooms.map((room, index) => {
                //     if (room.name === data.name) return data
                //     else return
                // })]

                this.io.emit("syncRooms", { rooms: this.rooms })
                this.io.to(`${data.name}`).emit('syncRoom', {
                    room,
                })
            })

            socket.on('stop', (data) => {
                console.log('stop', data)
                const rooms = this.deleteRoom(data)

                this.io.to(`${data.name}`).emit('stop', {
                    room: {}, rooms: this.rooms
                })
            })

            socket.on('action', (data) => {
                const room = this.setRoom(data)

                this.io.emit('syncRoooms', { rooms: this.rooms })
                this.io.to(`${data.name}`).emit('action', {
                    room
                })
            })

            // Disconnected
            socket.on('disconnect', () => {
                // this.rooms.map((r) => {
                //     r.users.splice(r.users.indexOf({ sessionID: socket.sessionID }), 1)
                //     r.players.splice(r.players.indexOf({ sessionID: socket.sessionID }), 1)
                // })
                this.users.splice(this.users.indexOf({ sessionID: socket.sessionID }), 1)
                this.io.emit('userDisconnected', {
                    user: { id: socket.id, name: socket.username },
                    users: this.users,
                    rooms: this.rooms
                })
            });

            // Error
            socket.on("error", (err) => {
                console.log("An error occurred!");
                console.log(err);
            });
        })

    }

    getRoomByName(name) {
        return this.rooms.find(r => {
            if (r.name === name) return true;
        })
    }
    getSessionBySessionID() { }

    setMessages(message) {
        if (this.messages.length > 44) this.messages.shift()
        else this.messages = [...this.messages, message]
    }

    setRooms(rooms) {
        this.rooms = [...rooms]
        return this.rooms
    }

    createRoom(room) {
        this.rooms = [...this.rooms, room]
    }

    setRoom(room) {
        this.rooms = this.rooms.map((r, i) => {
            if (r.name === room.name) return room
            else return r
        })
        return room
    }

    deleteRoom(room) {
        return this.rooms.map((r, index) => {
            if (r.name === room.name) this.rooms.slice(0, index)
        })
    }

}
