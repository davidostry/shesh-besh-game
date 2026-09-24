
import express from "express";
import cors from "cors";
import { createServer } from "http";
import { Server } from "socket.io";

import { registerSocketHandlers } from "./socket/handlers.js";

const app = express();

app.use(cors());
app.use(express.json());

const server = createServer(app);

const io = new Server(server, {
    cors: {
        origin: "http://localhost:5173",
        methods: ["GET", "POST"]
    }
});

app.get("/", (req, res) => {
    res.json({
        message: "Backgammon server is running"
    });
});

registerSocketHandlers(io);

const PORT = 8080;

server.listen(PORT, () => {
    console.log(
        `Server running on http://localhost:${PORT}`
    );
});
