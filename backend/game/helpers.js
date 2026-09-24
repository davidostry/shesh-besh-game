
export function isValidPoint(point) {
    return (
        Number.isInteger(point) &&
        point >= 0 &&
        point < 24
    );
}

export function isValidDie(die) {
    return (
        Number.isInteger(die) &&
        die >= 1 &&
        die <= 6
    );
}

export function getDestination(
    from,
    die,
    color
) {
    return color === "white"
        ? from - die
        : from + die;
}

export function getBarDestination(
    die,
    color
) {
    return color === "white"
        ? 24 - die
        : die - 1;
}

export function isInHomeBoard(
    index,
    color
) {
    if (color === "white") {
        return index >= 0 && index <= 5;
    }

    return index >= 18 && index <= 23;
}

export function distanceToExit(
    index,
    color
) {
    return color === "white"
        ? index + 1
        : 24 - index;
}
