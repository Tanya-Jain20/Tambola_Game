import React, { useState } from 'react';
import './RoomSetup.css';

function RoomSetup({ onCreateRoom, onJoinRoom }) {
    const [mode, setMode] = useState(null); // 'create' or 'join'
    const [playerName, setPlayerName] = useState('');
    const [roomCode, setRoomCode] = useState('');
    const [isHost, setIsHost] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();

        if (mode === 'create') {
            onCreateRoom(playerName.trim(), isHost);
        } else if (mode === 'join') {
            onJoinRoom(roomCode.trim().toUpperCase(), playerName.trim());
        }
    };

    if (!mode) {
        return (
            <div className="room-setup-container">
                <div className="room-setup-card">
                    <h1 className="game-title">🎲 Tambola Game</h1>
                    <p className="game-subtitle">Play with friends in real-time!</p>

                    <div className="mode-selection">
                        <button
                            className="mode-button create-button"
                            onClick={() => setMode('create')}
                        >
                            <span className="mode-icon">➕</span>
                            <span className="mode-text">Create New Room</span>
                        </button>

                        <button
                            className="mode-button join-button"
                            onClick={() => setMode('join')}
                        >
                            <span className="mode-icon">🚪</span>
                            <span className="mode-text">Join Existing Room</span>
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="room-setup-container">
            <div className="room-setup-card">
                <button className="back-button" onClick={() => setMode(null)}>
                    ← Back
                </button>

                <h1 className="game-title">
                    {mode === 'create' ? '➕ Create Room' : '🚪 Join Room'}
                </h1>

                <form onSubmit={handleSubmit} className="room-form">
                    <input
                        type="text"
                        placeholder="Enter your name"
                        value={playerName}
                        onChange={(e) => setPlayerName(e.target.value)}
                        className="name-input"
                        required
                    />

                    {mode === 'join' && (
                        <input
                            type="text"
                            placeholder="Enter room code"
                            value={roomCode}
                            onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                            className="code-input"
                            maxLength={6}
                            required
                        />
                    )}

                    {mode === 'create' && (
                        <div className="host-section">
                            <label className="checkbox-label">
                                <input
                                    type="checkbox"
                                    checked={isHost}
                                    onChange={(e) => setIsHost(e.target.checked)}
                                />
                                <span>I am the host (can control number calling)</span>
                            </label>
                        </div>
                    )}

                    <button type="submit" className="submit-button">
                        {mode === 'create' ? 'Create Room' : 'Join Room'}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default RoomSetup;
