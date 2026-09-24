import { useEffect, useState } from "react";

import { socket } from "./socket";

import Lobby from "./components/Lobby";
import GameRoom from "./components/GameRoom";

import type { Room } from "./types/room";

function App() {
    const [connected, setConnected] =
        useState(socket.connected);

    const [room, setRoom] =
        useState<Room | null>(null);

    useEffect(() => {
        function onConnect() {
            setConnected(true);
        }

        function onDisconnect() {
            setConnected(false);
        }

        function onRoomState(
            newRoom: Room
        ) {
            setRoom(newRoom);
        }

        socket.on(
            "connect",
            onConnect
        );

        socket.on(
            "disconnect",
            onDisconnect
        );

        socket.on(
            "room:state",
            onRoomState
        );

        return () => {
            socket.off(
                "connect",
                onConnect
            );

            socket.off(
                "disconnect",
                onDisconnect
            );

            socket.off(
                "room:state",
                onRoomState
            );
        };
    }, []);

    function handleRoomCreated(
        newRoom: Room
    ) {
        setRoom(newRoom);
    }

    function handleLeave() {
        setRoom(null);
    }

    return (
        <div>
            {!connected && (
                <p>
                    מתחבר לשרת...
                </p>
            )}

            {connected && !room && (
                <Lobby
                    connected={connected}
                    onRoomCreated={
                        handleRoomCreated
                    }
                />
            )}

            {connected && room && (
                <GameRoom
                    room={room}
                    onLeave={handleLeave}
                />
            )}
        </div>
    );
}

export default App;