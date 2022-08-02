<template>
  <div class="col center pb-5" style="min-height: 74vh">
    <!-- Flash Choose Player -->
    <div>
      <div
        v-if="
          store.getCurrentRoom.players.length <
          store.getCurrentRoom.limitPlayers
        "
        class="bg-warning txt-light bdr-dark box pa-1 my-1"
        style="max-width: 720px"
      >
        <p>
          <strong class="txt-dark"> Dice Game :</strong>
          Jeux en cours d'édition
        </p>
      </div>
      <div
        class="bg-warning txt-light bdr-dark box pa-1 my-1"
        style="max-width: 720px"
        v-if="
          store.getCurrentRoom.players.length <
          store.getCurrentRoom.limitPlayers
        "
      >
        <p>
          <strong class="txt-dark"
            >@{{ store.getCurrentRoom.author.username }} :</strong
          >
          doit choisir un adversaire
        </p>
      </div>
      <div
        class="bg-accent txt-light bdr-dark box pa-1 my-1"
        style="max-width: 720px"
        v-if="
          store.getCurrentRoom.users.length < store.getCurrentRoom.limitPlayers
        "
        @click="() => copyToClipPart(store.getCurrentRoom.name)"
      >
        <strong class="txt-primary"
          >Click pour copier le lien d'invitation:
        </strong>
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
          <div class="coin">
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
          <div class="coin">
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

    <!-- Game -->
    <div v-if="store.getCurrentRoom.data.loadGame" class="w-100">
      <div class="justify_around w-100">
        <div class="col center">
          <h2>
            {{ store.getCurrentRoom.data.currentScoreP1 }}
          </h2>
        </div>
        <div>
          <p>Actions</p>
          <p>dice: {{ store.getCurrentRoom.data.dice }}</p>
          <img
            style="width: 150px"
            :src="dice[store.getCurrentRoom.data.dice - 1]"
            alt=""
          />
          <p>roundScore: {{ store.getCurrentRoom.data.roundScore }}</p>
          <button @click="() => action()">roll</button>
          <button @click="() => action('hold')">hold</button>
        </div>
        <div class="col center">
          <h2>
            {{ store.getCurrentRoom.data.currentScoreP2 }}
          </h2>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import S from "../../boot/socket.io";
import { useRouter, useRoute } from "vue-router";
import { useStore } from "../../stores/global.store";
import { notify } from "@kyvg/vue3-notification";
import dice1 from "./images/dice-1.png";
import dice2 from "./images/dice-2.png";
import dice3 from "./images/dice-3.png";
import dice4 from "./images/dice-4.png";
import dice5 from "./images/dice-5.png";
import dice6 from "./images/dice-6.png";

export default {
  name: "DiceGame",
  setup() {
    const store = useStore();
    const router = useRouter();
    const route = useRoute();
    const dice = [dice1, dice2, dice3, dice4, dice5, dice6];
    return {
      store,
      dice,
      startGame() {
        console.log("Start dice game Go !");
        S.socket.emit("startGame", {
          ...store.getCurrentRoom,
          data: {
            ...store.getCurrentRoom.data,
            loadGame: true,
            isActive: true,
            message: "Début de parti au joueurs 1 de commencer !",
            gameOver: false,
            currentPlayer: 1,
            dice: 0,
            currentScoreP1: 0,
            currentScoreP2: 0,
            players: {
              player1: {
                ...store.getCurrentRoom.players[0],
                id: 1,
                point: 0,
              },
              player2: {
                ...store.getCurrentRoom.players[1],
                id: 2,
                point: 0,
              },
            },
          },
        });
      },

      stopGame() {
        S.socket.emit("stop", store.getCurrentRoom);
        router.push("/" + store.getCurrentRoom.status);
      },
      refreshGame() {
        console.log("refresh game");
        S.socket.emit("refresh", {
          ...store.getCurrentRoom,
          data: {
            ...store.getCurrentRoom.data,
            message: "Vous recommencer une nouvelle partie 🎉 !",
            loadGame: true,
            isActive: true,
            dice: 0,
            roundScore: 0,
            currentScoreP1: 0,
            currentScoreP2: 0,
          },
        });
      },
      action(hold) {
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
          store.getCurrentRoom.data.dice = Math.floor(Math.random() * 6) + 1;
          if (store.getCurrentRoom.data.dice !== 1) {
            store.getCurrentRoom.data.roundScore +=
              store.getCurrentRoom.data.dice;
          }

          if (
            store.getCurrentRoom.data[
              "currentScoreP" + store.getCurrentRoom.data.currentPlayer
            ] >= 100
          ) {
            console.log(
              `Le joueurs ${store.getCurrentRoom.data.currentPlayer} à gagner`
            );
            S.socket.emit("winner", {
              message: `Le joueurs ${
                store.getCurrentRoom.data.players[
                  "player" + store.getCurrentRoom.data.currentPlayer
                ].username
              } à gagner 🎉 !`,
            });

            store.getCurrentRoom.data.players[
              "player" + store.getCurrentRoom.data.currentPlayer
            ].point++;
            store.getCurrentRoom.data.message = `Le joueur ${store.getCurrentRoom.data.currentPlayer} à gagner !`;
            store.getCurrentRoom.data.currentPlayer = 1;
            store.getCurrentRoom.data.isActive = false;
          } else if (hold === "hold") {
            store.getCurrentRoom.data[
              "currentScoreP" + store.getCurrentRoom.data.currentPlayer
            ] += store.getCurrentRoom.data.roundScore;
            store.getCurrentRoom.data.roundScore = 0;
            this.togglePlayer();
            store.getCurrentRoom.data.message = `Au joueurs ${store.getCurrentRoom.data.currentPlayer} de jouer !`;
          }

          S.socket.emit("action", { ...store.getCurrentRoom });
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

<style>
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

.coin .front,
.coin .back {
  position: absolute;
  height: 80px;
  width: 80px;
  background: greenyellow;
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