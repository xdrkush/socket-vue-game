<template>
  <div>
    <notifications />
    <div class="register" v-if="!store.getLoggedIn">
      <form @submit.prevent="onSubmit">
        <input v-model="username" placeholder="Your username..." />
        <button v-if="username.length > 2">Send</button>
      </form>
    </div>
    <router-view v-else />
  </div>
</template>

<script>
import { useStore } from "./stores/global.store";
import { ref, watch } from "vue";
import S from "./boot/socket.io";

export default {
  name: "App",
  setup() {
    const ls_sessionID = localStorage.getItem("sessionID");
    const username = ref("");
    const usernameAlreadySelected = ref(false);
    const store = useStore();

    store.getSession();
    store.getSync();
    store.getSyncMessage();

    console.log("APPPP", ls_sessionID, store.loggedIn);

    watch(
      () => store.getFlash,
      (val) => {
        console.log('watcher:APP', val)
        // this.$notify(val);
      }
    );

    if (ls_sessionID) {
      console.log("ICIICICIIC");
      usernameAlreadySelected.value = true;
      S.socket.auth = { sessionID: ls_sessionID };
      S.socket.connect();
    }

    return {
      username,
      store,
      onSubmit() {
        console.log("register", username.value);
        usernameAlreadySelected.value = true;
        S.socket.auth = { username: username.value };
        S.socket.connect();
      },
    };
  },
};
</script>

<style>
html,
body {
  margin: 0;
  padding: 0;
  background-color: lightgreen;
}
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}

p {
  margin: 2px;
}

a {
  color: white;
  text-decoration: none !important;
}

button {
  background-color: lightseagreen;
  color: white;
  margin: 3px;
  padding: 7px;
  border-radius: 15px;
  border: solid 1px darkslategrey;
  box-shadow: 0 0 3px black;
  text-shadow: 0 0 5px black;
}

input {
  height: 27px;
  border: solid 2px darkslategrey;
  border-radius: 15px;
}

.register {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
}

/* width */
::-webkit-scrollbar {
  width: 10px;
  border-left: 1px solid white;
  background: grey;
}

/* Track */
::-webkit-scrollbar-track {
  background: darkslategrey;
  border-left: 1px solid white;
  border-radius: 15px;
}

/* Handle */
::-webkit-scrollbar-thumb {
  background: darkslategrey;
  border-radius: 15px;
  border: solid 1px lightgreen;
}
/* Handle on hover */
::-webkit-scrollbar-thumb:hover {
  background: lightgreen;
  border: 1px solid darkslategrey;
}
</style>
