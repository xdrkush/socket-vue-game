export default class ChatInstance {
    constructor (io) {
        this.io = io
    }

    sendMessage (message) {
        console.log('sendMessage', message, this)
    }
}
