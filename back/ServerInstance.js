import express from 'express';
import cors from 'cors';
import path from 'path';
import http from 'http';
import { Server } from "socket.io";
import SocketInstance from './SocketInstance.js';
import session from "express-session";
import sharedsession from 'express-socket.io-session';

const app = express();

const sess = session({
    secret: "my-secret",
    resave: true,
    saveUninitialized: true
})
export default class ServerInstance extends SocketInstance {
    constructor() {
        super();
        this.app = app;
        this.server = http.createServer(app);
        this.io = new Server(this.server, {
            cors: {
                origin: "http://0.0.0.0",
                methods: ["GET", "POST"],
                allowedHeaders: ["headercustom"],
                credentials: true
            }
        });
    }

    runServer() {
        // Headers
        this.app.use((req, res, next) => {
            res.header('Access-Control-Allow-Origin', '*');
            // res.header('Access-Control-Allow-Headers', '*');
            res.header('Access-Control-Allow-Credentials', true);
            res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
            next();
        });

        // Cors
        this.app.use(cors({
            origin: "*",
            // origin: [
            //     'http://localhost:8080', 'http://localhost:3000', 'http://localhost', 'http://172.20.0.1',
            //     `http://${process.env.DOMAIN}`, `https://${process.env.DOMAIN}`, `http://www.${process.env.DOMAIN}`, `https://www.${process.env.DOMAIN}`
            // ],
            methods: ['GET', 'POST', 'PUT', 'DELETE'],
            credentials: true
        }))

        this.app.use(sess)

        this.io.use(sharedsession(sess));
        
        // app.use(express.static(path.join('dist')));

        // app.get('/', (req, res) => {
        //   res.sendFile('./dist/index.html');
        // });

        this.server.listen(3000, () => {
            console.log('listening on *:3000');
        });

    }

}