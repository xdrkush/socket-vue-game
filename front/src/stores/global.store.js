import { defineStore } from 'pinia'
import S from "../boot/socket.io";
import { notify } from "@kyvg/vue3-notification";

// useStore could be anything like useUser, useCart
// the first argument is a unique id of the store across your application
export const useStore = defineStore("main", {
    state: () => ({
        flash: "",
        loggedIn: false,
        currentPlayer: {},
        currentRoom: {},
        sessions: [],
        games: [{ name: 'puissance-4', path: 'p4' }],
        rooms: [],
        messages: []
    }),

    getters: {
        getFlash: (state) => state.flash,
        getCurrentPlayer: (state) => state.currentPlayer,
        getCurrentRoom: (state) => state.currentRoom,
        getLoggedIn: (state) => state.loggedIn,
        getSessions: (state) => state.sessions,
        getGames: (state) => state.games,
        getRooms: (state) => state.rooms,
        getMessages: (state) => state.messages
    },

    actions: {
        getSession() {
            S.socket.on("session", (data) => {
                console.log('Session::', data)
                const { sessionID, userID, username } = data.session;
                // attach the session ID to the next reconnection attempts
                S.socket.auth = { sessionID, userID, username };
                // store it in the localStorage
                localStorage.setItem("sessionID", sessionID);
                // save the ID of the user
                S.socket.userID = userID;
                if (userID && sessionID && username) {
                    this.loggedIn = true
                    this.currentPlayer = { sessionID, userID, username }
                    this.sessions = data.sessions
                }
            });
        },
        getSync() {
            // Load page
            S.socket.on("getSync", (data) => {
                console.log('getSync', data)
                this.messages = data.messages;
                this.sessions = data.sessions;
                this.rooms = data.rooms;
            });

            S.socket.on("syncEditProfile", (data) => {
                this.sessions = data.sessions;
            });
            S.socket.on("syncRooms", (data) => {
                console.log('syncRooms', data)
                this.rooms = data.rooms;
            });
            S.socket.on("syncRoom", (data) => {
                console.log('syncRoom', data)
                this.currentRoom = data.room;
            });

            S.socket.on("createGame", (data) => {
                console.log("createGame", this, data);
                this.rooms = data.rooms;
                this.currentRoom = data.room;
                this.$router.push(`/game/${data.room.name}`);
            });

            S.socket.on("startGame", (data) => {
                this.rooms = data.rooms;
                this.currentRoom = data.room;
            });

            S.socket.on("action", (data) => {
                console.log("action", data);
                this.rooms = data.rooms;
                this.currentRoom = data.room;
            });

            S.socket.on("refresh", (data) => {
                console.log("refresh", data);
                this.rooms = data.rooms;
                this.currentRoom = data.room;
            });

            S.socket.on("stop", (data) => {
                console.log("stop", data);
                this.rooms = data.rooms;
                this.currentRoom = data.room;
                this.$router.push('/')
            });

            // S.socket.on("joinRoom", (data) => {
            //     console.log("joinRoom", data);
            //     this.currentRoom = data.room;
            //     // this.$router.push(`/game/${data.room.name}`)
            // });

            S.socket.on("newRoom", (data) => {
                console.log("newRoom", data);
                this.rooms = data.rooms;
            });

            S.socket.on("userConnected", (data) => {
                console.log("new userConnected:", data.session);
                this.sessions = data.sessions
                notify(data.session.username + " viens de ce connecté !");
            });

            S.socket.on("userDisconnected", (data) => {
                console.log("userDisconnected:", data);
                this.users = data.users
                this.rooms = data.rooms
                notify(data.user.username + ": c'est déconnecter");
            });
        },
        getSyncMessage() {
            // GetMessage flux
            S.socket.on("syncMessage", (data) => {
                console.log("syncMessage", data);
                this.messages.push({ author: data.author, text: data.text });
            });
        }
    }
})