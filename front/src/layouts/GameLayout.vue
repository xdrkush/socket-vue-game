<template>
  <div>
    <p>{{ store }}</p>

    <Dashboard
      :messages="messages"
      :currentPlayer="currentPlayer"
      :users="users"
      :games="games"
    />

    <!-- Page (Body) -->
    <div>
      <router-view />
    </div>
  </div>
</template>

<script>
import { defineComponent, ref } from "vue";
import Dashboard from "../components/Dashboard";
// import Socket from "../boot/socket.io";
import {useStore} from "../stores/global.store"

const staticPages = [{ name: "puissance-4", path: "p4" }];

export default defineComponent({
  name: "MainLayout",

  components: { Dashboard },

  setup() {
    const pages = ref(staticPages);
    const games = ref(staticPages);
    const currentPlayer = ref("");
    const users = ref([]);
    const messages = ref([]);
    const store = useStore();

    return {
      store,
      messages,
      games,
      users,
      currentPlayer,
      pages,
    };
  },
});
</script>
