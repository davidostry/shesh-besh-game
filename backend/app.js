
import express from 'express';
import { createServer } from 'http';
import {Server} from 'socket.io'


const app = express()
const server = createServer(app)
const io = new Server(server, {cors:{origin:"http://localhost:5173"}});

io.on("connect", (user)=>{
    console.log("player connected", user.id);
    
})

io.on("disconnect", (user)=>{
    console.log("player disconnected", user.id);
})

server.listen(8080, ()=>{
    console.log("server is runing on http:localhost:8080");
    
})