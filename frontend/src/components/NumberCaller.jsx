import React from 'react';
import './NumberCaller.css';

function NumberCaller({ onCallNumber, gameStatus, calledCount }) {
    return (
        <div className="number-caller">
            <h3>Host Controls</h3>
            <div className="caller-stats">
                <p>Numbers Called: <strong>{calledCount}/90</strong></p>
            </div>
            <button
                onClick={onCallNumber}
                disabled={gameStatus === 'ended' || calledCount >= 90}
                className="call-button"
            >
                {gameStatus === 'ended' ? 'Game Ended' : 'Call Next Number'}
            </button>
        </div>
    );
}

export default NumberCaller;
