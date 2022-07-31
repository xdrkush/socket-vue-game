import { createApp, markRaw } from 'vue';
import { createPinia } from 'pinia'

// import store from './store';
import App from './App.vue';
import router from './router/index';
import SocketioService from './boot/socket.io'
import Notifications from '@kyvg/vue3-notification'

const pinia = createPinia()

const app = createApp(App)

const socket = SocketioService.setupSocketConnection();

pinia.use(({store}) => {
    store.$router = markRaw(router)
})

// console.log('main', socket)

app
    .use(router)
    .use(pinia)
    .use(socket)
    .use(Notifications)
    .mount('#app')