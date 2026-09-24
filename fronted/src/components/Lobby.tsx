import { useState } from "react";

import { socket } from "../socket";

import type {
    Room,
    SocketResponse
} from "../types/room";

type LobbyProps = {
    connected: boolean;

    onRoomCreated: (
        room: Room
    ) => void;
};

function Lobby({
    connected,
    onRoomCreated
}: LobbyProps) {
    const [name, setName] =
        useState("");

    const [roomCode, setRoomCode] =
        useState("");

    const [error, setError] =
        useState("");

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
                response: SocketResponse
            ) => {
                if (!response.success) {
                    setError(
                        response.error?.message ??
                        "אירעה שגיאה"
                    );

                    return;
                }

                if (response.room) {
                    onRoomCreated(
                        response.room
                    );
                }
            }
        );
    }

    function joinRoom() {
        setError("");

        const trimmedName =
            name.trim();

        const trimmedRoomCode =
            roomCode
                .trim()
                .toUpperCase();

        if (!trimmedName) {
            setError(
                "יש להכניס שם"
            );

            return;
        }

        if (!trimmedRoomCode) {
            setError(
                "יש להכניס קוד חדר"
            );

            return;
        }

        socket.emit(
            "room:join",
            {
                name: trimmedName,
                roomCode:
                    trimmedRoomCode
            },
            (
                response: SocketResponse
            ) => {
                if (!response.success) {
                    setError(
                        response.error?.message ??
                        "אירעה שגיאה"
                    );

                    return;
                }

                if (response.room) {
                    onRoomCreated(
                        response.room
                    );
                }
            }
        );
    }

    return (
        <div>
            <h2>
                כניסה למשחק
            </h2>

            <input
                type="text"
                placeholder="השם שלך"
                value={name}
                onChange={(event) =>
                    setName(
                        event.target.value
                    )
                }
            />

            <br />
            <br />

            <button
                onClick={createRoom}
                disabled={!connected}
            >
                צור חדר
            </button>

            <hr />

            <h2>
                הצטרפות לחדר
            </h2>

            <input
                type="text"
                placeholder="קוד חדר"
                value={roomCode}
                onChange={(event) =>
                    setRoomCode(
                        event.target.value
                    )
                }
            />

            <br />
            <br />

            <button
                onClick={joinRoom}
                disabled={!connected}
            >
                הצטרף לחדר
            </button>

            {error && (
                <p>
                    {error}
                </p>
            )}
        </div>
    );
}

export default Lobby;