import ChatInstance from './ChatInstance.js';
// import ServerInstance from './ServerInstance.js';

export default class SocketInstance {
    constructor() {
        this.users = [];
        this.messages = [];
        this.rooms = [];
        // this.chat = new ChatInstance()
    }

    runSocket() {
        this.io.on('connection', (socket) => {
            console.log('connection socket', socket.id, socket.test)
            socket.join('global')

            // sync
            this.users = [...this.users, socket.id]
            this.io.emit('userConnected', {
                user: socket.id,
                users: this.users,
            })

            // Load global
            socket.emit('getSync', {
                messages: this.messages,
                user: { id: socket.id },
                rooms: this.rooms,
                users: this.users
            })

            socket.on('sendMessage', (data) => {
                console.log('sendMessage', this.messages)
                this.setMessages(data)
                this.io.emit('syncMessage', data)
            });

            socket.on('startGame', (data) => {
                console.log('startGame', data)
                const room = {
                    name: data.game + '/' + data.author,
                    author: data.author,
                    status: data.game,
                    limitPlayers: 2,
                    users: [data.author],
                    players: [data.author],
                    isPrivate: false,
                    data: {}
                }

                socket.join(`${room.name}`)
                // this.setRooms(room)
                this.rooms = [ ...this.rooms, room ]
                this.io.emit('newRoom', { rooms: this.rooms })
                this.io.to(`${room.name}`).emit('startGame', {
                    room, rooms: this.rooms
                })
            });

            socket.on('joinGame', (data) => {
                console.log('joinGame1', this.rooms, data.room.players.length)
                socket.join(`${data.room.name}`)
                if (data.room.players.length >= data.room.limitPlayers) {
                    if (!data.room.users.includes(data.user.id)) {
                        data.room = {
                            ...data.room,
                            users: [...data.room.users, data.user.id]
                        }
                    }
                }
                else {
                    data.room = {
                        ...data.room,
                        users: [...data.room.users, data.user.id],
                        players: [...data.room.players, data.user.id]
                    }
                }

                // console.log('joinGame2', this.rooms)
                this.io.to(`${data.room.name}`).emit('joinGame', {
                    room: data.room, rooms: this.setRooms(data.room)
                })
            })

            socket.on('go', (data) => {
                console.log('go', data)
                this.rooms = [...this.rooms.map((room, index) => {
                    if (room.name === data.name) return data
                    else return
                })]

                this.io.to(`${data.name}`).emit('go', {
                    room: data, rooms: this.rooms
                })
            })

            socket.on('refresh', (data) => {
                console.log('refresh', data)

                this.rooms = [...this.rooms.map((room, index) => {
                    if (room.name === data.name) return data
                    else return
                })]

                this.io.to(`${data.name}`).emit('refresh', {
                    room: data, rooms: this.rooms
                })
            })

            socket.on('stop', (data) => {
                console.log('stop', data)

                this.rooms = [...this.rooms.map((room, index) => {
                    if (room.name === data.name) delete this.rooms[index]
                })]

                this.io.to(`${data.name}`).emit('stop', {
                    room: {}, rooms: this.rooms
                })
            })

            socket.on('action', (data) => {
                console.log('go', data)
                this.setRooms(data)

                this.io.to(`${data.name}`).emit('action', {
                    room: data, rooms: this.rooms
                })
            })

            // Disconnected
            socket.on('disconnect', () => {
                this.io.emit('userDisconnected', {
                    user: socket.id,
                    users: this.users
                })
                this.users.splice(this.users.indexOf(socket.id), 1)
            });

            // Error
            socket.on("error", (err) => {
                console.log("An error occurred!");
                console.log(err);
            });
        })

    }

    setMessages(message) {
        if (this.messages.length > 44) this.messages.shift()
        else this.messages = [...this.messages, message]
    }

    setRooms(room) {
        this.rooms = [...this.rooms.map((r, index) => {
            if (r.name === room.name) return room
            else return
        })]
        return this.rooms
    }

}
