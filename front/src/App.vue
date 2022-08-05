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

    // Autorisation Notification on Browser
    if (!Notification) {
      alert(
        "Desktop notifications not available in your browser. Try Chromium."
      ); //if browser is not compatible this will occur
      return;
    }
    if (Notification.permission !== "granted") Notification.requestPermission();
    // if (Notification.permission !== "granted") Notification.requestPermission();
    // else {
    //   new Notification("CodeSpeedy (Notification Title)", {
    //     icon: "https://cdn.codespeedy.com/wp-content/themes/codespeedy/img/CodeSpeedy-Logo.png",
    //     body: "New Notification! Click to Check",
    //   });
    // }
    // console.log("APPPP", ls_sessionID, store.loggedIn);

    // if (window.Worker) {
    //   console.log("worker");
    //   let worker = new Worker("./worker.js", { type: module });
    //   worker.onmessage = function (msg) {
    //     console.log("onmessage", msg);
    //     // do something with messages sent back by worker
    //   };
    //   worker.postMessage({ name: "notifications" });
    // }

    watch(
      () => store.getFlash,
      (val) => {
        console.log("watcher:APP", val);
        // this.$notify(val);
      }
    );

    if (ls_sessionID) {
      usernameAlreadySelected.value = true;
      S.socket.auth = { sessionID: ls_sessionID };
      S.socket.connect();
    }

    store.getSession();
    store.getSync();
    store.getSyncMessage();

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

<style lang="css">
* {
  --color-primary: lightgreen;
  --color-secondary: lightseagreen;
  --color-accent: purple;
  --color-light: white;
  --color-dark: darkslategrey;
  --color-positive: green;
  --color-negative: lightcoral;
  --color-warning: coral;
  --color-gray-light: lightgray;
  --color-gray-medium: gray;
  --color-gray-dark: darkslategray;

  --radius: 7px;
}

html,
body {
  margin: 0;
  padding: 0;
  background-color: var(--color-primary);
}

#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}

p,
h1,
h2,
h3,
h3,
h5,
h6 {
  margin: 0;
  padding: 0;
}

/* Text-color */
.txt-primary {
  color: var(--color-primary);
}
.txt-secondary {
  color: var(--color-secondary);
}
.txt-accent {
  color: var(--color-accent);
}
.txt-light {
  color: var(--color-light);
}
.txt-dark {
  color: var(--color-dark);
}
.txt-positive {
  color: var(--color-positive);
}
.txt-negative {
  color: var(--color-negative);
}
.txt-warning {
  color: var(--color-warning);
}

/* Background */
.bg-primary {
  background-color: var(--color-primary);
}
.bg-secondary {
  background-color: var(--color-secondary);
}
.bg-accent {
  background-color: var(--color-accent);
}
.bg-light {
  background-color: var(--color-light);
}
.bg-dark {
  background-color: var(--color-dark);
}
.bg-positive {
  background-color: var(--color-positive);
}
.bg-negative {
  background-color: var(--color-negative);
}
.bg-warning {
  background-color: var(--color-warning);
}

/* Borders */
.bdr-primary {
  border: solid 2px var(--color-primary);
  border-radius: var(--radius);
}
.bdr-secondary {
  border: solid 2px var(--color-secondary);
  border-radius: var(--radius);
}
.bdr-accent {
  border: solid 2px var(--color-accent);
  border-radius: var(--radius);
}
.bdr-light {
  border: solid 2px var(--color-light);
  border-radius: var(--radius);
}
.bdr-dark {
  border: solid 2px var(--color-dark);
  border-radius: var(--radius);
}
.bdr-positive {
  border: solid 2px var(--color-positive);
  border-radius: var(--radius);
}
.bdr-negative {
  border: solid 2px var(--color-negative);
  border-radius: var(--radius);
}
.bdr-warning {
  border: solid 2px var(--color-warning);
  border-radius: var(--radius);
}
.bdr-b-primary {
  border-bottom: solid 1px var(--color-primary);
}
.bdr-t-primary {
  border-top: solid 1px var(--color-primary);
}
.bdr-bt-primary {
  border-bottom: solid 1px var(--color-primary);
  border-top: solid 1px var(--color-primary);
}
.bdr-r-primary {
  border-right: solid 1px var(--color-primary);
}
.bdr-l-primary {
  border-left: solid 1px var(--color-primary);
}
.bdr-lr-primary {
  border-left: solid 1px var(--color-primary);
  border-right: solid 1px var(--color-primary);
}

/* Margin / Padding */
/* Je sais que je peux le faire avec sass mais sass-loader n'est pas encore installer */
.ma-1 {
  margin: 10px;
}
.my-1 {
  margin: 10px 0;
}
.mx-1 {
  margin: 0 10px;
}
.ml-1 {
  margin-left: 10px;
}
.mb-1 {
  margin-bottom: 10px;
}
.mt-1 {
  margin-top: 10px;
}
.mr-1 {
  margin-right: 10px;
}

