
import type {
    BoardPoint,
    PlayerColor
} from "../types/room";

type BoardProps = {
    board: Array<BoardPoint | null>;
    yourColor?: PlayerColor;
    selectedPoint: number | null;
    legalFromPoints: number[];
    legalToPoints: number[];
    onPointClick: (
        index: number
    ) => void;
    bar: {
        white: number;
        black: number;
    };
    borneOff: {
        white: number;
        black: number;
    };
    onBarClick: () => void;
    onOffClick: () => void;
};

function Board({
    board,
    yourColor,
    selectedPoint,
    legalFromPoints,
    legalToPoints,
    onPointClick,
    bar,
    borneOff,
    onBarClick,
    onOffClick
}: BoardProps) {
    const topPoints = [
        12, 13, 14, 15, 16, 17,
        18, 19, 20, 21, 22, 23
    ];

    const bottomPoints = [
        11, 10, 9, 8, 7, 6,
        5, 4, 3, 2, 1, 0
    ];

    function renderPoint(
        index: number
    ) {
        const point = board[index];

        const isSelected =
            selectedPoint === index;

        const isLegalFrom =
            legalFromPoints.includes(index);

        const isLegalTo =
            legalToPoints.includes(index);

        return (
            <button
                key={index}
                type="button"
                className={`board-point ${
                    point?.color === "white"
                        ? "white-point"
                        : point?.color === "black"
                            ? "black-point"
                            : ""
                } ${
                    isSelected
                        ? "selected-point"
                        : ""
                } ${
                    isLegalFrom
                        ? "legal-from"
                        : ""
                } ${
                    isLegalTo
                        ? "legal-to"
                        : ""
                }`}
                onClick={() =>
                    onPointClick(index)
                }
            >
                <div className="point-number">
                    {index + 1}
                </div>

                <div className="checkers">
                    {point &&
                        Array.from({
                            length: point.count
                        }).map(
                            (_, checkerIndex) => (
                                <div
                                    key={
                                        checkerIndex
                                    }
                                    className={`checker ${point.color}`}
                                />
                            )
                        )}

                    {point &&
                        point.count > 5 && (
                        <span className="checker-count">
                            {point.count}
                        </span>
                    )}
                </div>
            </button>
        );
    }

    const myBarCount =
        yourColor
            ? bar[yourColor]
            : 0;

    return (
        <div className="backgammon">
            <div className="board-header">
                <span>
                    אתה: {yourColor}
                </span>
            </div>

            <div className="game-info">
                <button
                    type="button"
                    className="bar-area"
                    onClick={onBarClick}
                >
                    <span>
                        Bar
                    </span>

                    <span>
                        החיילים שלך:{" "}
                        {myBarCount}
                    </span>

                    <span>
                        לבן: {bar.white}
                    </span>

                    <span>
                        שחור: {bar.black}
                    </span>
                </button>

                <button
                    type="button"
                    className="off-area"
                    onClick={onOffClick}
                >
                    <span>
                        Off
                    </span>

                    <span>
                        לבן:{" "}
                        {borneOff.white}
                    </span>

                    <span>
                        שחור:{" "}
                        {borneOff.black}
                    </span>
                </button>
            </div>

            <div className="board">
                <div className="board-half">
                    <div className="points-row">
                        {topPoints.map(
                            renderPoint
                        )}
                    </div>

                    <div className="middle-bar" />

                    <div className="points-row">
                        {bottomPoints.map(
                            renderPoint
                        )}
                    </div>
                </div>
            </div>

            <div className="board-info">
                <div>
                    לוח: 24 נקודות
                </div>

                <div>
                    לבן:{" "}
                    {board.filter(
                        (point) =>
                            point?.color ===
                            "white"
                    ).length}
                    {" נקודות תפוסות"}
                </div>

                <div>
                    שחור:{" "}
                    {board.filter(
                        (point) =>
                            point?.color ===
                            "black"
                    ).length}
                    {" נקודות תפוסות"}
                </div>
            </div>
        </div>
    );
}

export default Board;
