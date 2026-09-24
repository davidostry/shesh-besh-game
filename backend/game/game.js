export function createInitialBoard() {
    const board = Array(24).fill(null);

    board[23] = {
        color: "white",
        count: 2
    };

    board[12] = {
        color: "white",
        count: 5
    };

    board[7] = {
        color: "white",
        count: 3
    };

    board[5] = {
        color: "white",
        count: 5
    };

    board[0] = {
        color: "black",
        count: 2
    };

    board[11] = {
        color: "black",
        count: 5
    };

    board[16] = {
        color: "black",
        count: 3
    };

    board[18] = {
        color: "black",
        count: 5
    };

    return board;
}

export function createGame() {
    return {
        board: createInitialBoard(),
        currentPlayer: "white",
        dice: [],
        remainingDice: [],
        bar: {
            white: 0,
            black: 0
        },
        borneOff: {
            white: 0,
            black: 0
        },
        status: "waiting-for-roll",
        winner: null
    };
}