<template>
  <div
    style="
      z-index: 9999;
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
        <div v-if="store.getGames.length > 0">
          <p>Jeux disponible</p>
          <div class="center">
            <div :key="game.name + index" v-for="(game, index) in store.games">
              <router-link :to="`/view/${game.path}`">
                <button>
                  {{ game.name }}
                </button>
              </router-link>
            </div>
          </div>
        </div>
        <div v-if="store.getRooms.length > 0">
          <p>Rejoindre une partie</p>
          <div :key="index" v-for="(room, index) in store.rooms">
            <router-link :to="`/game/${room.name}`">
              <button v-if="room">
                {{ room.status }} - {{ room.author.username }} : [
                {{ room.players.length }} / {{ room.limitPlayers }} ] ::
                {{ room.users.length }}
              </button>
            </router-link>
          </div>
        </div>
      </form>
    </div>

    <!-- Chat -->
    <div
      v-if="chat && dashboard"
      class="bg-dark"
      style="
        height: 40vh;
        width: 320px;
        max-width: 100%;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
      "
    >
      <!-- Message -->
      <div style="overflow: auto" class="px-1">
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
      <form @submit="sendMessage" class="col" style="box-shadow: 0 0 10px">
        <div class="w-100">
          <div
            v-if="collapseEmoji"
            style="height: 150px; width: 370px; overflow: auto"
          >
            <div class="w-100 wrap">
              <span
                :key="emoji"
                v-for="emoji in listEmoji"
                class="pa-1"
                @click="() => (text += emoji)"
                >{{ emoji }}</span
              >
            </div>
          </div>
          <div class="center w-100">
            <button @click="() => (collapseEmoji = !collapseEmoji)">🥳</button>
            <input
              type="text"
              v-model="text"
              placeholder="Écrivez votre message"
              class="w-100"
            />
            <button type="submit" style="width: 20%">
              <strong>Send</strong>
            </button>
          </div>
        </div>
      </form>
    </div>

    <!-- Button bottom -->
    <div class="justify_between">
      <!-- Switch chat or account -->
      <button v-if="dashboard" @click="chat = !chat">
        <strong>Chat</strong>
      </button>
      <button v-if="dashboard" @click="account = !account">
        <strong>Account</strong>
      </button>
      <button v-if="dashboard" @click="game = !game">
        <strong>Games</strong>
      </button>

      <!-- Button Home -->
      <router-link v-if="!dashboard" to="/">
        <button class="bg-accent">
          <strong>Home</strong>
        </button>
      </router-link>

      <!-- Button DashBoard -->
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
      >
        <strong>Dashboard</strong>
      </button>
      <!-- Button reduire -->
      <button
        v-else
        class="bg-accent txt-light"
        @click="
          () => {
            chat = !chat;
            dashboard = !dashboard;
            account = !account;
            game = !game;
          }
        "
      >
        <strong>Réduire</strong>
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
import { emoji } from "../../assets/utils"

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
    const collapseEmoji = ref(false);
    const oldUser = { ...store.getCurrentPlayer };
    const listEmoji = ref([...emoji]);

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
      collapseEmoji,
      listEmoji,
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
