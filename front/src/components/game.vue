<template>
  <div class="col" style="min-height: 94vh">
    <div>
      <h3>Welcome to <span v-if="gameObj()"> {{ gameObj().name }} </span></h3>
    </div>
    <div style="display: flex; justify-content: space-around">
      <button @click="createGame()">Start game</button>
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
    if (!store.getLoggedIn) router.push("/");

    const room = ref({
      name: `${route.params.game}/${store.getCurrentPlayer.userID}/${store.getCurrentPlayer.username}`,
      author: store.getCurrentPlayer,
      status: route.params.game,
      limitPlayers: 2,
      users: [store.getCurrentPlayer],
      players: [store.getCurrentPlayer],
      isPrivate: false,
      data: {},
      chat: {
        messages: [],
      }
    });


    console.log(
      "Game",
      route.params.game,
      room
    );

    return {
      room,
      store,
      createGame() {
        S.socket.emit("createGame", {
          game: room.value.status,
          author: store.getCurrentPlayer,
          room: room.value
        });
      },
      gameObj() {
        return store.getGames.find(g => {
          if (g.path === route.params.game) return true
        })
      }
    };
  },
};
</script>
