
import {
    getRoom,
    getSocketRoom
} from "../rooms/rooms.js";

import {
    createGame,
    startGame,
    rollGameDice,
    makeGameMove,
    getLegalMoves
} from "./game.js";

import {
    emitRoomState
} from "../rooms/roomHandlers.js";

export function emitGameState(io, room) {
    if (!room.game) {
        return;
    }

    for (const player of room.players) {
        const legalMoves =
            player.color ===
            room.game.currentPlayer
                ? getLegalMoves(room.game)
                : [];

        io.to(player.socketId).emit(
            "game:state",
            {
                board: room.game.board,
                currentPlayer:
                    room.game.currentPlayer,
                dice: room.game.dice,
                remainingDice:
                    room.game.remainingDice,
                bar: room.game.bar,
                borneOff:
                    room.game.borneOff,
                status:
                    room.game.status,
                winner:
                    room.game.winner,
                legalMoves
            }
        );
    }
}

export function emitGameAndRoomState(
    io,
    room
) {
    emitRoomState(io, room);
    emitGameState(io, room);
}

function startRematch(room) {
    const whitePlayer =
        room.players.find(
            (player) =>
                player.color === "white"
        );

    const blackPlayer =
        room.players.find(
            (player) =>
                player.color === "black"
        );

    if (
        !whitePlayer ||
        !blackPlayer
    ) {
        return false;
    }

    whitePlayer.color = "black";
    blackPlayer.color = "white";

    room.game = createGame();

    startGame(room.game);

    room.status = "playing";

    room.rematchAcceptedBy = [];

    return true;
}

export function registerGameHandlers(
    io,
    socket
) {
    socket.on(
        "game:start",
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
                return callback({
                    success: false,
                    error: {
                        code: "room_not_found",
                        message:
                            "Room not found"
                    }
                });
            }

            if (
                room.ownerSocketId !==
                socket.id
            ) {
                return callback({
                    success: false,
                    error: {
                        code: "not_owner",
                        message:
                            "Only the room owner can start the game"
                    }
                });
            }

            if (
                room.players.length !== 2
            ) {
                return callback({
                    success: false,
                    error: {
                        code:
                            "not_enough_players",
                        message:
                            "Exactly two players are required"
                    }
                });
            }

            if (
                room.status !== "waiting"
            ) {
                return callback({
                    success: false,
                    error: {
                        code:
                            "game_already_started",
                        message:
                            "Game has already started"
                    }
                });
            }

            room.game = createGame();

            startGame(room.game);

            room.status = "playing";

            callback({
                success: true
            });

            emitGameAndRoomState(
                io,
                room
            );
        }
    );

    socket.on(
        "game:roll",
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
                return callback({
                    success: false,
                    error: {
                        code: "room_not_found",
                        message:
                            "Room not found"
                    }
                });
            }

            if (!room.game) {
                return callback({
                    success: false,
                    error: {
                        code:
                            "game_not_started",
                        message:
                            "Game has not started"
                    }
                });
            }

            if (
                room.game.status ===
                "finished"
            ) {
                return callback({
                    success: false,
                    error: {
                        code:
                            "game_finished",
                        message:
                            "Game is finished"
                    }
                });
            }

            const player =
                room.players.find(
                    (player) =>
                        player.socketId ===
                        socket.id
                );

            if (!player) {
                return callback({
                    success: false,
                    error: {
                        code:
                            "not_in_game",
                        message:
                            "Player is not in this game"
                    }
                });
            }

            if (
                room.game.currentPlayer !==
                player.color
            ) {
                return callback({
                    success: false,
                    error: {
                        code:
                            "not_your_turn",
                        message:
                            "It is not your turn"
                    }
                });
            }

            const result =
                rollGameDice(
                    room.game
                );

            if (!result.success) {
                return callback({
                    success: false,
                    error: {
                        code:
                            "cannot_roll",
                        message:
                            result.error
                    }
                });
            }

            callback({
                success: true,
                dice: result.dice
            });

            emitGameAndRoomState(
                io,
                room
            );
        }
    );

    socket.on(
        "game:move",
        (data, callback) => {
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
                return callback({
                    success: false,
                    error: {
                        code: "room_not_found",
                        message:
                            "Room not found"
                    }
                });
            }

            if (!room.game) {
                return callback({
                    success: false,
                    error: {
                        code:
                            "game_not_started",
                        message:
                            "Game has not started"
                    }
                });
            }

            if (
                room.game.status ===
                "finished"
            ) {
                return callback({
                    success: false,
                    error: {
                        code:
                            "game_finished",
                        message:
                            "Game is finished"
                    }
                });
            }

            const player =
                room.players.find(
                    (player) =>
                        player.socketId ===
                        socket.id
                );

            if (!player) {
                return callback({
                    success: false,
                    error: {
                        code:
                            "not_in_game",
                        message:
                            "Player is not in this game"
                    }
                });
            }

            if (
                room.game.currentPlayer !==
                player.color
            ) {
                return callback({
                    success: false,
                    error: {
                        code:
                            "not_your_turn",
                        message:
                            "It is not your turn"
                    }
                });
            }

            const result =
                makeGameMove(
                    room.game,
                    data?.from,
                    data?.to,
                    data?.die
                );

            if (!result.success) {
                return callback({
                    success: false,
                    error: {
                        code:
                            "invalid_move",
                        message:
                            result.error
                    }
                });
            }

            if (result.finished) {
                room.status = "finished";
            }

            callback({
                success: true
            });

            emitGameAndRoomState(
                io,
                room
            );

            if (result.finished) {
                const winner =
                    room.players.find(
                        (player) =>
                            player.color ===
                            result.winner
                    );

                io.to(room.id).emit(
                    "game:finished",
                    {
                        winnerColor:
                            result.winner,
                        winnerName:
                            winner?.name ??
                            null
                    }
                );
            }
        }
    );

    socket.on(
        "game:request-rematch",
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
                return callback({
                    success: false,
                    error: {
                        code: "room_not_found",
                        message:
                            "Room not found"
                    }
                });
            }

            if (
                room.status !==
                "finished"
            ) {
                return callback({
                    success: false,
                    error: {
                        code:
                            "game_not_finished",
                        message:
                            "Game is not finished"
                    }
                });
            }

            if (
                room.rematchAcceptedBy.includes(
                    socket.id
                )
            ) {
                return callback({
                    success: false,
                    error: {
                        code:
                            "already_requested",
                        message:
                            "Rematch already requested"
                    }
                });
            }

            room.rematchAcceptedBy.push(
                socket.id
            );

            callback({
                success: true
            });

            if (
                room.rematchAcceptedBy
                    .length === 2
            ) {
                const started =
                    startRematch(room);

                if (!started) {
                    return;
                }

                emitGameAndRoomState(
                    io,
                    room
                );

                return;
            }

            emitRoomState(
                io,
                room
            );
        }
    );
}
