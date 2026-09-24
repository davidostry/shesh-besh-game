
import { useEffect, useState } from "react";

import { socket } from "./socket";

import Lobby from "./components/Lobby";
import Room from "./components/Room";

import type { Room as RoomType } from "./types/room";

function App() {
    const [room, setRoom] =
        useState<RoomType | null>(null);

    const [connected, setConnected] =
        useState(socket.connected);

    const [error, setError] =
        useState("");

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
            newRoom: RoomType
        ) {
            console.log(
                "Room state:",
                newRoom
            );

            setRoom(newRoom);
        }

        function handleRoomClosed(
            data: {
                reason: string;
            }
        ) {
            console.log(
                "Room closed:",
                data
            );

            setRoom(null);

            setError(
                "החדר נסגר"
            );
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

        socket.on(
            "room:closed",
            handleRoomClosed
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

            socket.off(
                "room:closed",
                handleRoomClosed
            );
        };
    }, []);

    function handleRoomCreated(
        newRoom: RoomType
    ) {
        setRoom(newRoom);
        setError("");
    }

    function handleLeave() {
        setRoom(null);
        setError("");
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

            {error && (
                <p>
                    {error}
                </p>
            )}

            {!room ? (
                <Lobby
                    connected={connected}
                    onRoomCreated={
                        handleRoomCreated
                    }
                />
            ) : (
                <Room
                    room={room}
                    onLeave={
                        handleLeave
                    }
                />
            )}
        </div>
    );
}

export default App;
