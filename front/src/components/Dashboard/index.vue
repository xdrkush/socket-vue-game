<template>
  <div
    style="
      width: auto;
      position: fixed;
      padding: 3px;
      bottom: 0;
      right: 0;
      box-shadow: 0 0 10px;
      overflow: auto;
    "
  >
    <!-- Account -->
    <div
      v-if="account && dashboard"
      style="
        padding: 7px;
        height: auto;
        display: flex;
        overflow: auto;
        flex-direction: column;
        justify-content: space-between;
        background-color: darkslategrey;
        color: white;
        border: solid 1px lightgreen;
      "
    >
      {{ store.getCurrentPlayer.id }}
    </div>

    <!-- Games -->
    <div
      v-if="game && dashboard"
      style="
        padding: 7px;
        color: white;
        height: auto;
        display: flex;
        flex-direction: column;
        background-color: darkslategrey;
        justify-content: space-between;
        border: solid 1px lightgreen;
        overflow: auto;
      "
    >
      <form
        @submit="invite"
        style="
          display: flex;
          flex-direction: column;
          justify-content: space-around;
        "
      >
        <p v-if="store.getGames.length > 0">Jeux disponible</p>
        <div :key="game.name + index" v-for="(game, index) in store.games">
          <button @click="() => homeGame(game)">
            {{ game.name }}
          </button>
        </div>
        <p v-if="store.getRooms.length > 0">Rejoindre une partie</p>
        <div :key="room + index" v-for="(room, index) in store.rooms">
          <button @click="() => joinGame(room)">
            {{ room.status }} - {{ room.author }} : [
            {{ room.players.length }} / {{ room.limitPlayers }} ] :: {{ room.users.length }}
          </button>
        </div>
        <p>Jouer à</p>
        <select v-model="game" placeholder="Choisir un jeux">
          <option :key="game" v-for="game in store.games">
            {{ game.name }}
          </option>
        </select>
        <p>Avec</p>
        <select v-model="user" placeholder="Users en ligne">
          <option :key="user" v-for="user in store.users" :value="user">
            {{ user }}
          </option>
        </select>
        <button type="submit">inviter</button>
      </form>
    </div>

    <!-- Chat -->
    <div
      v-if="chat && dashboard"
      style="
        border: solid 1px lightgreen;
        height: 40vh;
        min-width: 320px;
        padding: 5px 5px;
        background-color: darkslategrey;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
      "
    >
      <!-- Message -->
      <div style="overflow: auto">
        <div :key="index" v-for="(m, index) in store.messages">
          <div
            :style="`
            padding: 5px 0;
            width: 100%;
            display: flex;
            justify-content: ${
              m.author === store.getCurrentPlayer.id ? 'end' : 'start'
            };
          `"
          >
            <div
              :style="`
            padding: 10px;
            width: 80%;
            background-color: lightgreen;
            color: ${
              m.author === store.getCurrentPlayer.id
                ? 'darklategrey'
                : 'darklategrey'
            };
            border-radius: ${
              m.author === store.getCurrentPlayer.id
                ? '10px 10px 0 10px'
                : '10px 10px 10px 0'
            };
            text-align: ${
              m.author === store.getCurrentPlayer.id ? 'right' : 'left'
            };
          `"
            >
              <p>
                <strong>
                  {{
                    m.author === store.getCurrentPlayer.id ? "Moi" : m.author
                  }}:
                </strong>
              </p>
              <p>{{ m.text }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Input -->
      <form
        @submit="sendMessage"
        style="
          display: flex;
          justify-content: space-between;
          padding: 5px;
          box-shadow: 0 0 10px;
        "
      >
        <input type="text" style="width: 80%" v-model="text" />
        <button type="submit" style="width: 20%">Send</button>
      </form>
    </div>

    <div
      style="
        display: flex;
        padding: 3px;
        justify-content: space-between;
        background-color: darkslategrey;
      "
    >
      <!-- Switch chat or account -->
      <button v-if="dashboard" @click="chat = !chat">Chat</button>
      <button v-if="dashboard" @click="account = !account">Account</button>
      <button v-if="dashboard" @click="game = !game">Games</button>

      <button
        v-if="!dashboard"
        @click="
          () => {
            chat = !chat;
            dashboard = !dashboard;
            account = !account;
            game = !game;
          }
        "
        style="
          background-color: lightseagreen;
          color: white;
          padding: 7px;
          border-radius: 15px;
          border: solid 1px darkslategrey;
          box-shadow: 0 0 3px black;
          text-shadow: 0 0 5px black;
        "
      >
        Dashboard
      </button>
      <button
        v-else
        @click="
          () => {
            chat = !chat;
            dashboard = !dashboard;
            account = !account;
            game = !game;
          }
        "
      >
        Réduire
      </button>
    </div>

    <p
      v-if="dashboard"
      style="
        border-radius: 0 0 7px 7px;
        background-color: darkslategrey;
        color: lightseagreen;
      "
    >
      <router-link to="/">Retour acceuil - Kush-Land</router-link>
    </p>
  </div>
</template>

<script>
import { ref } from "vue";
import Socket from "../../boot/socket.io";
import { useStore } from "../../stores/global.store";
import { useRouter } from "vue-router";

export default {
  name: "Chat",

  setup() {
    const dashboard = ref(false);
    const chat = ref(false);
    const game = ref(false);
    const account = ref(false);
    const text = ref("");
    const store = useStore();
    const router = useRouter();

    return {
      store,
      dashboard,
      chat,
      game,
      account,
      text,
      sendMessage(e) {
        e.preventDefault();
        console.log("sendMessage", store.getCurrentPlayer, text.value);

        if (text.value.length <= 0) return;
        Socket.socket.emit("sendMessage", {
          author: store.getCurrentPlayer.id,
          text: text.value,
        });
        text.value = "";
      },
      joinGame(room) {
        console.log('joinGame', room)
        Socket.socket.emit("joinGame", { user: store.getCurrentPlayer, room });
        router.push(`/game/p4/${room.author}`);
      },
      homeGame(game) {
        console.log('homeGame', game)
        router.push(`/${game.path}`);
      },
      toggleChat() {
        if (!chat.value) chat.value = true;
        else chat.value = false;
      },
    };
  },
};
</script>