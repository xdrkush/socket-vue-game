<template>
  <div class="col center" style="min-height: 74vh">
    <!-- Flash Choose Player -->
    <div>
      <h3 v-if="!store.getCurrentRoom.data.author">Welcome to puissance 4</h3>
      <div
        class="bg-warning txt-light bdr-dark pa-1 box my-1"
        style="max-width: 720px"
        v-if="
          store.getCurrentRoom.players.length <
          store.getCurrentRoom.limitPlayers
        "
      >
        <p>
          <strong class="txt-dark">{{
            store.getCurrentRoom.author.username
          }}</strong>
          : doit choisir un adversaire
        </p>
      </div>
      <div
        class="bg-accent txt-light bdr-dark pa-1 box my-1"
        style="max-width: 720px"
        v-if="
          store.getCurrentRoom.users.length < store.getCurrentRoom.limitPlayers
        "
        @click="() => copyToClipPart(store.getCurrentRoom.name)"
      >
        <strong class="txt-primary">Lien d'invitation: </strong>
        <p>
          {{ store.getCurrentRoom.name }}
        </p>
      </div>
    </div>

    <!-- Settings / Score / Players -->
    <div
      v-if="
        store.getCurrentRoom.data &&
        store.getCurrentRoom.players[0] &&
        store.getCurrentRoom.players[1]
      "
      class="center w-100-vw py-1 my-1"
    >
      <div class="w-100 px-3">
        <h3>Player 1</h3>
        <div class="row justify_around w-100">
          <div class="coin coin-yellow">
            <div
              :class="`front ${
                store.getCurrentRoom.players[0] &&
                checkPlayer().sessionID ===
                  store.getCurrentRoom.players[0].sessionID
                  ? 'jump'
                  : ''
              }`"
            />
            <div
              :class="
                store.getCurrentRoom.players[0] &&
                checkPlayer().sessionID ===
                  store.getCurrentRoom.players[0].sessionID
                  ? 'shadow'
                  : ''
              "
            />
          </div>
          <div>
            <h4 class="mt-5" v-if="store.getCurrentRoom.players.length > 0">
              {{ store.getCurrentRoom.players[0].username }}
            </h4>
            <h3 v-if="store.getCurrentRoom.data.players">
              {{ store.getCurrentRoom.data.players.player1.point }}
            </h3>
          </div>
        </div>
      </div>
      <h2>VS</h2>
      <div class="w-100 px-3">
        <h3>Player 2</h3>
        <div class="row justify_around w-100">
          <div>
            <h4 class="mt-5" v-if="store.getCurrentRoom.players.length > 1">
              {{ store.getCurrentRoom.players[1].username }}
            </h4>
            <h5 v-else>En attente</h5>
            <h3 v-if="store.getCurrentRoom.data.players">
              {{ store.getCurrentRoom.data.players.player2.point }}
            </h3>
          </div>
          <div class="coin coin-red">
            <div
              :class="`front ${
                store.getCurrentRoom.players[1] &&
                checkPlayer().sessionID ===
                  store.getCurrentRoom.players[1].sessionID
                  ? 'jump'
                  : ''
              }`"
            />
            <div
              :class="
                store.getCurrentRoom.players[1] &&
                checkPlayer().sessionID ===
                  store.getCurrentRoom.players[1].sessionID
                  ? 'shadow'
                  : ''
              "
            />
          </div>
        </div>
      </div>
    </div>

    <h5 class="ma-1" v-if="store.getCurrentRoom.data.message">
      {{ store.getCurrentRoom.data.message }}
    </h5>

    <!-- Button / Stop / Retry -->
    <div
      v-if="
        store.getCurrentPlayer.sessionID ===
        store.getCurrentRoom.author.sessionID &&
        store.getCurrentRoom.players &&
        store.getCurrentRoom.players.length >= store.getCurrentRoom.limitPlayers
      "
      style="display: flex; justify-content: space-around"
    >
      <button v-if="!store.getCurrentRoom.data.loadGame" @click="startGame()">
        Start
      </button>
      <button v-else @click="stopGame()">Stop game</button>
      <button v-if="store.getCurrentRoom.data.loadGame" @click="refreshGame()">
        Recommencer
      </button>
    </div>

    <div v-if="store.getCurrentRoom.data.loadGame">
      <table>
        <tr>
          <th colspan="7"></th>
        </tr>
        <tr
          v-for="(row, indexRow) in store.getCurrentRoom.data.board"
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
    </div>
  </div>
</template>

<script>
import checkWin from "./compute";
import { useStore } from "../../stores/global.store";
import Socket from "../../boot/socket.io";
import { useRouter, useRoute } from "vue-router";
import { notify } from "@kyvg/vue3-notification";
// import party from "party-js";

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
    const route = useRoute();
    return {
      store,
      // Function
      startGame() {
        console.log("startGame Go !");
        Socket.socket.emit("startGame", {
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
              player1: {
                ...store.getCurrentRoom.players[0],
                id: 1,
                color: "yellow",
                point: 0,
              },
              player2: {
                ...store.getCurrentRoom.players[1],
                id: 2,
                color: "red",
                point: 0,
              },
            },
          },
        });
      },
      stopGame() {
        Socket.socket.emit("stop", store.getCurrentRoom);
        router.push("/" + store.getCurrentRoom.status);
      },
      refreshGame() {
        console.log("refresh game");
        // party.confetti(this, {
        //   count: party.variation.range(20, 40),
        // });
        Socket.socket.emit("refresh", {
          ...store.getCurrentRoom,
          data: {
            ...store.getCurrentRoom.data,
            message: "Vous recommencer une nouvelle partie 🎉 !",
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
        if (
          store.getCurrentPlayer.sessionID !==
          store.getCurrentRoom.data.players[
            `player${Number(store.getCurrentRoom.data.currentPlayer)}`
          ].sessionID
        ) {
          console.log("Ce n'est pas à vous de jouer");
        } else if (!store.getCurrentRoom.data.isActive) {
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
            Socket.socket.emit("winner", {
              message: `Le joueurs ${store.getCurrentRoom.data.currentPlayer} à gagner 🎉 !`,
            });
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
      checkPlayer() {
        if (store.getCurrentRoom.data.currentPlayer) {
          return store.getCurrentRoom.players[
            store.getCurrentRoom.data.currentPlayer - 1
          ];
        } else {
          return false;
        }
      },
      copyToClipPart() {
        navigator.clipboard.writeText(window.location.href);
        notify({
          title: route.fullPath + " copied",
        });
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
  background-color: var(--color-gray-light);
}

table {
  margin: auto;
  min-width: 50vw;
  background-color: blue;
  border-radius: 10px 10px 15px 15px;
  background: linear-gradient(blue, darkblue);
  margin-top: 30px;
  padding: 5px 15px 20px 15px;
  box-shadow: var(--color-gray-dark) 0 0 20px 5px;
}

/* .yellowBall {
  height: 80px;
  width: 80px;
  border-radius: 50%;
  border: solid 2px darkgoldenrod;
  background: radial-gradient(circle at 10px 10px, yellow, gray);
} */

.redBall {
  margin: 0.5rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 80px;
  width: 80px;
  border-radius: 50%;
  border: solid 2px darkred;
  background: radial-gradient(circle at 10px 10px, red, gray);
}

.jump {
  animation: jump 1.5s infinite ease;
}

@keyframes jump {
  0% {
    top: 0;
  }
  50% {
    top: -40px;
  }
  100% {
    top: 0;
  }
}

.coin {
  margin: auto;
  position: relative;
  bottom: 0;
  left: 0;
  right: 0;
  top: 0;
  height: 80px;
  width: 80px;
}

.coin-yellow .front,
.coin-yellow .back {
  position: absolute;
  height: 80px;
  width: 80px;
  background: yellow; /* #ffbd0b; */
  border-radius: 50%;
  border-top: 7px solid var(--color-gray-light);
  border-left: 7px solid var(--color-gray-light);
  border-right: 7px solid var(--color-gray-dark);
  border-bottom: 7px solid var(--color-gray-dark);
  transform: rotate(0deg);
}

.coin-red .front,
.coin-red .back {
  position: absolute;
  height: 80px;
  width: 80px;
  background: red; /* #ffbd0b; */
  border-radius: 50%;
  border-top: 7px solid var(--color-gray-light);
  border-left: 7px solid var(--color-gray-light);
  border-right: 7px solid var(--color-gray-dark);
  border-bottom: 7px solid var(--color-gray-dark);
  transform: rotate(0deg);
}

.coin .shadow {
  width: 100%;
  height: 20px;
  background: rgba(0, 0, 0, 0.4);
  left: 0;
  bottom: 0px;
  border-radius: 50%;
  z-index: -1;
  margin: 100px 7px 0 7px;
  animation: swift 1.5s infinite ease;
}
/* 
.coin-yellow {
  background: yellow
}
.coin-red {
  background: red
} */

@keyframes swift {
  0% {
    opacity: 0.8;
  }
  50% {
    opacity: 0.4;
    transform: scale(0.8);
  }
  100% {
    opacity: 0.8;
  }
}
</style>