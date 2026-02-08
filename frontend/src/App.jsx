import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import './App.css';
import NumberBoard from './components/NumberBoard';
import NumberCaller from './components/NumberCaller';
import PlayerTicket from './components/PlayerTicket';
import ClaimButton from './components/ClaimButton';
import RoomSetup from './components/RoomSetup';
import AutoCaller from './components/AutoCaller';
import PlayerList from './components/PlayerList';
import PrizeCelebration from './components/PrizeCelebration';
import HelpModal from './components/HelpModal';
import audioManager from './utils/audioManager';
import { useRef } from 'react';

const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'https://tambola-backend-50a6.onrender.com';

function App() {
    const [socket, setSocket] = useState(null);
    const [playerName, setPlayerName] = useState('');
    const [playerId, setPlayerId] = useState(null);
    const [roomCode, setRoomCode] = useState('');
    const [ticket, setTicket] = useState(null);
    const [markedNumbers, setMarkedNumbers] = useState([]);
    const [calledNumbers, setCalledNumbers] = useState([]);
    const [lastCalledNumber, setLastCalledNumber] = useState(null);
    const [prizes, setPrizes] = useState(null);
    const [gameStatus, setGameStatus] = useState('waiting');
    const [playerCount, setPlayerCount] = useState(0);
    const [isHost, setIsHost] = useState(false);
    const [inRoom, setInRoom] = useState(false);
    const [alertMessage, setAlertMessage] = useState('');
    const [autoCallEnabled, setAutoCallEnabled] = useState(false);
    const [autoCallInterval, setAutoCallInterval] = useState(5);
    const [players, setPlayers] = useState([]);
    const [hostName, setHostName] = useState(null);
    const [celebration, setCelebration] = useState(null);
    const [audioEnabled, setAudioEnabled] = useState(true);
    const [totalPoints, setTotalPoints] = useState(0);
    const [showPlayerModal, setShowPlayerModal] = useState(false);
    const [showHelpModal, setShowHelpModal] = useState(false);
    const [roomCodeCopied, setRoomCodeCopied] = useState(false);

    // Refs to store latest playerId and playerName for socket listeners (closure fix)
    const playerIdRef = useRef(null);
    const playerNameRef = useRef('');

    // Sync refs with state
    useEffect(() => {
        playerIdRef.current = playerId;
    }, [playerId]);

    useEffect(() => {
        playerNameRef.current = playerName;
    }, [playerName]);

  useEffect(() => {
    const newSocket = io(SOCKET_URL, {
        transports: ['websocket', 'polling'],
        secure: true,
        path: '/socket.io/',
        reconnection: true,
        reconnectionAttempts: 5
    });
    setSocket(newSocket);

    // DEBUG - Add these 3 lines to see connection status
    newSocket.on('connect', () => console.log('✅ Socket CONNECTED:', newSocket.id));
    newSocket.on('connect_error', (err) => console.log('❌ Socket ERROR:', err.message));
    newSocket.on('disconnect', (reason) => console.log('🔌 Socket DISCONNECTED:', reason));

        // Room created
        newSocket.on('roomCreated', (data) => {
            setRoomCode(data.roomCode);
            setTicket(data.ticket);
            setPlayerId(data.playerId);
            setPlayerName(data.playerName);
            setIsHost(data.isHost);
            setTotalPoints(data.totalPoints || 0);
            setInRoom(true);
            showAlert(`Room created! Code: ${data.roomCode}`);
        });

        // Room joined
        newSocket.on('roomJoined', (data) => {
            setRoomCode(data.roomCode);
            setTicket(data.ticket);
            setPlayerId(data.playerId);
            setPlayerName(data.playerName);
            setIsHost(data.isHost);
            setTotalPoints(data.totalPoints || 0);
            setInRoom(true);
            showAlert(`Joined room: ${data.roomCode}`);
        });

        // Game state
        newSocket.on('gameState', (data) => {
            setCalledNumbers(data.calledNumbers);
            setLastCalledNumber(data.lastCalledNumber);
            setPrizes(data.prizes);
            setGameStatus(data.status);
            setAutoCallEnabled(data.autoCallEnabled);
            setAutoCallInterval(data.autoCallInterval);
            if (data.hostName) setHostName(data.hostName);
            if (data.totalPoints !== undefined) setTotalPoints(data.totalPoints);
        });

        // Number called
        newSocket.on('numberCalled', (data) => {
            setCalledNumbers(data.calledNumbers);
            setLastCalledNumber(data.number);
            showAlert(`Number called: ${data.number}`);

            // Speak the number
            audioManager.speakNumber(data.number);
        });

        // Prize awarded
        newSocket.on('prizeAwarded', (data) => {
            setPrizes(data.prizes);

            // Show celebration overlay
            setCelebration({
                winner: data.winner,
                prizeType: data.prizeType,
                points: data.points
            });

            // Don't show alert, celebration will handle it

            // No longer manual incrementing points here to avoid React closure/sync issues.
            // Points are now synced via the playerListUpdate event which follows prizeAwarded.
        });

        // Claim rejected
        newSocket.on('claimRejected', (data) => {
            showAlert(data.message, 'error');
        });

        // Game ended
        newSocket.on('gameEnded', (data) => {
            setGameStatus('ended');
            setAutoCallEnabled(false);
            showAlert(data.message);
        });

        // Player count
        newSocket.on('playerCount', (data) => {
            setPlayerCount(data.count);
        });

        // Auto-calling started
        newSocket.on('autoCallingStarted', (data) => {
            setAutoCallEnabled(true);
            setAutoCallInterval(data.interval);
            showAlert(`🤖 Auto-calling started (${data.interval}s interval)`);
        });

        // Auto-calling stopped
        newSocket.on('autoCallingStopped', () => {
            setAutoCallEnabled(false);
            showAlert('⏸️ Auto-calling stopped');
        });

        // Auto-calling paused for celebration
        newSocket.on('autoCallingPaused', (data) => {
            setAutoCallEnabled(false);
            showAlert(data.message);
        });

        // Auto-calling resumed after celebration
        newSocket.on('autoCallingResumed', () => {
            setAutoCallEnabled(true);
            showAlert('▶️ Game resumed!');
        });

        // Errors
        newSocket.on('error', (data) => {
            showAlert(data.message, 'error');
        });

        // Player list update
        newSocket.on('playerListUpdate', (data) => {
            setPlayers(data.players);

            // Sync totalPoints for the current player from the players list
            // Use refs here because this listener is in a closure with stale state
            const currentPlayerId = playerIdRef.current;
            const currentPlayerName = playerNameRef.current;

            if (currentPlayerId) {
                const me = data.players.find(p => p._id === currentPlayerId);
                if (me && me.totalPoints !== undefined) {
                    setTotalPoints(me.totalPoints);
                }
            } else if (data.players.length > 0) {
                // Fallback: if we don't have playerId yet, try finding by name
                const me = data.players.find(p => p.name === currentPlayerName);
                if (me && me.totalPoints !== undefined) {
                    setTotalPoints(me.totalPoints);
                }
            }
        });

        // Host changed
        newSocket.on('hostChanged', (data) => {
            setHostName(data.hostName);
            showAlert(data.message);
        });

        // Host status changed (for current player)
        newSocket.on('hostStatusChanged', (data) => {
            setIsHost(data.isHost);
        });

        // All players ready
        newSocket.on('allPlayersReady', (data) => {
            showAlert(data.message);
        });

        return () => newSocket.close();
    }, []);

    useEffect(() => {
        if (inRoom) {
            setShowHelpModal(true);
        }
    }, [inRoom]);

    const showAlert = (message, type = 'info') => {
        setAlertMessage(message);
        setTimeout(() => setAlertMessage(''), 5000);
    };

    const handleCreateRoom = (name, hostMode) => {
        if (socket) {
            socket.emit('createRoom', { playerName: name, isHost: hostMode });
        }
    };

    const handleJoinRoom = (code, name) => {
        if (socket) {
            socket.emit('joinRoom', { roomCode: code, playerName: name });
        }
    };

    const handleCallNumber = () => {
        if (socket && roomCode) {
            socket.emit('callNumber', { roomCode });
        }
    };

    const handleStartAutoCalling = (interval) => {
        if (socket && roomCode) {
            socket.emit('startAutoCalling', { roomCode, interval });
        }
    };

    const handleStopAutoCalling = () => {
        if (socket && roomCode) {
            socket.emit('stopAutoCalling', { roomCode });
        }
    };

    const handleMarkNumber = (number) => {
        if (socket && playerId && calledNumbers.includes(number)) {
            socket.emit('markNumber', { playerId, number });
            setMarkedNumbers([...markedNumbers, number]);
        }
    };

    const handleClaimPrize = (prizeType) => {
        if (socket && playerId && roomCode) {
            socket.emit('claimPrize', { playerId, prizeType, roomCode });
        }
    };

    const handleBecomeHost = () => {
        if (socket && roomCode && playerName) {
            socket.emit('becomeHost', { roomCode, playerName });
        }
    };

    const handleCopyRoomCode = () => {
        if (roomCode) {
            navigator.clipboard.writeText(roomCode);
            setRoomCodeCopied(true);
            setTimeout(() => setRoomCodeCopied(false), 2000);
        }
    };

    const handleToggleReady = () => {
        if (socket && playerId && roomCode) {
            socket.emit('toggleReady', { playerId, roomCode });
        }
    };

    const handleCelebrationComplete = () => {
        setCelebration(null);
        audioManager.playCelebration();
    };

    const toggleAudio = () => {
        const enabled = audioManager.toggleAudio();
        setAudioEnabled(enabled);
        showAlert(enabled ? '🔊 Audio enabled' : '🔇 Audio muted');
    };

    if (!inRoom) {
        return (
            <div className="app">
                <RoomSetup
                    onCreateRoom={handleCreateRoom}
                    onJoinRoom={handleJoinRoom}
                />
            </div>
        );
    }

    return (
        <div className="app">
            {celebration && (
                <PrizeCelebration
                    winner={celebration.winner}
                    prizeType={celebration.prizeType}
                    points={celebration.points}
                    onComplete={handleCelebrationComplete}
                />
            )}

            {alertMessage && (
                <div className="alert-banner">
                    {alertMessage}
                </div>
            )}

            <header className="app-header">
                <h1>🎲 Tambola Game</h1>
                <div className="header-info">
                    <button
                        className="help-btn"
                        onClick={() => setShowHelpModal(true)}
                        title="How to Play"
                    >
                        ❓ Help
                    </button>
                    <div className="room-code-display" onClick={handleCopyRoomCode} title="Click to copy">
                        Room: <strong>{roomCode}</strong>
                        <button className={`copy-btn ${roomCodeCopied ? 'copied' : ''}`}>
                            {roomCodeCopied ? '✓' : '📋'}
                        </button>
                        {roomCodeCopied && <span className="copy-tooltip">Copied!</span>}
                    </div>
                    <span className="winnings-display">
                        Total Winnings: <strong>{totalPoints} pts</strong>
                    </span>
                    <button
                        className="player-count-btn"
                        onClick={() => setShowPlayerModal(true)}
                        title="View Players"
                    >
                        👥 {playerCount} Players
                    </button>
                    <span className="game-status">
                        Status: <span className={`status-${gameStatus}`}>
                            {gameStatus === 'waiting' && players.length > 0 && players.every(p => p.isReady)
                                ? 'Ready'
                                : gameStatus === 'ended'
                                    ? 'Finished'
                                    : gameStatus}
                        </span>
                    </span>
                    <button onClick={toggleAudio} className="audio-toggle-btn" title="Toggle Audio">
                        {audioEnabled ? '🔊' : '🔇'}
                    </button>
                </div>
            </header>

            <div className="game-container">
                <div className="left-panel">


                    <NumberBoard
                        calledNumbers={calledNumbers}
                        lastCalledNumber={lastCalledNumber}
                        isHost={isHost}
                    />

                    {isHost && (
                        <>
                            <NumberCaller
                                onCallNumber={handleCallNumber}
                                gameStatus={gameStatus}
                                calledCount={calledNumbers.length}
                            />
                            <AutoCaller
                                autoCallEnabled={autoCallEnabled}
                                autoCallInterval={autoCallInterval}
                                onStart={handleStartAutoCalling}
                                onStop={handleStopAutoCalling}
                                gameStatus={gameStatus}
                            />
                        </>
                    )}
                </div>

                <div className="right-panel">
                    <PlayerTicket
                        ticket={ticket}
                        markedNumbers={markedNumbers}
                        onMarkNumber={handleMarkNumber}
                        calledNumbers={calledNumbers}
                    />

                    <ClaimButton
                        onClaim={handleClaimPrize}
                        gameStatus={gameStatus}
                        prizes={prizes}
                    />
                </div>
                {showPlayerModal && (
                    <div className="modal-overlay" onClick={() => setShowPlayerModal(false)}>
                        <div className="modal-content" onClick={e => e.stopPropagation()}>
                            <button className="modal-close-btn" onClick={() => setShowPlayerModal(false)}>×</button>
                            <PlayerList
                                players={players}
                                currentPlayerId={playerId}
                                hostName={hostName}
                                onBecomeHost={handleBecomeHost}
                                onToggleReady={handleToggleReady}
                                gameStatus={gameStatus}
                                prizes={prizes}
                            />
                        </div>
                    </div>
                )}
            </div>

            {showHelpModal && (
                <HelpModal onClose={() => setShowHelpModal(false)} />
            )}
        </div>
    );
}

export default App;
