
import { useEffect, useState } from "react";

import { socket } from "./Socket"

type RoomPlayer = {
    name: string;
    color: "white" | "black";
};

type Room = {
    id: string;
    status: "waiting" | "playing" | "finished";
    players: RoomPlayer[];
    game: unknown;
    rematchAcceptedBy: string[];
    yourColor?: "white" | "black";
};

function App() {
    const [name, setName] = useState("");
    const [room, setRoom] = useState<Room | null>(null);
    const [error, setError] = useState("");
    const [connected, setConnected] = useState(
        socket.connected
    );

    useEffect(() => {
        function handleConnect() {
            setConnected(true);
            setError("");

            console.log(
                "Connected:",
                socket.id
            );
        }

        function handleDisconnect() {
            setConnected(false);

            console.log(
                "Disconnected"
            );
        }

        function handleRoomState(
            newRoom: Room
        ) {
            console.log(
                "Room state:",
                newRoom
            );

            setRoom(newRoom);
        }

        socket.on(
            "connect",
            handleConnect
        );

        socket.on(
            "disconnect",
            handleDisconnect
        );

        socket.on(
            "room:state",
            handleRoomState
        );

        return () => {
            socket.off(
                "connect",
                handleConnect
            );

            socket.off(
                "disconnect",
                handleDisconnect
            );

            socket.off(
                "room:state",
                handleRoomState
            );
        };
    }, []);

    function createRoom() {
        setError("");

        const trimmedName =
            name.trim();

        if (!trimmedName) {
            setError(
                "יש להכניס שם"
            );

            return;
        }

        socket.emit(
            "room:create",
            {
                name: trimmedName
            },
            (
                response: {
                    success: boolean;
                    room?: Room;
                    error?: {
                        code: string;
                        message: string;
                    };
                }
            ) => {
                console.log(
                    "Create room response:",
                    response
                );

                if (!response.success) {
                    setError(
                        response.error?.message ??
                        "אירעה שגיאה"
                    );

                    return;
                }

                if (response.room) {
                    setRoom(
                        response.room
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
                response: {
                    success: boolean;
                    error?: {
                        code: string;
                        message: string;
                    };
                }
            ) => {
                if (!response.success) {
                    setError(
                        response.error?.message ??
                        "אירעה שגיאה"
                    );

                    return;
                }

                setRoom(null);
            }
        );
    }

    if (room) {
        return (
            <div>
                <h1>
                    שש בש אונליין
                </h1>

                <h2>
                    החדר נוצר
                </h2>

                <p>
                    קוד חדר:
                </p>

                <h1>
                    {room.id}
                </h1>

                <p>
                    השם שלך:{" "}
                    {room.players[0]?.name}
                </p>

                <p>
                    הצבע שלך:{" "}
                    {room.yourColor}
                </p>

                <p>
                    שחקנים בחדר:{" "}
                    {room.players.length}
                </p>

                <p>
                    סטטוס:{" "}
                    {room.status}
                </p>

                <button
                    onClick={leaveRoom}
                >
                    עזוב חדר
                </button>
            </div>
        );
    }

    return (
        <div>
            <h1>
                שש בש אונליין
            </h1>

            <p>
                חיבור לשרת:{" "}
                {connected
                    ? "מחובר"
                    : "לא מחובר"}
            </p>

            <h2>
                יצירת חדר
            </h2>

            <input
                type="text"
                placeholder="הכנס שם"
                value={name}
                onChange={(event) =>
                    setName(
                        event.target.value
                    )
                }
            />

            <button
                onClick={createRoom}
                disabled={!connected}
            >
                צור חדר
            </button>

            {error && (
                <p>
                    {error}
                </p>
            )}
        </div>
    );
}

export default App;
