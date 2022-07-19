import { defineStore } from 'pinia'
import Socket from "../boot/socket.io";

// useStore could be anything like useUser, useCart
// the first argument is a unique id of the store across your application
export const useStore = defineStore("main", {
    state: () => ({
        currentPlayer: {},
        users: [],
        games: [{name: 'puissance-4', path: 'p4'}],
        rooms: [],
        messages: [],
        currentRoom: {}
    }),

    getters: {
        getCurrentPlayer: (state) => state.currentPlayer,
        getUsers: (state) => state.users,
        getGames: (state) => state.games,
        getRooms: (state) => state.rooms,
        getMessages: (state) => state.messages,
        getCurrentRoom: (state) => state.currentRoom
    },

    actions: {
        getSync() {
            // Load page
            Socket.socket.on("getSync", (data) => {
                console.log('getSync', data)
                this.messages = data.messages;
                this.users = data.users;
                this.rooms = data.rooms;
                this.currentPlayer = data.user;
            });

            // GetMessage flux
            Socket.socket.on("syncMessage", (data) => {
                console.log("syncMessage", data);
                this.messages.push({ author: data.author, text: data.text });
            });
            
            Socket.socket.on("startGame", (data) => {
                console.log("startGame", data);
                this.rooms = data.rooms;
                this.currentRoom = data.room;
            });
            Socket.socket.on("go", (data) => {
                console.log("go", data);
                this.rooms = data.rooms;
                this.currentRoom = data.room;
            });
            Socket.socket.on("action", (data) => {
                console.log("go", data);
                this.rooms = data.rooms;
                this.currentRoom = data.room;
            });
            Socket.socket.on("refresh", (data) => {
                console.log("refresh", data);
                this.rooms = data.rooms;
                this.currentRoom = data.room;
            });
            Socket.socket.on("stop", (data) => {
                console.log("stop", data);
                this.rooms = data.rooms;
                this.currentRoom = data.room;
                this.$router.push('/')
            });

            Socket.socket.on("joinGame", (data) => {
                console.log("joinGame", data);
                this.rooms = data.rooms;
                this.currentRoom = data.room;
            });

            Socket.socket.on("newRoom", (data) => {
                console.log("newRoom", data);
                this.rooms = data.rooms;
            });

            Socket.socket.on("userConnected", (data) => {
                console.log("userConnected:", data);
                this.users = data.users
                // this.rooms.push(data.user)
                // this.$notify(data.user + ": c'est connecter");
            });

            Socket.socket.on("userDisconnected", (data) => {
                console.log("userDisconnected:", data);
                this.users = data.users
                // this.rooms.splice(this.rooms.indexOf(data.user), 1)
                // this.$notify(data.user + ": c'est déconnecter");
            });
        },
    }
})