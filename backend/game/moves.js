
import {
    isValidPoint,
    isValidDie,
    getDestination,
    getBarDestination,
    isInHomeBoard,
    distanceToExit
} from "./helpers.js";

import {
    cloneBoard
} from "./board.js";

export function isPointBlocked(
    board,
    point,
    color
) {
    const target = board[point];

    if (!target) {
        return false;
    }

    if (target.color === color) {
        return false;
    }

    return target.count >= 2;
}

export function canMoveToPoint(
    board,
    point,
    color
) {
    if (!isValidPoint(point)) {
        return false;
    }

    return !isPointBlocked(
        board,
        point,
        color
    );
}

export function canEnterFromBar(
    board,
    die,
    color
) {
    if (!isValidDie(die)) {
        return false;
    }

    const destination =
        getBarDestination(
            die,
            color
        );

    return canMoveToPoint(
        board,
        destination,
        color
    );
}

export function canMove(
    board,
    from,
    die,
    color
) {
    if (!isValidPoint(from)) {
        return false;
    }

    if (!isValidDie(die)) {
        return false;
    }

    const piece = board[from];

    if (!piece) {
        return false;
    }

    if (piece.color !== color) {
        return false;
    }

    const destination =
        getDestination(
            from,
            die,
            color
        );

    if (!isValidPoint(destination)) {
        return false;
    }

    return canMoveToPoint(
        board,
        destination,
        color
    );
}

export function hasAllCheckersInHome(
    board,
    color,
    barCount
) {
    if (barCount > 0) {
        return false;
    }

    for (
        let index = 0;
        index < board.length;
        index++
    ) {
        const point = board[index];

        if (!point) {
            continue;
        }

        if (point.color !== color) {
            continue;
        }

        if (
            !isInHomeBoard(
                index,
                color
            )
        ) {
            return false;
        }
    }

    return true;
}

export function canBearOff(
    board,
    index,
    die,
    color,
    barCount
) {
    if (!isValidPoint(index)) {
        return false;
    }

    if (!isValidDie(die)) {
        return false;
    }

    if (barCount > 0) {
        return false;
    }

    const piece = board[index];

    if (!piece) {
        return false;
    }

    if (piece.color !== color) {
        return false;
    }

    if (
        !hasAllCheckersInHome(
            board,
            color,
            barCount
        )
    ) {
        return false;
    }

    const distance =
        distanceToExit(
            index,
            color
        );

    if (die === distance) {
        return true;
    }

    if (die < distance) {
        return false;
    }

    for (
        let currentIndex = 0;
        currentIndex < board.length;
        currentIndex++
    ) {
        const currentPoint =
            board[currentIndex];

        if (!currentPoint) {
            continue;
        }

        if (
            currentPoint.color !== color
        ) {
            continue;
        }

        const currentDistance =
            distanceToExit(
                currentIndex,
                color
            );

        if (
            currentDistance > distance
        ) {
            return false;
        }
    }

    return true;
}

export function canMakeMove(
    board,
    from,
    to,
    die,
    color,
    barCount
) {
    if (!isValidDie(die)) {
        return false;
    }

    if (from === "bar") {
        if (barCount <= 0) {
            return false;
        }

        if (
            to !==
            getBarDestination(
                die,
                color
            )
        ) {
            return false;
        }

        return canEnterFromBar(
            board,
            die,
            color
        );
    }

    if (!isValidPoint(from)) {
        return false;
    }

    if (to === "off") {
        return canBearOff(
            board,
            from,
            die,
            color,
            barCount
        );
    }

    if (!isValidPoint(to)) {
        return false;
    }

    if (barCount > 0) {
        return false;
    }

    const expectedDestination =
        getDestination(
            from,
            die,
            color
        );

    if (
        expectedDestination !== to
    ) {
        return false;
    }

    return canMove(
        board,
        from,
        die,
        color
    );
}

export function applyMove(
    board,
    from,
    to,
    color
) {
    const newBoard =
        cloneBoard(board);

    if (from === "bar") {
        const target =
            newBoard[to];

        if (!target) {
            newBoard[to] = {
                color,
                count: 1
            };

            return newBoard;
        }

        if (target.color === color) {
            target.count += 1;

            return newBoard;
        }

        if (target.count === 1) {
            newBoard[to] = {
                color,
                count: 1
            };

            return newBoard;
        }
    }

    if (to === "off") {
        newBoard[from].count -= 1;

        if (
            newBoard[from].count === 0
        ) {
            newBoard[from] = null;
        }

        return newBoard;
    }

    newBoard[from].count -= 1;

    if (
        newBoard[from].count === 0
    ) {
        newBoard[from] = null;
    }

    const target =
        newBoard[to];

    if (!target) {
        newBoard[to] = {
            color,
            count: 1
        };

        return newBoard;
    }

    if (target.color === color) {
        target.count += 1;

        return newBoard;
    }

    if (target.count === 1) {
        newBoard[to] = {
            color,
            count: 1
        };

        return newBoard;
    }

    return newBoard;
}

export function getHitColor(
    board,
    to,
    color
) {
    if (!isValidPoint(to)) {
        return null;
    }

    const target = board[to];

    if (!target) {
        return null;
    }

    if (target.color === color) {
        return null;
    }

    if (target.count !== 1) {
        return null;
    }

    return target.color;
}

export function getLegalMovesForDie(
    board,
    die,
    color,
    barCount
) {
    const legalMoves = [];

    if (!isValidDie(die)) {
        return legalMoves;
    }

    if (barCount > 0) {
        const destination =
            getBarDestination(
                die,
                color
            );

        if (
            canEnterFromBar(
                board,
                die,
                color
            )
        ) {
            legalMoves.push({
                from: "bar",
                to: destination,
                die
            });
        }

        return legalMoves;
    }

    for (
        let from = 0;
        from < 24;
        from++
    ) {
        const piece = board[from];

        if (!piece) {
            continue;
        }

        if (piece.color !== color) {
            continue;
        }

        const destination =
            getDestination(
                from,
                die,
                color
            );

        if (
            isValidPoint(destination)
        ) {
            if (
                canMove(
                    board,
                    from,
                    die,
                    color
                )
            ) {
                legalMoves.push({
                    from,
                    to: destination,
                    die
                });
            }
        }

        if (
            canBearOff(
                board,
                from,
                die,
                color,
                barCount
            )
        ) {
            legalMoves.push({
                from,
                to: "off",
                die
            });
        }
    }

    return legalMoves;
}

export function getAllLegalMoves(
    board,
    remainingDice,
    color,
    barCount
) {
    const legalMoves = [];

    for (
        const die of remainingDice
    ) {
        const movesForDie =
            getLegalMovesForDie(
                board,
                die,
                color,
                barCount
            );

        legalMoves.push(
            ...movesForDie
        );
    }

    return legalMoves;
}
