<template>
  <div>
    <notifications />
    <router-view />
  </div>
</template>

<script>
import { useStore } from "./stores/global.store";

export default {
  name: "App",
  setup() {
    const store = useStore();

    store.getSync();
    
    return {};
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
