import type {
    BoardPoint,
    PlayerColor
} from "../types/room";

type BoardProps = {
    board: Array<BoardPoint | null>;
    yourColor?: PlayerColor;
};

function Board({
    board,
    yourColor
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

        return (
            <div
                key={index}
                className={`board-point ${
                    point?.color === "white"
                        ? "white-point"
                        : point?.color === "black"
                            ? "black-point"
                            : ""
                }`}
            >
                <div className="point-number">
                    {index + 1}
                </div>

                <div className="checkers">
                    {point && (
                        <>
                            {Array.from({
                                length: point.count
                            }).map(
                                (_, checkerIndex) => (
                                    <div
                                        key={
                                            checkerIndex
                                        }
                                        className={`checker ${
                                            point.color
                                        }`}
                                    />
                                )
                            )}

                            {point.count > 5 && (
                                <span className="checker-count">
                                    {point.count}
                                </span>
                            )}
                        </>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="backgammon">
            <div className="board-header">
                <span>
                    אתה: {yourColor}
                </span>
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