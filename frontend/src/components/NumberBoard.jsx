import React from 'react';
import './NumberBoard.css';

function NumberBoard({ calledNumbers, lastCalledNumber, isHost }) {
    const numbers = Array.from({ length: 90 }, (_, i) => i + 1);

    return (
        <div className="number-board">
            <h2 className="board-title">Number Board</h2>
            <div className="numbers-grid">
                {numbers.map((num) => (
                    <div
                        key={num}
                        className={`number-cell ${
                            // For host: show all called numbers
                            // For non-host: only show the last called number
                            (isHost && calledNumbers.includes(num)) || (num === lastCalledNumber)
                                ? 'called'
                                : ''
                            } ${num === lastCalledNumber ? 'last-called' : ''}`}
                    >
                        {num}
                    </div>
                ))}
            </div>
            {lastCalledNumber && (
                <div className="last-number-display">
                    <span>Last Called:</span>
                    <span className="last-number">{lastCalledNumber}</span>
                </div>
            )}
        </div>
    );
}

export default NumberBoard;
