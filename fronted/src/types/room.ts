
export type PlayerColor =
    | "white"
    | "black";

export type RoomStatus =
    | "waiting"
    | "playing"
    | "finished";

export type GameStatus =
    | "waiting-for-roll"
    | "waiting-for-move"
    | "finished";

export type RoomPlayer = {
    name: string;
    color: PlayerColor;
};

export type BoardPoint = {
    color: PlayerColor;
    count: number;
};

export type LegalMove = {
    from: number | "bar";
    to: number | "off";
    die: number;
};

export type Game = {
    board: Array<
        BoardPoint | null
    >;

    currentPlayer:
        | PlayerColor
        | null;

    dice: number[];

    remainingDice: number[];

    bar: {
        white: number;
        black: number;
    };

    borneOff: {
        white: number;
        black: number;
    };

    status: GameStatus;

    winner:
        | PlayerColor
        | null;

    legalMoves: LegalMove[];
};

export type Room = {
    id: string;

    status: RoomStatus;

    players: RoomPlayer[];

    game: Game | null;

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
