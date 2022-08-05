import { defineStore } from 'pinia'
import S from "../boot/socket.io";
import { notify } from "@kyvg/vue3-notification";
import JSConfetti from "js-confetti";


export const useStore = defineStore("main", {
    state: () => ({
        flash: "",
        loggedIn: false,
        currentPlayer: {},
        currentRoom: {},
        users: [],
        sessions: [],
        games: [],
        rooms: [],
        messages: []
    }),

    getters: {
        getFlash: (state) => state.flash,
        getCurrentPlayer: (state) => state.currentPlayer,
        getCurrentRoom: (state) => state.currentRoom,
        getLoggedIn: (state) => state.loggedIn,
        getSessions: (state) => state.sessions,
        getUsers: (state) => state.users,
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
                }
            });
        },
        getSync() {
            // Load page
            S.socket.on("flash", (data) => {
                notify({ title: data.message });

                if (Notification.permission !== "granted") Notification.requestPermission();
                else {
                    new Notification("H-land - Games", { body: data.message });
                }
            });

            S.socket.on("winner", (data) => {
                console.log('WINNER')
                this.currentRoom = data.room;
                new JSConfetti().addConfetti();
            });

            S.socket.on("getSync", (data) => {
                console.log('getSync', data)
                this.users = data.users;
                this.sessions = data.sessions;
                this.games = data.games;
                this.rooms = data.rooms;
                this.messages = data.messages;
            });

            S.socket.on("syncEditProfile", (data) => {
                this.users = data.users;
                this.sessions = data.sessions;
            });
            S.socket.on("syncCurrentPlayer", (data) => {
                this.currentPlayer = data.user;
            });
            S.socket.on("syncRooms", (data) => {
                // console.log('syncRooms', data)
                this.rooms = data.rooms;
            });
            S.socket.on("syncRoom", (data) => {
                // console.log('syncRoom', data)
                this.currentRoom = data.room;
                new JSConfetti().addConfetti();
            });

            S.socket.on("createGame", (data) => {
                console.log("createGame", this, data);
                this.currentRoom = data.room;
                this.$router.push(`/game/${data.room.name}`);
                new JSConfetti().addConfetti();
            });

            S.socket.on("startGame", (data) => {
                this.rooms = data.rooms;
                this.currentRoom = data.room;
            });

            S.socket.on("action", (data) => {
                console.log("action", data);
                this.currentRoom = data.room;
            });

            S.socket.on("refresh", (data) => {
                console.log("refresh", data);
                this.rooms = data.rooms;
                this.currentRoom = data.room;
                new JSConfetti().addConfetti();
            });

            S.socket.on("stop", (data) => {
                console.log("stop", data);
                this.rooms = data.rooms;
                this.currentRoom = data.room;
                this.$router.push('/')
            });

            S.socket.on("newRoom", (data) => {
                console.log("newRoom", data);
                this.rooms = data.rooms;
            });

            S.socket.on("userConnected", (data) => {
                console.log("new userConnected:", data);
                notify(data.session.username + " viens de ce connecté !");
                this.users = data.users;
                this.sessions = data.sessions;
                
                // new Notification("H-land - Games", { body: data.session.username + " viens de ce connecté !" });
                // Notification.requestPermission(function (permission) {
                //     // If the user accepts, let's create a notification
                //     if (permission === "granted") {
                //         console.log('IXCICICCICI', worker)
                //         worker.port.postMessage({ name: "notification" });
                //     }
                // });

                if (Notification.permission !== "granted") Notification.requestPermission();
                else {
                    new Notification("H-land - Games", { body: data.session.username + " viens de ce connecté !" });
                }
                
                // <3
                if (data.session.username.includes('kush'))
                    new JSConfetti().addConfetti({
                        emojis: ["🦄", "🤯", "🐧"],
                        emojiSize: 40,
                        confettiNumber: 10,
                        confettiRadius: 6,
                    })
                else if (data.session.username.includes('tbio'))
                    new JSConfetti().addConfetti({
                        emojis: ["🌿", "🍀", "🌱"],
                        emojiSize: 30,
                        confettiNumber: 10,
                        confettiRadius: 6,
                    })
                else new JSConfetti().addConfetti({
                    emojis: ["🎉", "🥳", "✨"],
                    emojiSize: 30,
                    confettiNumber: 10,
                    confettiRadius: 6,
                });
                new JSConfetti().addConfetti();

            });

            S.socket.on("userDisconnected", (data) => {
                this.users = data.users
                this.sessions = data.sessions
                this.rooms = data.rooms
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