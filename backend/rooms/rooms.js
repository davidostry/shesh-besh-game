const rooms = new Map();

const socketRooms = new Map();

export function getRoom(roomCode) {
    return rooms.get(roomCode);
}

export function setRoom(roomCode, room) {
    rooms.set(roomCode, room);
}

export function deleteRoom(roomCode) {
    rooms.delete(roomCode);
}

export function getSocketRoom(socketId) {
    return socketRooms.get(socketId);
}

export function setSocketRoom(socketId, roomCode) {
    socketRooms.set(socketId, roomCode);
}

export function deleteSocketRoom(socketId) {
    socketRooms.delete(socketId);
}

export function createRoomCode() {
    const characters = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

    let code;

    do {
        code = "";

        for (let i = 0; i < 6; i++) {
            const randomIndex = Math.floor(
                Math.random() * characters.length
            );

            code += characters[randomIndex];
        }
    } while (rooms.has(code));

    return code;
}