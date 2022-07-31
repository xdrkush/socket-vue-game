<template>
  <div>
    <p>currentPlayer: {{ store.getCurrentPlayer }}</p>
    <p>currentRoom: {{ store.getCurrentRoom }}</p>

    <div>
      <p>users</p>
      <ul v-if="store.getCurrentRoom.users">
        <li :key="u" v-for="u in store.getCurrentRoom.users">
          {{ u }}
        </li>
      </ul>
      <p>players</p>
      <ul v-if="store.getCurrentRoom.players">
        <li :key="u" v-for="u in store.getCurrentRoom.players">
          {{ u }}
        </li>
      </ul>
    </div>

    <Dashboard />

    <!-- Page (Body) -->
    <div>
      <router-view />
    </div>
  </div>
</template>

<script>
import { defineComponent } from "vue";
import { useRoute, useRouter } from "vue-router";
import Dashboard from "../components/Dashboard";
import { useStore } from "../stores/global.store";
import S from "../boot/socket.io"

export default defineComponent({
  name: "MainLayout",

  components: { Dashboard },

  setup() {
    const store = useStore();
    const route = useRoute();
    const router = useRouter();

    console.log("GameLayout", route.params.game, route.params.id, route.params.name);
    // store.loadRoom(router.fullPath);

    if (!store.getLoggedIn) router.push('/')
    else S.socket.emit("getSyncRoom", { user: store.getCurrentPlayer, room: `${route.params.game}/${route.params.id}/${route.params.name}` });
    
    return {
      store,
    };
  },
});
</script>
