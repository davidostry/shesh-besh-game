import { useState } from "react";

import { socket } from "../socket";

import type {
    Room as RoomType,
    SocketResponse
} from "../types/room";

type GameRoomProps = {
    room: RoomType;
    onLeave: () => void;
};

function GameRoom({
    room,
    onLeave
}: GameRoomProps) {
    const [error, setError] =
        useState("");

    function startGame() {
        setError("");

        socket.emit(
            "game:start",
            (
                response: SocketResponse
            ) => {
                if (!response.success) {
                    setError(
                        response.error?.message ??
                        "לא ניתן להתחיל את המשחק"
                    );
                }
            }
        );
    }

    function rollDice() {
        setError("");

        socket.emit(
            "game:roll",
            (
                response: SocketResponse
            ) => {
                if (!response.success) {
                    setError(
                        response.error?.message ??
                        "לא ניתן לזרוק קוביות"
                    );
                }
            }
        );
    }

    function leaveRoom() {
        setError("");

        socket.emit(
            "room:leave",
            (
                response: SocketResponse
            ) => {
                if (!response.success) {
                    setError(
                        response.error?.message ??
                        "לא ניתן לעזוב את החדר"
                    );

                    return;
                }

                onLeave();
            }
        );
    }

    const canStart =
        room.players.length === 2 &&
        room.status === "waiting" &&
        room.yourColor === "white";

    const game = room.game;

    const isMyTurn =
        game?.currentPlayer ===
        room.yourColor;

    const canRoll =
        game?.status ===
            "waiting-for-roll" &&
        isMyTurn;

    return (
        <div>
            <h2>
                חדר משחק
            </h2>

            <p>
                קוד חדר:
            </p>

            <h1>
                {room.id}
            </h1>

            <p>
                הצבע שלך:{" "}
                {room.yourColor}
            </p>

            <p>
                סטטוס:{" "}
                {room.status}
            </p>

            <h3>
                שחקנים
            </h3>

            {room.players.map(
                (player) => (
                    <p
                        key={
                            player.name +
                            player.color
                        }
                    >
                        {player.name} -{" "}
                        {player.color}
                    </p>
                )
            )}

            {room.players.length <
                2 && (
                <p>
                    ממתינים לשחקן נוסף...
                </p>
            )}

            {room.players.length ===
                2 &&
                room.status ===
                    "waiting" && (
                    <p>
                        שני שחקנים בחדר
                    </p>
                )}

            {canStart && (
                <button
                    onClick={startGame}
                >
                    התחל משחק
                </button>
            )}

            {room.players.length ===
                2 &&
                room.status ===
                    "waiting" &&
                room.yourColor !==
                    "white" && (
                <p>
                    ממתינים לבעל החדר
                    להתחיל את המשחק...
                </p>
            )}

            {game && (
                <div>
                    <h2>
                        המשחק התחיל!
                    </h2>

                    <p>
                        התור של:{" "}
                        {game.currentPlayer}
                    </p>

                    <p>
                        מצב המשחק:{" "}
                        {game.status}
                    </p>

                    <p>
                        קוביות:
                    </p>

                    <p>
                        {game.dice.length > 0
                            ? game.dice.join(
                                " - "
                            )
                            : "עדיין לא נזרקו"}
                    </p>

                    {canRoll && (
                        <button
                            onClick={rollDice}
                        >
                            זרוק קוביות
                        </button>
                    )}

                    {!isMyTurn &&
                        game.status ===
                            "waiting-for-roll" && (
                            <p>
                                ממתינים לתור
                                של השחקן השני...
                            </p>
                        )}

                    {isMyTurn &&
                        game.status ===
                            "waiting-for-move" && (
                            <p>
                                עכשיו תורך לבצע
                                מהלך
                            </p>
                        )}
                </div>
            )}

            {error && (
                <p>
                    {error}
                </p>
            )}

            <button
                onClick={leaveRoom}
            >
                עזוב חדר
            </button>
        </div>
    );
}

export default GameRoom;