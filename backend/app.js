
import express from "express";
import cors from "cors";
import { createServer } from "http";
import { Server } from "socket.io";

import {
    createRoom,
    getSocketRoom,
    getRoom,
    setSocketRoom
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

function getPublicRoom(room, yourColor = null) {
    return {
        id: room.id,
        status: room.status,
        players: room.players.map((player) => ({
            name: player.name,
            color: player.color
        })),
        game: room.game ?? null,
        rematchAcceptedBy: room.rematchAcceptedBy ?? [],
        ...(yourColor && { yourColor })
    };
}

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
            room: getPublicRoom(room, "white")
        });

        socket.emit(
            "room:state",
            getPublicRoom(room, "white")
        );

        console.log(`Room ${room.id} created by ${name}`);
    });

    socket.on("room:join", (data, callback) => {
        console.log("room:join received:", data);

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

        const roomCode = data?.roomCode
            ?.trim()
            .toUpperCase();

        if (!roomCode) {
            return callback({
                success: false,
                error: {
                    code: "invalid_room_code",
                    message: "Room code is required"
                }
            });
        }

        const room = getRoom(roomCode);

        if (!room) {
            return callback({
                success: false,
                error: {
                    code: "room_not_found",
                    message: "Room not found"
                }
            });
        }

        if (room.status !== "waiting") {
            return callback({
                success: false,
                error: {
                    code: "room_not_waiting",
                    message: "Room is not waiting for players"
                }
            });
        }

        if (room.players.length >= 2) {
            return callback({
                success: false,
                error: {
                    code: "room_full",
                    message: "Room is full"
                }
            });
        }

        const player = {
            socketId: socket.id,
            name,
            color: "black"
        };

        room.players.push(player);

        setSocketRoom(socket.id, room.id);

        socket.join(room.id);

        callback({
            success: true,
            room: getPublicRoom(room, "black")
        });

        const owner = room.players.find(
            (player) => player.color === "white"
        );

        if (owner) {
            io.to(owner.socketId).emit(
                "room:state",
                getPublicRoom(room, "white")
            );
        }

        socket.emit(
            "room:state",
            getPublicRoom(room, "black")
        );

        console.log(`${name} joined room ${room.id}`);
    });

    socket.on("disconnect", () => {
        console.log("Player disconnected:", socket.id);

        const roomCode = getSocketRoom(socket.id);

        if (!roomCode) {
            return;
        }

        const room = getRoom(roomCode);

        if (!room) {
            return;
        }

        console.log(
            `Player ${socket.id} disconnected from room ${room.id}`
        );
    });
});

const PORT = 8080;

server.listen(PORT, () => {
    console.log(
        `Server running on http://localhost:${PORT}`
    );
});
