<template>
  <div class="col bg-secondary" style="min-height: 94vh">
    <div
      style="display: flex; justify-content: space-around; align-items: center"
    >
      <div class="yellowBall" />
      <div v-if="store.getCurrentRoom.players[0]">
        <h2>{{ players.player1.point }}</h2>
        <h6>Player 1</h6>
        <h5>{{ store.getCurrentRoom.players[0] }}</h5>
      </div>
      <div>
        <h3>Welcome to Puissance 4</h3>
        <h5 v-if="message">{{ message }}</h5>
      </div>
      <div v-if="store.getCurrentRoom.players[0]">
        <h2>{{ players.player2.point }}</h2>
        <h6>Player 2</h6>
        <h5>{{ store.getCurrentRoom.players[1] || "en attente" }}</h5>
      </div>
      <div class="redBall" />
    </div>
        <p>{{ store.getCurrentRoom }}</p>

    <div style="display: flex; justify-content: space-around">
      <button v-if="!loadGame" @click="startGame()">Start game</button>
      <button v-else @click="stopGame()">Stop game</button>
      <button v-if="loadGame" @click="refreshGame()">Refresh game</button>
    </div>

    <div v-if="loadGame">
      <table>
        <tr v-for="(row, indexRow) in board" :key="indexRow">
          <td
            v-for="(col, indexCol) in row"
            :key="indexCol"
            :style="`background-color: ${
              col === 1 ? 'yellow' : col === 2 ? 'red' : ''
            }`"
            :id="'cell-' + indexRow + '-' + indexCol"
            @click="() => action(indexRow, indexCol)"
          />
        </tr>
      </table>
      <h5 v-if="message">{{ message }}</h5>
    </div>
    <div v-else style="display: flex; justify-content: space-around">
      <h3>Welcome to puissance 4</h3>
    </div>
  </div>
</template>

<script>
import { ref } from "vue";
import checkWin from "./compute";
import { useStore } from "../../stores/global.store";

const rows = 6;
const cols = 7;

let boardArrays = Array.from({ length: rows }, () =>
  Array.from({ length: cols }, () => 0)
);

export default {
  name: "Puissance4Game",
  setup() {
    const store = useStore();
    let loadGame = ref(false);
    let isActive = ref(false);
    let currentPlayer = ref(1);
    let board = ref(boardArrays);
    let message = ref("Appuyer sur start Game pour commencer !");
    let gameOver = ref(false);
    let players = ref({
      player1: { id: 1, name: "player1", color: "yellow", point: 0 },
      player2: { id: 2, name: "player2", color: "red", point: 0 },
    });

    console.log("Board", board.value);

    return {
      store,
      // ref
      loadGame,
      board,
      currentPlayer,
      gameOver,
      message,
      isActive,
      players,
      // Function
      startGame() {
        message.value = "Début de parti au joueurs 1 de commencer !";
        loadGame.value = true;
        isActive.value = true;
      },
      stopGame() {
        message.value = "Fin de partie !";
        loadGame.value = false;
        isActive.value = false;
      },
      refreshGame() {
        console.log("refresh game", boardArrays);
        message.value = "Vous recommencer une nouvelle partie !";
        loadGame.value = true;
        isActive.value = true;
        board.value = Array.from({ length: rows }, () =>
          Array.from({ length: cols }, () => 0)
        );
      },
      checkRow(column) {
        for (let i = 0; i < board.value.length; i++) {
          console.log("loop:", column);
          if (board.value[i][column] !== 0) {
            return i - 1;
          }
        }
        return 5;
      },
      action(r, c) {
        if (!isActive.value) {
          message.value = `Le joueurs ${currentPlayer.value} à gagner, vous devez recommencer une partie !`;
        } else {
          let checkRow = this.checkRow(c);
          board.value[checkRow][c] = currentPlayer.value;

          const position = [c, checkRow];
          gameOver.value = checkWin(board.value, position, currentPlayer.value);
          if (gameOver.value) {
            console.log(`Le joueurs ${currentPlayer.value} à gagner`);
            players.value["player" + currentPlayer.value].point++;
            message.value = `Le joueur ${currentPlayer.value} à gagner !`;
            // classWin = true;
            // Arrête le timer
            currentPlayer.value = 1;
            isActive.value = false;
          } else {
            this.togglePlayer();
            message.value = `Au joueurs ${currentPlayer.value} de jouer !`;
          }
        }
      },
      togglePlayer() {
        if (currentPlayer.value === 1) currentPlayer.value = 2;
        else currentPlayer.value = 1;
      },
    };
  },
};
</script>

<style lang="css">
td {
  width: 55px;
  height: 55px;
  margin: 0px;
  padding: 0px;
  border: 2px blue inset;
  border-radius: 55px;
  background-color: lightgrey;
}

table {
  margin: auto;
  min-width: 50vw;
  background-color: blue;
  border-radius: 15px;
  background: linear-gradient(blue, darkblue);
  margin-top: 30px;
}

.redBall {
  margin-left: 20px;
  margin-top: 45px;
  height: 80px;
  width: 80px;
  border-radius: 50%;
  border: solid 2px lightgreen;
  background: radial-gradient(circle at 10px 10px, red, grey);
}

.yellowBall {
  margin-right: 20px;
  height: 80px;
  width: 80px;
  border-radius: 50%;
  margin-top: 45px;
  border: solid 2px lightgreen;
  background: radial-gradient(circle at 10px 10px, yellow, grey);
}
</style>