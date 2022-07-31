import { io } from 'socket.io-client';

const URL = "http://192.168.1.14:3000"

class SocketioService {
    socket;
    constructor() { }

    setupSocketConnection() {
        this.socket = io(URL, {
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