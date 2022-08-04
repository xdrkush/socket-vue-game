<template>
  <div class="bg-dark txt-light bdr-primary">
    <!-- Chat -->
    <div
      v-if="store.getCurrentRoom.chat"
      class="bg-dark"
      style="
        min-height: 40vh;
        max-height: 60vh;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
      "
    >
      <!-- Message -->
      <div style="overflow: auto" class="pa-1">
        <div
          :key="index"
          v-for="(m, index) in store.getCurrentRoom.chat.messages"
        >
          <div
          class="py-1 w-100"
            :style="`
            display: flex;
            justify-content: ${
              m.author === store.getCurrentPlayer.username ? 'end' : 'start'
            };
          `"
          >
            <div
              class="bg-primary pa-1 txt-dark"
              :style="`
            width: 80%;
            border-radius: ${
              m.author === store.getCurrentPlayer.username
                ? '10px 10px 0 10px'
                : '10px 10px 10px 0'
            };
            text-align: ${
              m.author === store.getCurrentPlayer.username ? 'right' : 'left'
            };
          `"
            >
              <p>
                <strong>
                  {{
                    m.author === store.getCurrentPlayer.username
                      ? "Moi"
                      : m.author
                  }}:
                </strong>
              </p>
              <p>{{ m.text }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Input -->
      <form @submit="sendMessage" class="col" style="box-shadow: 0 0 10px">

        <div v-if="collapseEmoji" class="w-100 center wrap bdr-t-primary">
          <span :key="emoji" v-for="emoji in listEmoji" class="pa-1" @click="() => text += emoji">{{ emoji }}</span>
        </div>
        
        <div class="w-100 justify_around">
          <button @click="() => (collapseEmoji = !collapseEmoji)">🥳</button>
          <input
            type="text"
            v-model="text"
            placeholder="Écrivez votre message"
            class="w-100"
          />
          <button type="submit" style="width: 20%">
            <strong>Send</strong>
          </button>
        </div>
      </form>

    </div>

    <div v-else>Aucun chat</div>

  </div>
</template>

<script>
import { ref } from "vue";
import { useStore } from "../../stores/global.store";
import S from "../../boot/socket.io";
import { emoji } from "../../assets/utils"

export default {
  name: "Home",
  setup() {
    const store = useStore();
    const choosePlayer = ref("");
    const info = ref(false);
    const text = ref("");
    const collapseEmoji = ref(false);
    const listEmoji = ref([...emoji])

    return {
      store,
      choosePlayer,
      info,
      text,
      collapseEmoji,
      listEmoji,
      sendMessage(e) {
        e.preventDefault();
        console.log("sendMessageRoom", store.getCurrentPlayer, text.value);

        if (text.value.length <= 0) return;
        store.getCurrentRoom.chat.messages.push({
          author: store.getCurrentPlayer.username,
          authorID: store.getCurrentPlayer.sessionID,
          text: text.value,
        });
        S.socket.emit("sendMessageRoom", {
          room: store.getCurrentRoom,
        });
        text.value = "";
      },
    };
  },
};
</script>