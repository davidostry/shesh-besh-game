
export type PlayerColor =
    | "white"
    | "black";

export type RoomStatus =
    | "waiting"
    | "playing"
    | "finished";

export type RoomPlayer = {
    name: string;
    color: PlayerColor;
};

export type Room = {
    id: string;
    status: RoomStatus;
    players: RoomPlayer[];
    game: unknown;
    rematchAcceptedBy: string[];
    yourColor?: PlayerColor;
};

export type SocketError = {
    code: string;
    message: string;
};

export type SocketResponse = {
    success: boolean;
    room?: Room;
    error?: SocketError;
};
