<template>
  <div>
    <!-- Navbar -->
    <nav
      style="
        display: flex;
        color: #000;
        height: 7vh;
        justify-content: space-between;
        background-color: darkslategrey;
        align-items: center;
        border-bottom: solid 1px lightgreen;
        box-shadow: 0 0 10px;
        margin-bottom: 5px;
      "
    >
      <h2 @click="() => copyToClipPart()" style="margin-left: 20px; color: white">
        {{ store.getCurrentRoom.name }}
      </h2>
    </nav>

    <CurrentRoom />

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
import S from "../boot/socket.io";
import CurrentRoom from "../components/CurrentRoom";
import { notify } from "@kyvg/vue3-notification";

export default defineComponent({
  name: "MainLayout",

  components: { Dashboard, CurrentRoom },

  setup() {
    const store = useStore();
    const route = useRoute();
    const router = useRouter();

    console.log(
      "GameLayout",
      route.params.game,
      route.params.id,
      route.params.name
    );
    // store.loadRoom(router.fullPath);

    if (!store.getLoggedIn) router.push("/");
    else
      S.socket.emit("getSyncRoom", {
        user: store.getCurrentPlayer,
        room: `${route.params.game}/${route.params.id}/${route.params.name}`,
      });

    return {
      store,
      copyToClipPart() {
        navigator.clipboard.writeText(window.location.href);
        notify(route.fullPath + " copied");
      },
    };
  },
});
</script>
