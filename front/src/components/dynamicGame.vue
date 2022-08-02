<template>
  <div style="min-height: 100%">
    <div v-if="route.params.game === 'p4'">
      <Puissance4 />
    </div>
    <div v-else-if="route.params.game === 'dg'">
      <DiceGame />
    </div>
    <div v-else>
      <p>Une erreur de composant est survenu !</p>
    </div>
  </div>
</template>

<script>
import { defineComponent } from "vue";
import Puissance4 from "./puissance4";
import DiceGame from "./dicegame";
import { useRoute } from "vue-router";

export default defineComponent({
  name: "PreviewComp",
  components: {
    Puissance4,
    DiceGame,
  },
  setup() {
    const route = useRoute();
    return {
      route,
    };
  },
});
</script>
