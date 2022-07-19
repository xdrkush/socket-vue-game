<template>
  <div class="col bg-secondary" style="min-height: 94vh">
    <div
      style="display: flex; justify-content: space-around; align-items: center"
    >
      <div class="yellowBall" />
      <div v-if="store.getCurrentRoom.players">
        <!-- <h2 v-if="store.getCurrentRoom.data.players.player1">{{ store.getCurrentRoom.data.players.player1.point }}</h2> -->
        <h6>Player 1</h6>
        <h5 v-if="store.getCurrentRoom.players[0]">{{ store.getCurrentRoom.players[0] }}</h5>
      </div>
      <div>
        <h3>Welcome to Puissance 4</h3>
        <h5 v-if="store.currentRoom.data.message">
          {{ store.currentRoom.data.message }}
        </h5>
      </div>
      <div>
        <!-- <h2 v-if="store.getCurrentRoom.data.players.player2" >{{ store.getCurrentRoom.data.players.player2.point }}</h2> -->
        <h6>Player 2</h6>
        <h5 v-if="store.getCurrentRoom.players[1]">
          {{ store.getCurrentRoom.players[1] || "en attente" }}
        </h5>
      </div>
      <div class="redBall" />
    </div>

    <p>{{ store.getCurrentRoom }}</p>

    <div style="display: flex; justify-content: space-around">
      <button v-if="!store.currentRoom.data.loadGame" @click="startGame()">
        Start game ici
      </button>
      <button v-else @click="stopGame()">Stop game</button>
      <button v-if="store.currentRoom.data.loadGame" @click="refreshGame()">
        Refresh game
      </button>
    </div>

    <div v-if="store.currentRoom.data.loadGame">
      <table>
        <tr
          v-for="(row, indexRow) in store.currentRoom.data.board"
          :key="indexRow"
        >
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
      <h5 v-if="store.currentRoom.data.message">
        {{ store.currentRoom.data.message }}
      </h5>
    </div>
    <div v-else style="display: flex; justify-content: space-around">
      <h3>Welcome to puissance 4</h3>
    </div>
  </div>
</template>

<script>
import checkWin from "./compute";
import { useStore } from "../../stores/global.store";
import Socket from "../../boot/socket.io";
import { useRouter } from "vue-router";

const rows = 6;
const cols = 7;

let boardArrays = Array.from({ length: rows }, () =>
  Array.from({ length: cols }, () => 0)
);

export default {
  name: "Puissance4Game",
  setup() {
    const store = useStore();
    const router = useRouter();
    return {
      store,
      // Function
      startGame() {
        console.log("startGame Go !");
        Socket.socket.emit("go", {
          ...store.getCurrentRoom,
          data: {
            ...store.getCurrentRoom.data,
            loadGame: true,
            isActive: true,
            board: boardArrays,
            message: "Début de parti au joueurs 1 de commencer !",
            gameOver: false,
            currentPlayer: 1,
            players: {
              player1: { id: 1, name: "player1", color: "yellow", point: 0 },
              player2: { id: 2, name: "player2", color: "red", point: 0 },
            },
          },
        });
      },
      stopGame() {
        Socket.socket.emit("stop", store.getCurrentRoom);
        router.push("/" + store.getCurrentRoom.status)
      },
      refreshGame() {
        console.log("refresh game");

        Socket.socket.emit("refresh", {
          ...store.getCurrentRoom,
          data: {
            ...store.getCurrentRoom.data,
            message: "Vous recommencer une nouvelle partie !",
            loadGame: true,
            isActive: true,
            board: Array.from({ length: rows }, () =>
              Array.from({ length: cols }, () => 0)
            ),
          },
        });
      },
      checkRow(column) {
        for (let i = 0; i < store.getCurrentRoom.data.board.length; i++) {
          console.log("loop:", column);
          if (store.getCurrentRoom.data.board[i][column] !== 0) {
            return i - 1;
          }
        }
        return 5;
      },
      action(r, c) {
        if (!store.getCurrentRoom.data.isActive) {
          store.getCurrentRoom.data.message = `Le joueurs ${store.getCurrentRoom.data.currentPlayer} à gagner, vous devez recommencer une partie !`;
        } else {
          let checkRow = this.checkRow(c);
          store.getCurrentRoom.data.board[checkRow][c] =
            store.getCurrentRoom.data.currentPlayer;

          const position = [c, checkRow];
          store.getCurrentRoom.data.gameOver = checkWin(
            store.getCurrentRoom.data.board,
            position,
            store.getCurrentRoom.data.currentPlayer
          );
          if (store.getCurrentRoom.data.gameOver) {
            console.log(
              `Le joueurs ${store.getCurrentRoom.data.currentPlayer} à gagner`
            );
            store.getCurrentRoom.data.players[
              "player" + store.getCurrentRoom.data.currentPlayer
            ].point++;
            store.getCurrentRoom.data.message = `Le joueur ${store.getCurrentRoom.data.currentPlayer} à gagner !`;
            // classWin = true;
            // Arrête le timer
            store.getCurrentRoom.data.currentPlayer = 1;
            store.getCurrentRoom.data.isActive = false;
          } else {
            this.togglePlayer();
            store.getCurrentRoom.data.message = `Au joueurs ${store.getCurrentRoom.data.currentPlayer} de jouer !`;
          }
          Socket.socket.emit("action", { ...store.getCurrentRoom });
        }
      },
      togglePlayer() {
        if (store.getCurrentRoom.data.currentPlayer === 1)
          store.getCurrentRoom.data.currentPlayer = 2;
        else store.getCurrentRoom.data.currentPlayer = 1;
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