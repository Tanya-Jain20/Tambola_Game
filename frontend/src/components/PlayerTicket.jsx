import React from 'react';
import './PlayerTicket.css';

function PlayerTicket({ ticket, markedNumbers, onMarkNumber, calledNumbers }) {
    if (!ticket) return null;

    const handleCellClick = (number) => {
        if (number && !markedNumbers.includes(number)) {
            onMarkNumber(number);
        }
    };

    return (
        <div className="player-ticket">
            <h3>Your Ticket</h3>
            <div className="ticket-grid">
                {ticket.map((row, rowIndex) => (
                    <div key={rowIndex} className="ticket-row">
                        {row.map((num, colIndex) => (
                            <div
                                key={colIndex}
                                className={`ticket-cell ${num ? 'has-number' : 'empty'} ${markedNumbers.includes(num) ? 'marked' : ''}`
                                }
                                onClick={() => handleCellClick(num)}
                            >
                                {num || ''}
                            </div>
                        ))}
                    </div>
                ))}
            </div>
            <div className="ticket-legend">
                <div className="legend-item">
                    <span className="legend-box marked-box"></span>
                    <span>Marked</span>
                </div>
            </div>
        </div>
    );
}

export default PlayerTicket;
