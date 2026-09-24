export function rollDie() {
    return Math.floor(Math.random() * 6) + 1;
}

export function rollDice() {
    const first = rollDie();
    const second = rollDie();

    if (first === second) {
        return {
            dice: [first, second],
            remainingDice: [first, first, first, first]
        };
    }

    return {
        dice: [first, second],
        remainingDice: [first, second]
    };
}

export function removeDie(remainingDice, die) {
    const index = remainingDice.indexOf(die);

    if (index === -1) {
        return null;
    }

    return [
        ...remainingDice.slice(0, index),
        ...remainingDice.slice(index + 1)
    ];
}