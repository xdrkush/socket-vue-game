<template>
  <div class="col bg-secondary" style="min-height: 94vh">
    <div>
      <h3>Welcome to puissance 4</h3>
    </div>
    <div style="display: flex; justify-content: space-around">
      <button @click="startGame()">Start game</button>
    </div>
  </div>
</template>

<script>
import { useStore } from "../../stores/global.store";
import Socket from "../../boot/socket.io";

export default {
  name: "Puissance4Home",
  setup() {
    const store = useStore();

    return {
      startGame() {
        Socket.socket.emit("createGame", {
          game: "p4",
          author: store.getCurrentPlayer,
        });
      },
    };
  },
};
</script>
