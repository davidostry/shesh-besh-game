
import {
    createInitialBoard
} from "./board.js";

import {
    rollDice,
    removeDie
} from "./dice.js";

import {
    canMakeMove,
    applyMove,
    getHitColor,
    getAllLegalMoves
} from "./moves.js";

export function createGame() {
    return {
        board: createInitialBoard(),

        currentPlayer: null,

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

export function startGame(game) {
    let whiteDie;
    let blackDie;

    do {
        whiteDie =
            Math.floor(
                Math.random() * 6
            ) + 1;

        blackDie =
            Math.floor(
                Math.random() * 6
            ) + 1;
    } while (
        whiteDie === blackDie
    );

    if (whiteDie > blackDie) {
        game.currentPlayer = "white";
    } else {
        game.currentPlayer = "black";
    }

    game.dice = [
        whiteDie,
        blackDie
    ];

    game.remainingDice = [
        whiteDie,
        blackDie
    ];

    game.status =
        "waiting-for-move";

    return {
        whiteDie,
        blackDie,
        startingPlayer:
            game.currentPlayer
    };
}

export function rollGameDice(game) {
    if (
        game.status !==
        "waiting-for-roll"
    ) {
        return {
            success: false,
            error:
                "Game is not waiting for a roll"
        };
    }

    const result =
        rollDice();

    game.dice =
        result.dice;

    game.remainingDice =
        result.remainingDice;

    game.status =
        "waiting-for-move";

    const legalMoves =
        getAllLegalMoves(
            game.board,
            game.remainingDice,
            game.currentPlayer,
            game.bar[
                game.currentPlayer
            ]
        );

    if (
        legalMoves.length === 0
    ) {
        endTurn(game);
    }

    return {
        success: true,
        dice: game.dice
    };
}

export function makeGameMove(
    game,
    from,
    to,
    die
) {
    if (
        game.status !==
        "waiting-for-move"
    ) {
        return {
            success: false,
            error:
                "Game is not waiting for a move"
        };
    }

    const color =
        game.currentPlayer;

    const barCount =
        game.bar[color];

    const isLegal =
        canMakeMove(
            game.board,
            from,
            to,
            die,
            color,
            barCount
        );

    if (!isLegal) {
        return {
            success: false,
            error: "Illegal move"
        };
    }

    const newRemainingDice =
        removeDie(
            game.remainingDice,
            die
        );

    if (
        newRemainingDice === null
    ) {
        return {
            success: false,
            error:
                "Die is not available"
        };
    }

    const hitColor =
        to !== "off"
            ? getHitColor(
                game.board,
                to,
                color
            )
            : null;

    game.board =
        applyMove(
            game.board,
            from,
            to,
            color
        );

    if (from === "bar") {
        game.bar[color] -= 1;
    }

    if (hitColor) {
        game.bar[hitColor] += 1;
    }

    if (to === "off") {
        game.borneOff[color] += 1;
    }

    game.remainingDice =
        newRemainingDice;

    if (
        game.borneOff[color] === 15
    ) {
        game.status = "finished";

        game.winner = color;

        game.remainingDice = [];

        return {
            success: true,
            finished: true,
            winner: color
        };
    }

    const legalMoves =
        getAllLegalMoves(
            game.board,
            game.remainingDice,
            color,
            game.bar[color]
        );

    if (
        game.remainingDice.length === 0 ||
        legalMoves.length === 0
    ) {
        endTurn(game);

        return {
            success: true,
            finished: false,
            turnEnded: true
        };
    }

    return {
        success: true,
        finished: false,
        turnEnded: false
    };
}

export function endTurn(game) {
    game.remainingDice = [];

    game.dice = [];

    game.currentPlayer =
        game.currentPlayer === "white"
            ? "black"
            : "white";

    game.status =
        "waiting-for-roll";
}

export function getLegalMoves(game) {
    if (
        game.status !==
        "waiting-for-move"
    ) {
        return [];
    }

    return getAllLegalMoves(
        game.board,
        game.remainingDice,
        game.currentPlayer,
        game.bar[
            game.currentPlayer
        ]
    );
}
