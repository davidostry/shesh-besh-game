import express from "express";
import cors from "cors";
import { createServer } from "http";
import { Server } from "socket.io";

import {
    createRoom,
    getSocketRoom
} from "./rooms/rooms.js";

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

io.on("connection", (socket) => {
    console.log("Player connected:", socket.id);

    socket.on("room:create", (data, callback) => {
        console.log("room:create received:", data);

        const existingRoom = getSocketRoom(socket.id);

        if (existingRoom) {
            return callback({
                success: false,
                error: {
                    code: "already_in_room",
                    message: "Socket is already in a room"
                }
            });
        }

        const name = data?.name?.trim();

        if (!name) {
            return callback({
                success: false,
                error: {
                    code: "invalid_name",
                    message: "Name is required"
                }
            });
        }

        if (name.length > 20) {
            return callback({
                success: false,
                error: {
                    code: "invalid_name",
                    message: "Name must be at most 20 characters"
                }
            });
        }

        const room = createRoom(socket.id, name);

        socket.join(room.id);

        callback({
            success: true,
            room: {
                id: room.id,
                status: room.status,
                players: room.players.map((player) => ({
                    name: player.name,
                    color: player.color
                })),
                yourColor: "white"
            }
        });

        console.log(`Room ${room.id} created by ${name}`);
    });

    socket.on("disconnect", () => {
        console.log("Player disconnected:", socket.id);
    });
});

const PORT = 8080;

server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});