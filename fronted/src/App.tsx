
import { useEffect, useState } from "react";

import { socket } from "./socket";

import Lobby from "./components/Lobby";
import GameRoom from "./components/GameRoom";

import type {
    Room,
    Game,
    SocketResponse
} from "./types/room";

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
            setRoom(null);
        }

        function onRoomState(
            newRoom: Room
        ) {
            setRoom(newRoom);
        }

        function onGameState(
            game: Game
        ) {
            setRoom((currentRoom) => {
                if (!currentRoom) {
                    return currentRoom;
                }

                return {
                    ...currentRoom,
                    game
                };
            });
        }

        function onRoomClosed() {
            setRoom(null);
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

        socket.on(
            "game:state",
            onGameState
        );

        socket.on(
            "room:closed",
            onRoomClosed
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

            socket.off(
                "game:state",
                onGameState
            );

            socket.off(
                "room:closed",
                onRoomClosed
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
