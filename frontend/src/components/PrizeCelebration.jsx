import React, { useEffect, useState } from 'react';
import './PrizeCelebration.css';
import audioManager from '../utils/audioManager';

function PrizeCelebration({ winner, prizeType, points, onComplete }) {
    const [countdown, setCountdown] = useState(5);
    const [showCountdown, setShowCountdown] = useState(false);

    useEffect(() => {
        // Play drum roll sound using audioManager
        audioManager.playDrumRoll();

        // Show winner for 3.5 seconds, then start countdown
        const winnerTimer = setTimeout(() => {
            setShowCountdown(true);
        }, 3500);

        return () => clearTimeout(winnerTimer);
    }, []);

    useEffect(() => {
        if (showCountdown && countdown > 0) {
            const timer = setTimeout(() => {
                setCountdown(prev => prev - 1);

                // Play countdown beep using audioManager
                audioManager.playCountdownBeep();
            }, 1000);

            return () => clearTimeout(timer);
        } else if (showCountdown && countdown === 0) {
            // Resume game
            const finalTimer = setTimeout(() => {
                onComplete();
            }, 500);
            return () => clearTimeout(finalTimer);
        }
    }, [showCountdown, countdown, onComplete]);

    return (
        <div className="prize-celebration-overlay">
            <div className="celebration-content">
                {!showCountdown ? (
                    <>
                        <div className="confetti"></div>
                        <div className="trophy-icon">🏆</div>
                        <h1 className="winner-name">{winner}</h1>
                        <h2 className="prize-name">Won {prizeType}!</h2>
                        <div className="points-display">+{points} Points</div>
                        <div className="celebration-message">🎉 Congratulations! 🎉</div>
                    </>
                ) : (
                    <div className="countdown-display">
                        <div className="countdown-text">Game Resuming In</div>
                        <div className="countdown-number">{countdown}</div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default PrizeCelebration;
