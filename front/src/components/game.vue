<template>
  <div class="col" style="min-height: 94vh">
    <div>
      <h1 class="py-3 my-3">
        Welcome to <span v-if="gameObj"> {{ gameObj.name }} </span>
      </h1>
      <h3 class="pa-3 my-3">{{ gameObj.rules }}</h3>
    </div>
    <div style="display: flex; justify-content: space-around">
      <button @click="createGame()">Start game 🎉</button>
    </div>
  </div>
</template>

<script>
import { useStore } from "../stores/global.store";
import S from "../boot/socket.io";
import { ref } from "vue";
import { useRoute, useRouter } from "vue-router";

export default {
  name: "Game",
  setup() {
    const store = useStore();
    const route = useRoute();
    const router = useRouter();

    const gameObj = store.getGames.find((g) => {
      if (g.path === route.params.game) return true;
    });

    if (!store.getLoggedIn) router.push("/");

    const room = ref({
      name: `${gameObj.path}/${store.getCurrentPlayer.userID}/${store.getCurrentPlayer.username}`,
      author: store.getCurrentPlayer,
      status: route.params.game,
      game: gameObj,
      limitPlayers: 2,
      users: [store.getCurrentPlayer],
      players: [{ ...store.getCurrentPlayer, points: 0 }],
      message: "Nouvelle partie",
      isPrivate: false,
      gameOver: false,
      data: {},
      chat: {
        messages: [],
      },
    });

    console.log("Game", route.params.game, room);

    return {
      room,
      store,
      gameObj,
      createGame() {
        S.socket.emit("createGame", {
          game: room.value.status,
          author: store.getCurrentPlayer,
          room: room.value,
        });
      },
    };
  },
};
</script>
