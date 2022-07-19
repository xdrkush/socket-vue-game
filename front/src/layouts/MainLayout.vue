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
      <h1 style="margin-left: 20px">
        <router-link to="/">Kush-Land</router-link>
      </h1>
      <button
        style="
          background-color: lightseagreen;
          color: white;
          margin-right: 15px;
          padding: 7px;
          border-radius: 15px;
          border: solid 1px darkslategrey;
          box-shadow: 0 0 3px black;
          text-shadow: 0 0 5px black;
        "
        @click="connect()"
      >
        me connecter
      </button>
    </nav>

    <p>{{ store.getCurrentPlayer.id }}</p>
    <p>{{ store }}</p>

    <Dashboard />

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