.pa-1 {
  padding: 10px;
}
.py-1 {
  padding: 10px 0;
}
.px-1 {
  padding: 0 10px;
}
.pl-1 {
  padding-left: 10px;
}
.pb-1 {
  padding-bottom: 10px;
}
.pt-1 {
  padding-top: 10px;
}
.pr-1 {
  padding-right: 10px;
}

.ma-3 {
  margin: 30px;
}
.my-3 {
  margin: 30px 0;
}
.mx-3 {
  margin: 0 30px;
}
.ml-3 {
  margin-left: 30px;
}
.mb-3 {
  margin-bottom: 30px;
}
.mt-3 {
  margin-top: 30px;
}
.mr-3 {
  margin-right: 30px;
}

.pa-3 {
  padding: 30px;
}
.py-3 {
  padding: 30px 0;
}
.px-3 {
  padding: 0 30px;
}
.pl-3 {
  padding-left: 30px;
}
.pb-3 {
  padding-bottom: 30px;
}
.pt-3 {
  padding-top: 30px;
}
.pr-3 {
  padding-right: 30px;
}

.ma-5 {
  margin: 50px;
}
.my-5 {
  margin: 50px 0;
}
.mx-5 {
  margin: 0 50px;
}
.ml-5 {
  margin-left: 50px;
}
.mb-5 {
  margin-bottom: 50px;
}
.mt-5 {
  margin-top: 50px;
}
.mr-5 {
  margin-right: 50px;
}

.pa-5 {
  padding: 50px;
}
.py-5 {
  padding: 50px 0;
}
.px-5 {
  padding: 0 50px;
}
.pl-5 {
  padding-left: 50px;
}
.pb-5 {
  padding-bottom: 50px;
}
.pt-5 {
  padding-top: 50px;
}
.pr-5 {
  padding-right: 50px;
}

a {
  color: var(--color-light);
  text-decoration: none !important;
}

ul {
  margin: 0;
  padding: 0;
}
li {
  list-style: none;
  padding: 5px;
}

button {
  background-color: var(--color-secondary);
  color: white;
  margin: 3px;
  padding: 7px;
  border-radius: var(--radius);
  border: solid 1px var(--color-dark);
  box-shadow: 0 0 3px black;
  text-shadow: 0 0 5px black;
}

input {
  height: 27px;
  border: solid 2px var(--color-dark);
  border-radius: var(--radius);
}

.register {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
}

.row {
  display: flex;
}
.col {
  display: flex;
  flex-direction: column;
}
@media screen and (max-width: 720px) {
  .col-xs {
    display: flex;
    flex-direction: column;
  }
}
.center {
  display: flex;
  align-items: center;
  justify-content: center;
}
.wrap {
  display: flex;
  flex-wrap: wrap;
}
.justify_between {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.justify_around {
  display: flex;
  justify-content: space-around;
}
.justify_center {
  display: flex;
  justify-content: center;
}
/* .justify_start {
  display: flex;
  justify-content: start;
} */
/* .justify_end {
  display: flex;
  justify-content: end;
} */
.align_item_center {
  display: flex;
  align-items: center;
}
.w-auto {
  width: auto;
}
.w-100 {
  width: 100%;
}
.w-100-vh {
  height: 100vh;
}
.w-100-vw {
  max-width: 100vw;
  width: 100vw;
}
.w-50 {
  width: 50%;
}
.w-50-vh {
  height: 50vh;
}
.w-50-vw {
  max-width: 50vw;
  width: 50vw;
}

/* Item */
.navbar {
  z-index: 10;
  height: 45px;
  width: 100vw;
  position: fixed;
  top: 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: solid 2px var(--color-primary);
  box-shadow: var(--color-dark) 0 0 7px;
}
.sub-navbar {
  z-index: 10;
  width: 100vw;
  position: fixed;
  top: calc(45px + 1px);
  box-shadow: var(--color-dark) 0 0 7px;
}
.box {
  border-radius: var(--radius);
  box-shadow: 0 0 3px black;
}

/* width */
::-webkit-scrollbar {
  width: 10px;
  border-left: 1px solid var(--color-light);
  background: grey;
}

/* Track */
::-webkit-scrollbar-track {
  background: var(--color-dark);
  border-left: 1px solid var(--color-light);
  border-radius: 15px;
}

/* Handle */
::-webkit-scrollbar-thumb {
  background: var(--color-dark);
  border-radius: 15px;
  border: solid 1px var(--color-primary);
}
/* Handle on hover */
::-webkit-scrollbar-thumb:hover {
  background: var(--color-primary);
  border: 1px solid var(--color-dark);
}
</style>
