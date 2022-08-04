<template>
  <div class="bg-dark txt-light sub-navbar bdr-b-primary">
    <div class="">
      <!-- Header room / Nav / Info -->
      <div
        v-if="store.getCurrentRoom.author"
        class="justify_between bdr-b-primary px-1"
        @click="info = !info"
      >
        <p v-if="store.getCurrentRoom.author.username">
          By: <strong>@</strong>{{ store.getCurrentRoom.author.username }}
        </p>
        <p>
          P:
          <span
            :class="
              store.getCurrentRoom.players.length >=
              store.getCurrentRoom.limitPlayers
                ? 'txt-negative'
                : 'txt-positive'
            "
            >{{ store.getCurrentRoom.players.length }}</span
          >
          / <strong>{{ store.getCurrentRoom.limitPlayers }}</strong>
        </p>
        <p>
          Visitors: <strong>{{ store.getCurrentRoom.users.length }}</strong>
        </p>
        <button v-if="!info" class="bg-accent"><strong>info ?</strong></button>
        <button v-else class="bg-warning"><strong>Fermer X</strong></button>
      </div>

      <!-- Wrapper / Collapse body -->
      <div v-if="info" class="row col-xs pa-1">
        <div class="w-100">
          <!-- Players -->
          <div class="bdr-b-primary py-1">
            <h4 class="my-1">Players</h4>
            <ul
              v-if="store.getCurrentRoom.players.length > 0"
              style="display: flex"
            >
              <li
                class="bdr-dark mx-1 bg-primary txt-dark"
                :key="u"
                v-for="(u, index) in store.getCurrentRoom.players"
              >
                <div>
                  <p>Player {{ index + 1 }}</p>
                  <p>@{{ u.username }}</p>
                </div>
              </li>
              <div
                class="col center"
                v-if="
                  store.getCurrentRoom.author.sessionID ===
                  store.getCurrentPlayer.sessionID
                "
              >
                <select v-model="choosePlayer" placeholder="Choisir un joueur">
                  <option
                    :value="u.sessionID"
                    :key="u.sessionID"
                    v-for="u in store.getCurrentRoom.users"
                  >
                    {{ u.username }}
                  </option>
                </select>
                <button
                  v-if="choosePlayer"
                  @click="
                    () => selectPlayer(choosePlayer, store.getCurrentRoom)
                  "
                >
                  OK
                </button>
                <p v-else>Choisir un joueur</p>
              </div>
            </ul>
          </div>

          <!-- Users -->
          <div class="bdr-b-primary py-1">
            <h4 class="my-1">Users</h4>
            <ul
              v-if="store.getCurrentRoom.users.length > 0"
              style="display: flex"
            >
              <li
                class="bdr-dark mx-1 bg-primary txt-dark"
                :key="u"
                v-for="u in store.getCurrentRoom.users"
              >
                <div>
                  <p>@{{ u.username }}</p>
                </div>
              </li>
            </ul>
          </div>

          <button
            v-if="isAuthor()"
            @click="() => stopGame()"
            class="bg-negative"
          >
            <strong>Cloturer la room !</strong>
          </button>
        </div>

        <div class="w-100">
          <ChatRoom />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from "vue";
import { useStore } from "../../stores/global.store";
import S from "../../boot/socket.io";
import ChatRoom from "../ChatRoom/index.vue";
import { useRouter } from "vue-router";

export default {
  name: "Home",
  components: { ChatRoom },
  setup() {
    const store = useStore();
    const choosePlayer = ref("");
    const info = ref(false);
    const router = useRouter();

    return {
      store,
      choosePlayer,
      info,
      selectPlayer(id, room) {
        console.log("selectPlayer", id, room);
        S.socket.emit("selectPlayer", {
          choosePlayer: id,
          room,
        });
      },
      // Author (client)
      isAuthor() {
        return store.getCurrentRoom.author.sessionID ===
          store.getCurrentPlayer.sessionID
          ? true
          : false;
      },
      stopGame() {
        S.socket.emit("stop", {
          ...store.getCurrentRoom,
          message: "Room fermé !",
        });
        router.push("/" + store.getCurrentRoom.status);
      },
    };
  },
};
</script>