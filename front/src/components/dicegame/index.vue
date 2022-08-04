<template>
  <div class="col center pb-5" style="min-height: 74vh">
    <div v-if="!checkLoaded()">
      <h2>Chargement ...</h2>
    </div>
    <div v-else class="col center">
      <div>
        <!-- Flash Welcome !isActive -->
        <div
          v-if="
            !store.getCurrentRoom.data.loadGame ||
            !store.getCurrentRoom.data.isActive
          "
          class="bg-warning txt-light bdr-dark box pa-1 ma-1"
          style="max-width: 720px"
        >
          <strong class="txt-dark"> Welcome to Dice-Game:</strong>
          <p>
            {{ store.getCurrentRoom.game.rules }}
          </p>
        </div>
        <!-- Flash En attente d'un player -->
        <div
          v-if="!checkPlayerExist(2)"
          class="bg-warning txt-light bdr-dark box pa-1 ma-1"
          style="max-width: 720px"
        >
          <p>
            <strong class="txt-dark">@{{ getPlayer(1).username }} :</strong>
            doit choisir un adversaire
          </p>
        </div>
        <!-- Flash invite friends -->
        <div
          v-if="
            !store.getCurrentRoom.data.loadGame ||
            !store.getCurrentRoom.data.isActive
          "
          class="bg-accent txt-light bdr-dark box pa-1 ma-1 w-auto"
          style="max-width: 720px"
          @click="() => copyToClipPart(store.getCurrentRoom.name)"
        >
          <strong class="txt-primary"
            >Clickez, pour copier le lien d'invitation:
          </strong>
          <p>
            {{ store.getCurrentRoom.name }}
          </p>
        </div>
      </div>

      <!-- {{ store.getCurrentRoom }} -->

      <!-- Button :: Start / Stop / Retry -->
      <div
        v-if="
          isAuthor() &&
          checkPlayerExist(2) &&
          !store.getCurrentRoom.data.isActive
        "
        style="display: flex; justify-content: space-around"
      >
        <button v-if="!store.getCurrentRoom.data.loadGame" @click="startGame()">
          <strong>Commencer une partie</strong>
        </button>

        <button v-else @click="() => stopGame()">
          <strong>Mettre fin à la partie</strong>
        </button>

        <button
          v-if="store.getCurrentRoom.data.loadGame"
          @click="() => refreshGame()"
        >
          <strong>Recommencer une partie</strong>
        </button>
      </div>

      <!-- Settings / Score / Players -->
      <div class="center w-100-vw py-1 my-1">
        <div class="w-100">
          <h3>Player 1</h3>
          <div class="w-100">
            <div class="justify_around w-100" v-if="checkPlayerExist(1)">
              <h4>@{{ getPlayer(1).username }}</h4>
              <h3>
                {{ getPlayer(1).points }}
              </h3>

              <div>
                <div class="online">
                  <div
                    :class="`front ${
                      checkPlayer().sessionID ===
                      store.getCurrentRoom.players[0].sessionID
                        ? 'jump'
                        : ''
                    }`"
                  />
                  <div
                    :class="
                      checkPlayer().sessionID ===
                      store.getCurrentRoom.players[0].sessionID
                        ? 'shadow'
                        : ''
                    "
                  />
                </div>
              </div>
            </div>
            <h5 v-else>En attente ...</h5>
          </div>
        </div>

        <div>
          <h2 style="font-size: 35px">VS</h2>
        </div>

        <div class="w-100">
          <h3>Player 2</h3>
          <div v-if="checkPlayerExist(2)">
            <div class="w-100">
              <div class="justify_around w-100">
                <div>
                  <div class="online">
                    <div
                      :class="`front ${
                        checkPlayer().sessionID ===
                        store.getCurrentRoom.players[1].sessionID
                          ? 'jump'
                          : ''
                      }`"
                    />
                    <div
                      :class="
                        checkPlayer().sessionID ===
                        store.getCurrentRoom.players[1].sessionID
                          ? 'shadow'
                          : ''
                      "
                    />
                  </div>
                </div>
                <h3>
                  {{ getPlayer(2).points }}
                </h3>
                <h4>@{{ getPlayer(2).username }}</h4>
              </div>
            </div>
          </div>
          <h5 v-else>En attente ...</h5>
        </div>
      </div>

      <!-- Game -->
      <div
        v-if="
          store.getCurrentRoom.data.loadGame &&
          store.getCurrentRoom.data.isActive
        "
        class="w-100"
      >
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
            <button v-if="isPlayer()" @click="() => action('roll')">
              <strong>Lancer le dé</strong>
            </button>
            <button v-if="isPlayer()" @click="() => action('hold')">
              <strong>Garder</strong>
            </button>
          </div>
          <div class="col center">
            <h2>
              {{ store.getCurrentRoom.data.currentScoreP2 }}
            </h2>
          </div>
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
import { watch } from "vue";

export default {
  name: "DiceGame",
  setup() {
    const store = useStore();
    const router = useRouter();
    const route = useRoute();
    const dice = [dice1, dice2, dice3, dice4, dice5, dice6];

    watch(
      () => store.getCurrentRoom.message,
      (val) => {
        notify({
          title: val,
        });
      }
    );

    return {
      store,
      dice,
      // Joueur (client)
      getPlayer(n) {
        return store.getCurrentRoom.players[n - 1];
      },
      checkLoaded() {
        if (store.getCurrentRoom.players) {
          return store.getCurrentRoom.players.length >= 1 ? true : false;
        } else {
          return setTimeout(
            () => (store.getCurrentRoom.players.length >= 1 ? true : false),
            1500
          );
        }
      },
      checkPlayerExist(n) {
        return store.getCurrentRoom.players[n - 1] ? true : false;
      },
      startGame() {
        S.socket.emit("startGame", {
          ...store.getCurrentRoom,
          message: "Début de parti au joueurs 1 de commencer !",
          data: {
            ...store.getCurrentRoom.data,
            loadGame: true,
            isActive: true,
            gameOver: false,
            currentPlayer: 1,
            roundScore: 0,
            dice: 0,
            currentScore: [],
            currentScoreP1: 0,
            currentScoreP2: 0,
            players: [
              {
                ...store.getCurrentRoom.players[0],
                id: 1,
                point: 0,
              },
              {
                ...store.getCurrentRoom.players[1],
                id: 2,
                point: 0,
              },
            ],
          },
        });
      },

      stopGame() {
        S.socket.emit("stop", {
          ...store.getCurrentRoom,
          message: "Room fermé !",
        });
        router.push("/" + store.getCurrentRoom.status);
      },

      refreshGame() {
        // Change currentPlayer
        S.socket.emit("refresh", {
          ...store.getCurrentRoom,
          data: {
            ...store.getCurrentRoom.data,
            loadGame: true,
            isActive: true,
            dice: 0,
            roundScore: 0,
            currentPlayer: store.getCurrentRoom.data.currentPlayer,
            currentScoreP1: 0,
            currentScoreP2: 0,
          },
        });
      },

      action(action) {
        // Check player
        if (!store.getCurrentRoom.data.isActive) {
          notify({
            title: "Partie en attente ou terminé !",
          });
        } else if (!this.checkCurrentPlayer()) {
          notify({
            title: "Ce n'est pas à vous de jouer",
          });
          // Si la partie est active (Déja un gagnant)
        } else {
          switch (action) {
            case "roll":
              this.roll();
              break;

            case "hold":
              this.hold();
              break;

            default:
              break;
          }
        }
      },

      roll() {
        store.getCurrentRoom.data.dice = Math.floor(Math.random() * 6) + 1;

        // Si le dé n'est pas égale à 1
        if (store.getCurrentRoom.data.dice !== 1) {
          // roundScor += dice
          store.getCurrentRoom.data.roundScore +=
            store.getCurrentRoom.data.dice;

          S.socket.emit("action", { ...store.getCurrentRoom });
        } else {
          store.getCurrentRoom.data.roundScore = 0;
          this.togglePlayer();
          S.socket.emit("action", { ...store.getCurrentRoom });
        }
      },

      hold() {
        store.getCurrentRoom.data[
          "currentScoreP" + store.getCurrentRoom.data.currentPlayer
        ] += store.getCurrentRoom.data.roundScore;

        this.checkWinner();
      },

      checkWinner() {
        // Check Winner
        if (
          store.getCurrentRoom.data[
            "currentScoreP" + store.getCurrentRoom.data.currentPlayer
          ] >= 10
        ) {
          // message (room)
          const winner =
            store.getCurrentRoom.players[
              store.getCurrentRoom.data.currentPlayer - 1
            ];

          store.getCurrentRoom.data.isActive = false;
          // Ajouter 1 point au joueur qui a gagné
          store.getCurrentRoom.players[
            store.getCurrentRoom.data.currentPlayer - 1
          ].points++;
          // Store dice
          store.getCurrentRoom.data.roundScore = 0;
          // Change CurrentPlayer (room)
          store.getCurrentRoom.data.currentPlayer =
            store.getCurrentRoom.data.currentPlayer === 1
              ? (store.getCurrentRoom.data.currentPlayer = 2)
              : (store.getCurrentRoom.data.currentPlayer = 1);

          S.socket.emit("winner", {
            ...store.getCurrentRoom,
            message: `${winner.username} à gagner 🎉 !`,
          });
          return true;
        } else {
          this.togglePlayer();
          S.socket.emit("action", { ...store.getCurrentRoom });
          return false;
        }
      },

      // Joueur a qui c'est le tour de jouer
      checkCurrentPlayer() {
        return store.getCurrentPlayer.sessionID ===
          store.getCurrentRoom.players[
            store.getCurrentRoom.data.currentPlayer - 1
          ].sessionID
          ? true
          : false;
      },

      // Joueur (client)
      checkPlayer() {
        return store.getCurrentRoom.data.currentPlayer
          ? store.getCurrentRoom.players[
              store.getCurrentRoom.data.currentPlayer - 1
            ]
          : false;
      },
      // Author (client)
      isAuthor() {
        return store.getCurrentRoom.author.sessionID ===
          store.getCurrentPlayer.sessionID
          ? true
          : false;
      },

      isPlayer() {
        const user = store.getCurrentRoom.players.find((u) => {
          if (u.sessionID === store.getCurrentPlayer.sessionID) return true;
        });
        return user ? true : false;
      },

      copyToClipPart() {
        navigator.clipboard.writeText(window.location.href);
        notify({
          title: route.fullPath + " copied",
        });
      },

      togglePlayer() {
        store.getCurrentRoom.data.currentPlayer === 1
          ? (store.getCurrentRoom.data.currentPlayer = 2)
          : (store.getCurrentRoom.data.currentPlayer = 1);

        store.getCurrentRoom.data.roundScore = 0;
        store.getCurrentRoom.message = `à ${
          store.getCurrentRoom.players[
            store.getCurrentRoom.data.currentPlayer - 1
          ].username
        } de jouer !`;
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
    top: -20px;
  }
  100% {
    top: 0;
  }
}

.online {
  margin: auto;
  position: relative;
  bottom: 0;
  left: 0;
  right: 0;
  top: 0;
  height: 35px;
  width: 35px;
}

.online .front,
.online .back {
  position: relative;
  height: 20px;
  width: 20px;
  bottom: 20px;
  background: greenyellow;
  border-radius: 50%;
  border-top: 7px solid var(--color-gray-light);
  border-left: 7px solid var(--color-gray-light);
  border-right: 7px solid var(--color-gray-dark);
  border-bottom: 7px solid var(--color-gray-dark);
  transform: rotate(0deg);
}

.online .shadow {
  width: 100%;
  height: 10px;
  background: rgba(0, 0, 0, 0.4);
  border-radius: 50%;
  z-index: -1;
  animation: swift 1.5s infinite ease;
}

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