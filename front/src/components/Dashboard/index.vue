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
      <p>
        {{ store.getCurrentPlayer.username }}
      </p>
      <div
        style="
          display: flex;
          justify-content: space-between;
          align-items: center;
        "
      >
        <p v-if="!editName">
          {{ store.getCurrentPlayer.username }}
        </p>
        <div v-else>
          <input v-model="store.getCurrentPlayer.username" type="text" />
        </div>

        <button
          v-if="editName"
          @click="
            () => {
              editName = !editName;
              store.getCurrentPlayer.username = oldUser.username;
            }
          "
          style="background-color: lightcoral"
        >
          X
        </button>

        <button v-if="!editName" @click="editName = !editname">edit</button>
        <button v-else @click="() => editProfile()">confirmer</button>
      </div>
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
          <router-link :to="`/${game.path}`">
            <button>
              {{ game.name }}
            </button>
          </router-link>
        </div>
        <p v-if="store.getRooms.length > 0">Rejoindre une partie</p>
        <div :key="index" v-for="(room, index) in store.rooms">
          <router-link :to="`/game/${room.name}`">
            <button v-if="room">
              {{ room.status }} - {{ room.author.username }} : [
              {{ room.players.length }} / {{ room.limitPlayers }} ] ::
              {{ room.users.length }}
            </button>
          </router-link>
        </div>
        <!-- <p>Jouer à</p>
        <select v-model="game" placeholder="Choisir un jeux">
          <option :key="game" v-for="game in store.getGames">
            {{ game.name }}
          </option>
        </select>
        <p>Avec</p>
        <select v-if="store.users" v-model="user" placeholder="Users en ligne">
          <option :key="user" v-for="user in store.getUsers" :value="user">
            {{ user }}
          </option>
        </select>
        <button type="submit">inviter</button> -->
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
              m.author === store.getCurrentPlayer.username ? 'end' : 'start'
            };
          `"
          >
            <div
              :style="`
            padding: 10px;
            width: 80%;
            background-color: lightgreen;
            color: ${
              m.author === store.getCurrentPlayer.username
                ? 'darklategrey'
                : 'darklategrey'
            };
            border-radius: ${
              m.author === store.getCurrentPlayer.username
                ? '10px 10px 0 10px'
                : '10px 10px 10px 0'
            };
            text-align: ${
              m.author === store.getCurrentPlayer.username ? 'right' : 'left'
            };
          `"
            >
              <p>
                <strong>
                  {{
                    m.author === store.getCurrentPlayer.username
                      ? "Moi"
                      : m.author
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

    <!-- Button bottom -->
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

    <!-- Return to home -->
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
import S from "../../boot/socket.io";
import { useStore } from "../../stores/global.store";
// import { useRouter } from "vue-router";

export default {
  name: "Chat",

  setup() {
    const store = useStore();
    const dashboard = ref(false);
    const chat = ref(false);
    const game = ref(false);
    const account = ref(false);
    const editName = ref(false);
    const text = ref("");
    const user = ref({ ...store.getCurrentPlayer });
    const oldUser = { ...store.getCurrentPlayer };

    return {
      store,
      oldUser,
      user,
      dashboard,
      chat,
      game,
      editName,
      account,
      text,
      sendMessage(e) {
        e.preventDefault();
        console.log("sendMessage", store.getCurrentPlayer, text.value);

        if (text.value.length <= 0) return;
        S.socket.emit("sendMessage", {
          author: store.getCurrentPlayer.username,
          authorID: store.getCurrentPlayer.sessionID,
          text: text.value,
        });
        text.value = "";
      },
      // joinRoom(room) {
      //   console.log("joinRoom", room);
      //   S.socket.emit("joinRoom", { user: store.getCurrentPlayer, room });
      // },
      toggleChat() {
        if (!chat.value) chat.value = true;
        else chat.value = false;
      },
      editProfile() {
        console.log("editProfile", store.getCurrentPlayer);
        S.socket.emit("editProfile", {
          ...store.getCurrentPlayer,
        });
      },
    };
  },
};
</script>
