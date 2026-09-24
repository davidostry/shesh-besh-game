export function pointToIndex(point, color) {
    return color === "white" ? point - 1 : 24 - point;
}

export function calculateDestination(from, die, color) {
    return color === "white"
        ? from - die
        : from + die;
}

export function getBarDestination(die, color) {
    return color === "white"
        ? 24 - die
        : die - 1;
}

export function distanceToExit(index, color) {
    return color === "white"
        ? index + 1
        : 24 - index;
}