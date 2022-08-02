<template>
  <div class="col" style="min-height: 94vh">
    <div>
      <h3>Welcome to KushLand</h3>
    </div>
    <!-- Games -->
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
    <!-- Rooms -->
    <div v-if="store.getRooms.length > 0">
      <p>Rejoindre une partie</p>
      <div class="center">
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
    </div>
    <!-- Users -->
    <div v-if="store.getSessions.length > 0">
      <p>Joueurs/euses connectés/es</p>
      <div class="center">
        <div :key="index" v-for="(user, index) in store.getSessions">
          <button v-if="user">@{{ user.username }}</button>
        </div>
      </div>
    </div>
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
    };
  },
};
</script>
