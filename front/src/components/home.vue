<template>
  <div class="col" style="min-height: 94vh">
    <div>
      <h1 class="py-5 my-5">Welcome to H-Land</h1>
    </div>
    <!-- Games -->
    <h3 class="pb-3">Jeux disponible:</h3>
    <div v-if="ifGames">
      <div class="center wrap">
        <div :key="game.name + index" v-for="(game, index) in store.getGames">
          <router-link :to="`/view/${game.path}`">
            <button>
              <strong>{{ game.name }}</strong>
            </button>
          </router-link>
        </div>
      </div>
    </div>
    <div v-else><p>aucun jeux</p></div>
    <!-- Rooms -->
    <h3 class="py-3">Rejoindre une partie:</h3>
    <div v-if="ifRooms">
      <div class="center wrap">
        <div :key="index" v-for="(room, index) in store.getRooms">
          <router-link :to="`/game/${room.name}`">
            <button v-if="room">
              <strong>
                {{ room.status }} - {{ room.author.username }} : [
                {{ room.players.length }} / {{ room.limitPlayers }} ] ::
                {{ room.users.length }}
              </strong>
            </button>
          </router-link>
        </div>
      </div>
    </div>
    <div v-else>
      <p>aucune partie en cours, créez en une et invitez vos amis !</p>
    </div>
    <!-- Users -->
    <h3 class="py-3">Joueurs/euses connectés/es:</h3>
    <div v-if="ifUsers">
      <div class="center wrap">
        <div :key="index" v-for="(user, index) in store.getUsers">
          <button v-if="user">
            <strong>@{{ user.username }}</strong>
          </button>
        </div>
      </div>
    </div>
    <div v-else><p>aucun user</p></div>
    <!-- Sessions -->
    <h3 class="py-3">Sessions:</h3>
    <div v-if="ifSessions">
      <div class="center wrap">
        <div :key="index" v-for="(sess, index) in store.getSessions">
          <button v-if="sess">
            <strong>@{{ sess.username }}</strong>
          </button>
        </div>
      </div>
    </div>
    <div v-else><p>aucune sessions</p></div>
  </div>
</template>

<script>
import { useStore } from "../stores/global.store";
// import Socket from "../boot/socket.io";

export default {
  name: "Game",
  setup() {
    const store = useStore();

    return {
      store,
      ifGames: () => (store.getGames.length > 0 ? true : false),
      ifRooms: () => (store.getRooms.length > 0 ? true : false),
      ifUsers: () => (store.getUsers.length > 0 ? true : false),
      ifSessions: () => (store.getSessions.length > 0 ? true : false),
    };
  },
};
</script>
