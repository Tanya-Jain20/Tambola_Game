import React from 'react';
import './PlayerList.css';

function PlayerList({ players, currentPlayerId, hostName, onBecomeHost, onToggleReady, gameStatus, prizes }) {
    const currentPlayer = players.find(p => p._id === currentPlayerId);
    const isCurrentPlayerHost = currentPlayer && currentPlayer.name === hostName;
    const readyCount = players.filter(p => p.isReady).length;
    const allReady = players.length > 0 && players.every(p => p.isReady);

    return (
        <div className="player-list">
            <h3>👥 Players ({players.length})</h3>

            {hostName && (
                <div className="host-info">
                    <span className="host-badge">👑 Host: {hostName}</span>
                </div>
            )}

            {!isCurrentPlayerHost && !hostName && gameStatus === 'waiting' && (
                <button onClick={onBecomeHost} className="become-host-btn">
                    👑 Become Host
                </button>
            )}

            <div className="ready-status">
                <span className={`ready-indicator ${allReady ? 'all-ready' : ''}`}>
                    {readyCount}/{players.length} Ready
                </span>
            </div>

            <div className="players-grid">
                {players.map((player) => {
                    // Check if player is a winner
                    const isWinner = prizes && Object.values(prizes).some(prize => {
                        if (!prize.claimed) return false;
                        if (Array.isArray(prize.winners)) {
                            return prize.winners.includes(player.name);
                        }
                        return prize.winner === player.name;
                    });

                    return (
                        <div
                            key={player._id}
                            className={`player-card ${player._id === currentPlayerId ? 'current-player' : ''} ${isWinner ? 'winner-highlight' : ''}`}
                        >
                            <div className="player-name">
                                {player.name}
                                {player.name === hostName && <span className="crown" title="Host">👑</span>}
                                {isWinner && <span className="trophy" title="Winner">🏆</span>}
                            </div>
                            <div className="player-stats">
                                <span className="points-badge">💰 {player.totalPoints || 0} pts</span>
                            </div>
                            <div className={`ready-badge ${player.isReady ? 'ready' : 'not-ready'}`}>
                                {player.isReady ? '✅ Ready' : '⏳ Waiting'}
                            </div>
                        </div>
                    );
                })}
            </div>

            {currentPlayer && gameStatus === 'waiting' && (
                <button
                    onClick={onToggleReady}
                    className={`ready-toggle-btn ${currentPlayer.isReady ? 'ready' : 'not-ready'}`}
                >
                    {currentPlayer.isReady ? '❌ Mark Not Ready' : '✅ Mark Ready'}
                </button>
            )}


        </div>
    );
}

export default PlayerList;
