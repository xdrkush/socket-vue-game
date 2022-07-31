import { io } from 'socket.io-client';

console.log('socket.io', process.env)
const { VUE_APP_DOMAIN } = process.env
class SocketioService {
    socket;
    constructor() {}

    setupSocketConnection() {
        this.socket = io(VUE_APP_DOMAIN, {
            path: '/sosocket',
            transports: ["websocket"],
            withCredentials: true,
            extraHeaders: {
                "headercustom": "abcd"
            }
        })

        return this.socket;
    }
}

export default new SocketioService();