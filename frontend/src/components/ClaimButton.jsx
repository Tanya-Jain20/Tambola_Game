import React from 'react';
import './ClaimButton.css';

function ClaimButton({ onClaim, gameStatus, prizes }) {
    if (gameStatus === 'ended' || !prizes) return null;

    const prizeButtons = [
        {
            type: 'early5',
            label: 'Early 5',
            icon: '⭐',
            points: prizes.early5?.points || 50,
            claimed: prizes.early5?.claimed,
            winner: prizes.early5?.winner
        },
        {
            type: 'firstLine',
            label: 'First Line',
            icon: '❶',
            points: prizes.firstLine?.points || 100,
            claimed: prizes.firstLine?.claimed,
            winner: prizes.firstLine?.winner
        },
        {
            type: 'secondLine',
            label: 'Second Line',
            icon: '❷',
            points: prizes.secondLine?.points || 100,
            claimed: prizes.secondLine?.claimed,
            winner: prizes.secondLine?.winner
        },
        {
            type: 'thirdLine',
            label: 'Third Line',
            icon: '❸',
            points: prizes.thirdLine?.points || 100,
            claimed: prizes.thirdLine?.claimed,
            winner: prizes.thirdLine?.winner
        },
        {
            type: 'corners',
            label: 'Corners',
            icon: '📐',
            points: prizes.corners?.points || 50,
            claimed: prizes.corners?.claimed,
            winner: prizes.corners?.winner
        },
        {
            type: 'fullHouse',
            label: 'Full House',
            icon: '🏠',
            points: prizes.fullHouse?.points || 200,
            claimed: prizes.fullHouse?.winners?.length >= prizes.fullHouse?.maxWinners,
            winners: prizes.fullHouse?.winners
        }
    ];

    return (
        <div className="claim-section-compact">
            <div className="claim-grid">
                {prizeButtons.map((prize) => (
                    <button
                        key={prize.type}
                        onClick={() => onClaim(prize.type)}
                        disabled={prize.claimed}
                        className={`claim-card ${prize.claimed ? 'claimed' : ''} ${prize.type === 'fullHouse' ? 'full-house-card' : ''}`}
                    >
                        {prize.claimed ? (
                            <div className="claimed-content">
                                <div className="claimed-check">✓</div>
                                <div className="claimed-info">
                                    <span className="claimed-label">{prize.label}</span>
                                    <span className="winner-name-badge">
                                        {prize.type === 'fullHouse'
                                            ? prize.winners?.join(', ') || 'Done'
                                            : prize.winner}
                                    </span>
                                </div>
                            </div>
                        ) : (
                            <div className="prize-content">
                                <span className="prize-icon">{prize.icon}</span>
                                <div className="prize-details">
                                    <span className="prize-label">{prize.label}</span>
                                    <span className="prize-points">+{prize.points}</span>
                                </div>
                            </div>
                        )}
                    </button>
                ))}
            </div>
        </div>
    );
}

export default ClaimButton;
