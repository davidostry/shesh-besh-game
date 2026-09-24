
import { socket } from "../socket";

import type {
    Room,
    SocketResponse
} from "../types/room";

type RoomProps = {
    room: Room;
    onLeave: () => void;
};

function Room({
    room,
    onLeave
}: RoomProps) {
    function leaveRoom() {
        socket.emit(
            "room:leave",
            (
                response: SocketResponse
            ) => {
                if (!response.success) {
                    return;
                }

                onLeave();
            }
        );
    }

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
                2 && (
                <p>
                    שני שחקנים בחדר
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

export default Room;