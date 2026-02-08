import React, { useState } from 'react';
import './AutoCaller.css';

function AutoCaller({ autoCallEnabled, autoCallInterval, onStart, onStop, gameStatus }) {
    const [selectedInterval, setSelectedInterval] = useState(5);

    const handleStart = () => {
        onStart(selectedInterval);
    };

    if (gameStatus === 'ended') return null;

    return (
        <div className="auto-caller">
            <h3>🤖 Auto Number Calling</h3>

            {!autoCallEnabled ? (
                <>
                    <div className="interval-selector">
                        <label>Call Interval:</label>
                        <select
                            value={selectedInterval}
                            onChange={(e) => setSelectedInterval(Number(e.target.value))}
                            className="interval-select"
                        >
                            <option value={3}>3 seconds</option>
                            <option value={5}>5 seconds</option>
                            <option value={10}>10 seconds</option>
                            <option value={15}>15 seconds</option>
                            <option value={20}>20 seconds</option>
                        </select>
                    </div>

                    <button onClick={handleStart} className="auto-call-button start-button">
                        ▶️ Start Auto-Calling
                    </button>
                </>
            ) : (
                <>
                    <div className="auto-call-status">
                        <span className="status-indicator active"></span>
                        <span>Auto-calling every {autoCallInterval}s</span>
                    </div>

                    <button onClick={onStop} className="auto-call-button stop-button">
                        ⏸️ Stop Auto-Calling
                    </button>
                </>
            )}
        </div>
    );
}

export default AutoCaller;
