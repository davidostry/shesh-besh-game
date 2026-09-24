
import {
    registerRoomHandlers,
    closeRoom
} from "../rooms/roomHandlers.js";

import {
    registerGameHandlers
} from "../game/gameHandlers.js";

import {
    getSocketRoom,
    getRoom,
    deleteSocketRoom
} from "../rooms/rooms.js";

export function registerSocketHandlers(io) {
    io.on("connection", (socket) => {
        console.log("Player connected:", socket.id);

        registerRoomHandlers(io, socket);

        registerGameHandlers(io, socket);

        socket.on("disconnect", () => {
            console.log(
                "Player disconnected:",
                socket.id
            );

            const roomCode =
                getSocketRoom(socket.id);

            if (!roomCode) {
                return;
            }

            const room =
                getRoom(roomCode);

            if (!room) {
                deleteSocketRoom(socket.id);
                return;
            }

            closeRoom(
                io,
                room,
                "player_disconnected"
            );
        });
    });
}
