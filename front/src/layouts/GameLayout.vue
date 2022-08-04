<template>
  <div>
    <!-- Navbar -->
    <nav class="navbar bg-dark txt-light bdr-b-primary">
      <div class="justify_between w-100">
        <button tag="a" @click="() => copyToClipPart()">
          <h3 class="px-1">
            {{ store.getCurrentRoom.name }}
          </h3>
        </button>

        <div v-if="!store.getCurrentPlayer.auth">
          <h2 class="pr-3">@{{ store.getCurrentPlayer.username }}</h2>
        </div>
      </div>
    </nav>

    <div style="margin-top: 12vh"></div>

    <!-- Collapse / Menu -->
    <CurrentRoom />

    <!-- Button fixed -->
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

    let roomExist = store.getRooms.find(r => {
      if (r.name === `${route.params.game}/${route.params.id}/${route.params.name}`) return true
    });

    if (!store.getLoggedIn || !roomExist) router.push("/");
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
