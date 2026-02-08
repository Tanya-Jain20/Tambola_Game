import React from 'react';
import './PrizeTracker.css';

function PrizeTracker({ prizes }) {
    if (!prizes) return null;

    const prizeList = [
        {
            name: 'First Line',
            claimed: prizes.firstLine?.claimed,
            winner: prizes.firstLine?.winner,
            points: prizes.firstLine?.points
        },
        {
            name: 'Second Line',
            claimed: prizes.secondLine?.claimed,
            winner: prizes.secondLine?.winner,
            points: prizes.secondLine?.points
        },
        {
            name: 'Third Line',
            claimed: prizes.thirdLine?.claimed,
            winner: prizes.thirdLine?.winner,
            points: prizes.thirdLine?.points
        },
        {
            name: 'Corners',
            claimed: prizes.corners?.claimed,
            winner: prizes.corners?.winner,
            points: prizes.corners?.points
        },
        {
            name: 'Full House',
            claimed: prizes.fullHouse?.winners?.length > 0,
            winner: prizes.fullHouse?.winners?.join(', '),
            points: prizes.fullHouse?.points,
            multiple: true,
            count: `${prizes.fullHouse?.winners?.length || 0}/${prizes.fullHouse?.maxWinners || 2}`
        }
    ];

    return (
        <div className="prize-tracker">
            <h3>🏆 Prize Status</h3>
            <div className="prize-list">
                {prizeList.map((prize, index) => (
                    <div key={index} className={`prize-item ${prize.claimed ? 'claimed' : 'available'}`}>
                        <div className="prize-header">
                            <span className="prize-name">{prize.name}</span>
                            <span className="prize-points">{prize.points} pts</span>
                        </div>
                        <div className="prize-status">
                            {prize.claimed ? (
                                <>
                                    <span className="status-badge won">✓ Won</span>
                                    <span className="winner-name">{prize.winner}</span>
                                    {prize.multiple && <span className="count-badge">{prize.count}</span>}
                                </>
                            ) : (
                                <span className="status-badge available">Available</span>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default PrizeTracker;
