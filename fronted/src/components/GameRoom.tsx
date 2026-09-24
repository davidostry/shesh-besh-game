
import { useState } from "react";

import { socket } from "../socket";

import Board from "./Board";

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

    const [selectedDie, setSelectedDie] =
        useState<number | null>(null);

    const [selectedPoint, setSelectedPoint] =
        useState<number | null>(null);

    const [selectedBar, setSelectedBar] =
        useState(false);

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
        setSelectedDie(null);
        setSelectedPoint(null);
        setSelectedBar(false);

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

    function selectDie(
        die: number
    ) {
        setSelectedDie(die);
        setSelectedPoint(null);
        setSelectedBar(false);
        setError("");
    }

    function handlePointClick(
        index: number
    ) {
        setError("");

        if (!game) {
            return;
        }

        if (!isMyTurn) {
            setError(
                "זה לא התור שלך"
            );

            return;
        }

        if (selectedDie === null) {
            setError(
                "בחר קובייה קודם"
            );

            return;
        }

        const possibleMoves =
            game.legalMoves.filter(
                (move) =>
                    move.die === selectedDie
            );

        if (
            selectedPoint === null &&
            !selectedBar
        ) {
            const canStartFromHere =
                possibleMoves.some(
                    (move) =>
                        move.from === index
                );

            if (!canStartFromHere) {
                setError(
                    "אין מהלך חוקי מהנקודה הזאת"
                );

                return;
            }

            setSelectedPoint(index);

            return;
        }

        const from =
            selectedBar
                ? "bar"
                : selectedPoint;

        const move =
            possibleMoves.find(
                (possibleMove) =>
                    possibleMove.from ===
                        from &&
                    possibleMove.to ===
                        index
            );

        if (!move) {
            setError(
                "היעד הזה אינו חוקי"
            );

            return;
        }

        socket.emit(
            "game:move",
            {
                from: move.from,
                to: move.to,
                die: move.die
            },
            (
                response: SocketResponse
            ) => {
                if (!response.success) {
                    setError(
                        response.error?.message ??
                        "מהלך לא חוקי"
                    );

                    return;
                }

                setSelectedDie(null);
                setSelectedPoint(null);
                setSelectedBar(false);
            }
        );
    }

    function handleBarClick() {
        setError("");

        if (!game) {
            return;
        }

        if (!isMyTurn) {
            setError(
                "זה לא התור שלך"
            );

            return;
        }

        if (selectedDie === null) {
            setError(
                "בחר קובייה קודם"
            );

            return;
        }

        if (
            !room.yourColor ||
            game.bar[
                room.yourColor
            ] === 0
        ) {
            setError(
                "אין לך חייל ב-Bar"
            );

            return;
        }

        const canEnter =
            game.legalMoves.some(
                (move) =>
                    move.from === "bar" &&
                    move.die ===
                        selectedDie
            );

        if (!canEnter) {
            setError(
                "אי אפשר להיכנס מה-Bar עם הקובייה הזאת"
            );

            return;
        }

        setSelectedBar(true);
        setSelectedPoint(null);
    }

    function handleOffClick() {
        setError("");

        if (!game) {
            return;
        }

        if (!isMyTurn) {
            setError(
                "זה לא התור שלך"
            );

            return;
        }

        if (selectedDie === null) {
            setError(
                "בחר קובייה קודם"
            );

            return;
        }

        if (selectedPoint === null) {
            setError(
                "בחר קודם חייל להוצאה"
            );

            return;
        }

        const move =
            game.legalMoves.find(
                (possibleMove) =>
                    possibleMove.from ===
                        selectedPoint &&
                    possibleMove.to ===
                        "off" &&
                    possibleMove.die ===
                        selectedDie
            );

        if (!move) {
            setError(
                "אי אפשר להוציא את החייל עם הקובייה הזאת"
            );

            return;
        }

        socket.emit(
            "game:move",
            {
                from: move.from,
                to: move.to,
                die: move.die
            },
            (
                response: SocketResponse
            ) => {
                if (!response.success) {
                    setError(
                        response.error?.message ??
                        "מהלך לא חוקי"
                    );

                    return;
                }

                setSelectedDie(null);
                setSelectedPoint(null);
                setSelectedBar(false);
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

    const possibleMoves =
        game &&
        selectedDie !== null
            ? game.legalMoves.filter(
                (move) =>
                    move.die ===
                    selectedDie
            )
            : [];

    const legalFromPoints =
        selectedDie !== null &&
        selectedPoint === null &&
        !selectedBar
            ? [
                ...new Set(
                    possibleMoves
                        .filter(
                            (move) =>
                                typeof move.from ===
                                "number"
                        )
                        .map(
                            (move) =>
                                move.from as number
                        )
                )
            ]
            : [];

    const legalToPoints =
        selectedPoint !== null ||
        selectedBar
            ? [
                ...new Set(
                    possibleMoves
                        .filter(
                            (move) =>
                                move.from ===
                                    selectedPoint ||
                                (
                                    selectedBar &&
                                    move.from ===
                                        "bar"
                                )
                        )
                        .filter(
                            (move) =>
                                typeof move.to ===
                                "number"
                        )
                        .map(
                            (move) =>
                                move.to as number
                        )
                )
            ]
            : [];

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

                    {game.dice.length > 0 ? (
                        <div>
                            {game.remainingDice.map(
                                (
                                    die,
                                    index
                                ) => (
                                    <button
                                        key={
                                            index
                                        }
                                        onClick={() =>
                                            selectDie(
                                                die
                                            )
                                        }
                                        disabled={
                                            !isMyTurn ||
                                            game.status !==
                                                "waiting-for-move"
                                        }
                                    >
                                        {die}
                                    </button>
                                )
                            )}
                        </div>
                    ) : (
                        <p>
                            עדיין לא נזרקו
                        </p>
                    )}

                    {selectedDie !== null && (
                        <p>
                            הקובייה שנבחרה:{" "}
                            {selectedDie}
                        </p>
                    )}

                    {selectedPoint !== null && (
                        <p>
                            נקודת מוצא:{" "}
                            {selectedPoint + 1}
                        </p>
                    )}

                    {selectedBar && (
                        <p>
                            נבחר Bar
                        </p>
                    )}

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

                    <Board
                        board={game.board}
                        yourColor={
                            room.yourColor
                        }
                        selectedPoint={
                            selectedPoint
                        }
                        legalFromPoints={
                            legalFromPoints
                        }
                        legalToPoints={
                            legalToPoints
                        }
                        onPointClick={
                            handlePointClick
                        }
                        bar={game.bar}
                        borneOff={
                            game.borneOff
                        }
                        onBarClick={
                            handleBarClick
                        }
                        onOffClick={
                            handleOffClick
                        }
                    />
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
