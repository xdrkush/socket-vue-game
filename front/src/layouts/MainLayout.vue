<template>
  <div>
    <!-- Navbar -->
    <nav class="navbar bg-dark txt-light">
      <div class="justify_between w-100">
        <h1 class="px-1">
          <router-link to="/">🎉 Kush-Land</router-link>
        </h1>

        <div v-if="!store.getCurrentPlayer.auth">
          <h2 class="pr-3">@{{ store.getCurrentPlayer.username }}</h2>
        </div>
      </div>
    </nav>

    <div style="margin-top: 7vh"></div>

    <!-- <p>currentUser: {{ store.getCurrentPlayer }}</p> -->
    <!-- <p>currentRoom: {{ store.getCurrentRoom }}</p> -->
    <!-- <p>sessions: {{ store.getSessions }}</p> -->
    <!-- <p>rooms: {{ store.getRooms }}</p> -->
    <!-- <p>{{ store }}</p> -->

    <Dashboard :user="store.getCurrentUser" />

    <!-- Page (Body) -->
    <div>
      <router-view />
    </div>
  </div>
</template>

<script>
import { defineComponent } from "vue";
import Dashboard from "../components/Dashboard";
import { useStore } from "../stores/global.store";

export default defineComponent({
  name: "MainLayout",

  components: { Dashboard },

  setup() {
    const store = useStore();

    return {
      store,
    };
  },
});
</script>
