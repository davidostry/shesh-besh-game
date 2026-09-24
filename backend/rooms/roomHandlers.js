
import {
    createRoom,
    getSocketRoom,
    getRoom,
    setSocketRoom,
    deleteSocketRoom,
    deleteRoom
} from "./rooms.js";

export function getPlayerColor(room, socketId) {
    const player = room.players.find(
        (player) => player.socketId === socketId
    );

    return player?.color ?? null;
}

export function getPublicRoom(room, yourColor = null) {
    return {
        id: room.id,
        status: room.status,

        players: room.players.map((player) => ({
            name: player.name,
            color: player.color
        })),

        game: room.game
            ? {
                board: room.game.board,
                currentPlayer: room.game.currentPlayer,
                dice: room.game.dice,
                remainingDice: room.game.remainingDice,
                bar: room.game.bar,
                borneOff: room.game.borneOff,
                status: room.game.status,
                winner: room.game.winner
            }
            : null,

        rematchAcceptedBy:
            room.rematchAcceptedBy
                .map((socketId) =>
                    getPlayerColor(room, socketId)
                )
                .filter(Boolean),

        ...(yourColor
            ? { yourColor }
            : {})
    };
}

export function emitRoomState(io, room) {
    for (const player of room.players) {
        const playerColor = getPlayerColor(
            room,
            player.socketId
        );

        io.to(player.socketId).emit(
            "room:state",
            getPublicRoom(
                room,
                playerColor
            )
        );
    }
}

export function closeRoom(io, room, reason) {
    for (const player of room.players) {
        io.to(player.socketId).emit(
            "room:closed",
            {
                reason
            }
        );

        deleteSocketRoom(
            player.socketId
        );
    }

    deleteRoom(room.id);
}

export function registerRoomHandlers(io, socket) {
    socket.on(
        "room:create",
        (data, callback) => {
            const existingRoom =
                getSocketRoom(socket.id);

            if (existingRoom) {
                return callback({
                    success: false,
                    error: {
                        code: "already_in_room",
                        message:
                            "Socket is already in a room"
                    }
                });
            }

            const name =
                data?.name?.trim();

            if (!name) {
                return callback({
                    success: false,
                    error: {
                        code: "invalid_name",
                        message:
                            "Name is required"
                    }
                });
            }

            if (name.length > 20) {
                return callback({
                    success: false,
                    error: {
                        code: "invalid_name",
                        message:
                            "Name must be at most 20 characters"
                    }
                });
            }

            const room =
                createRoom(
                    socket.id,
                    name
                );

            socket.join(room.id);

            callback({
                success: true,
                room: getPublicRoom(
                    room,
                    "white"
                )
            });

            emitRoomState(
                io,
                room
            );
        }
    );

    socket.on(
        "room:join",
        (data, callback) => {
            const existingRoom =
                getSocketRoom(socket.id);

            if (existingRoom) {
                return callback({
                    success: false,
                    error: {
                        code: "already_in_room",
                        message:
                            "Socket is already in a room"
                    }
                });
            }

            const name =
                data?.name?.trim();

            if (!name) {
                return callback({
                    success: false,
                    error: {
                        code: "invalid_name",
                        message:
                            "Name is required"
                    }
                });
            }

            if (name.length > 20) {
                return callback({
                    success: false,
                    error: {
                        code: "invalid_name",
                        message:
                            "Name must be at most 20 characters"
                    }
                });
            }

            const roomCode =
                data?.roomCode
                    ?.trim()
                    .toUpperCase();

            if (!roomCode) {
                return callback({
                    success: false,
                    error: {
                        code: "invalid_room_code",
                        message:
                            "Room code is required"
                    }
                });
            }

            const room =
                getRoom(roomCode);

            if (!room) {
                return callback({
                    success: false,
                    error: {
                        code: "room_not_found",
                        message:
                            "Room not found"
                    }
                });
            }

            if (room.status !== "waiting") {
                return callback({
                    success: false,
                    error: {
                        code: "room_not_waiting",
                        message:
                            "Room is not waiting for players"
                    }
                });
            }

            if (room.players.length >= 2) {
                return callback({
                    success: false,
                    error: {
                        code: "room_full",
                        message:
                            "Room is full"
                    }
                });
            }

            const player = {
                socketId: socket.id,
                name,
                color: "black"
            };

            room.players.push(player);

            setSocketRoom(
                socket.id,
                room.id
            );

            socket.join(room.id);

            callback({
                success: true,
                room: getPublicRoom(
                    room,
                    "black"
                )
            });

            emitRoomState(
                io,
                room
            );
        }
    );

    socket.on(
        "room:leave",
        (callback) => {
            const roomCode =
                getSocketRoom(socket.id);

            if (!roomCode) {
                return callback({
                    success: false,
                    error: {
                        code: "not_in_room",
                        message:
                            "Socket is not in a room"
                    }
                });
            }

            const room =
                getRoom(roomCode);

            if (!room) {
                deleteSocketRoom(
                    socket.id
                );

                return callback({
                    success: true
                });
            }

            closeRoom(
                io,
                room,
                "player_left"
            );

            socket.leave(room.id);

            callback({
                success: true
            });
        }
    );
}
