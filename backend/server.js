const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const Game = require('./models/Game');
const Player = require('./models/Player');
const { generateTambolaTicket } = require('./utils/ticketGenerator');
const {
    validateLine,
    validateCorners,
    validateFullHouse,
    validateLastNumberMarked,
    getCompletedLines,
    validateEarlyFive
} = require('./utils/prizeValidator');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST']
    }
});

app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('✅ MongoDB connected'))
    .catch(err => console.error('❌ MongoDB connection error:', err));

// Store auto-call timers for each room
const autoCallTimers = new Map();

// Generate unique room code
function generateRoomCode() {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
}

// Auto-call number for a room
async function autoCallNumber(roomCode) {
    try {
        const game = await Game.findOne({ roomCode });

        if (!game || game.status === 'ended' || !game.autoCallEnabled) {
            // Stop auto-calling
            if (autoCallTimers.has(roomCode)) {
                clearInterval(autoCallTimers.get(roomCode));
                autoCallTimers.delete(roomCode);
            }
            return;
        }

        // Get available numbers
        const availableNumbers = [];
        for (let i = 1; i <= 90; i++) {
            if (!game.calledNumbers.includes(i)) {
                availableNumbers.push(i);
            }
        }

        if (availableNumbers.length === 0) {
            game.autoCallEnabled = false;
            await game.save();
            if (autoCallTimers.has(roomCode)) {
                clearInterval(autoCallTimers.get(roomCode));
                autoCallTimers.delete(roomCode);
            }
            return;
        }

        // Pick random number
        const randomIndex = Math.floor(Math.random() * availableNumbers.length);
        const calledNumber = availableNumbers[randomIndex];

        // Update game
        game.calledNumbers.push(calledNumber);
        game.lastCalledNumber = calledNumber;
        game.status = 'active';
        await game.save();

        // Broadcast to room
        io.to(roomCode).emit('numberCalled', {
            number: calledNumber,
            calledNumbers: game.calledNumbers
        });

        console.log(`📢 [${roomCode}] Auto-called: ${calledNumber}`);

    } catch (error) {
        console.error('Error in auto-call:', error);
    }
}

// Socket.IO connection handling
io.on('connection', (socket) => {
    console.log('👤 User connected:', socket.id);

    // Create a new room
    socket.on('createRoom', async ({ playerName, isHost }) => {
        try {
            const roomCode = generateRoomCode();
            const gameId = 'game-' + Date.now() + '-' + roomCode;

            // Create new game
            const game = new Game({
                gameId,
                roomCode,
                hostSocketId: isHost ? socket.id : null,
                hostName: isHost ? playerName : null
            });
            await game.save();

            // Generate ticket for creator
            const ticket = generateTambolaTicket();
            const player = new Player({
                name: playerName,
                socketId: socket.id,
                gameId: gameId,
                ticket: ticket
            });
            await player.save();

            // Join socket room
            socket.join(roomCode);

            // Send response
            socket.emit('roomCreated', {
                roomCode,
                ticket,
                playerId: player._id,
                playerName,
                isHost,
                totalPoints: player.totalPoints
            });

            socket.emit('gameState', {
                calledNumbers: game.calledNumbers,
                lastCalledNumber: game.lastCalledNumber,
                prizes: game.prizes,
                status: game.status,
                autoCallEnabled: game.autoCallEnabled,
                autoCallInterval: game.autoCallInterval,
                hostName: game.hostName,
                totalPoints: player.totalPoints
            });

            console.log(`🎮 Room created: ${roomCode} by ${playerName}`);

            // Broadcast player count
            const playerCount = await Player.countDocuments({ gameId });
            io.to(roomCode).emit('playerCount', { count: playerCount });

        } catch (error) {
            console.error('Error creating room:', error);
            socket.emit('error', { message: 'Failed to create room' });
        }
    });

    // Join existing room
    socket.on('joinRoom', async ({ roomCode, playerName }) => {
        try {
            const game = await Game.findOne({ roomCode: roomCode.toUpperCase() });

            if (!game) {
                socket.emit('error', { message: 'Room not found' });
                return;
            }

            if (game.status === 'ended') {
                socket.emit('error', { message: 'Game has already ended' });
                return;
            }

            // Generate ticket
            const ticket = generateTambolaTicket();
            const player = new Player({
                name: playerName,
                socketId: socket.id,
                gameId: game.gameId,
                ticket: ticket
            });
            await player.save();

            // Join socket room
            socket.join(roomCode.toUpperCase());

            // Send ticket
            socket.emit('roomJoined', {
                roomCode: roomCode.toUpperCase(),
                ticket,
                playerId: player._id,
                playerName,
                isHost: false,
                totalPoints: player.totalPoints
            });

            // Send current game state
            socket.emit('gameState', {
                calledNumbers: game.calledNumbers,
                lastCalledNumber: game.lastCalledNumber,
                prizes: game.prizes,
                status: game.status,
                autoCallEnabled: game.autoCallEnabled,
                autoCallInterval: game.autoCallInterval,
                hostName: game.hostName,
                totalPoints: player.totalPoints
            });

            console.log(`✅ ${playerName} joined room: ${roomCode.toUpperCase()}`);

            // Broadcast player count and player list
            const playerCount = await Player.countDocuments({ gameId: game.gameId });
            const allPlayers = await Player.find({ gameId: game.gameId }).select('name isReady totalPoints');
            io.to(roomCode.toUpperCase()).emit('playerCount', { count: playerCount });
            io.to(roomCode.toUpperCase()).emit('playerListUpdate', { players: allPlayers });

        } catch (error) {
            console.error('Error joining room:', error);
            socket.emit('error', { message: 'Failed to join room' });
        }
    });

    // Become host
    socket.on('becomeHost', async ({ roomCode, playerName }) => {
        try {
            const game = await Game.findOne({ roomCode });

            if (!game) {
                socket.emit('error', { message: 'Game not found' });
                return;
            }

            if (game.status !== 'waiting') {
                socket.emit('error', { message: 'Cannot change host after game has started' });
                return;
            }

            // Update host
            game.hostSocketId = socket.id;
            game.hostName = playerName;
            await game.save();

            // Notify all players
            io.to(roomCode).emit('hostChanged', {
                hostName: playerName,
                message: `${playerName} is now the host`
            });

            // Update the player who became host
            socket.emit('hostStatusChanged', { isHost: true });

            console.log(`👑 [${roomCode}] ${playerName} became host`);

        } catch (error) {
            console.error('Error changing host:', error);
            socket.emit('error', { message: 'Failed to become host' });
        }
    });

    // Toggle ready status
    socket.on('toggleReady', async ({ playerId, roomCode }) => {
        try {
            const player = await Player.findById(playerId);
            const game = await Game.findOne({ roomCode });

            if (!player || !game) {
                socket.emit('error', { message: 'Player or game not found' });
                return;
            }

            // Toggle ready status
            player.isReady = !player.isReady;
            await player.save();

            // Get all players and check if all are ready
            const allPlayers = await Player.find({ gameId: game.gameId }).select('name isReady totalPoints');
            const allReady = allPlayers.every(p => p.isReady);
            const readyCount = allPlayers.filter(p => p.isReady).length;

            // Broadcast updated player list
            io.to(roomCode).emit('playerListUpdate', {
                players: allPlayers,
                allReady,
                readyCount,
                totalCount: allPlayers.length
            });

            console.log(`${player.isReady ? '✅' : '❌'} [${roomCode}] ${player.name} ready status: ${player.isReady}`);

            // If all players are ready and there are at least 2 players, start the game
            if (allReady && allPlayers.length >= 1) {
                io.to(roomCode).emit('allPlayersReady', {
                    message: 'All players are ready! Game can start.'
                });
            }

        } catch (error) {
            console.error('Error toggling ready:', error);
            socket.emit('error', { message: 'Failed to toggle ready status' });
        }
    });

    // Call a number manually
    socket.on('callNumber', async ({ roomCode }) => {
        try {
            const game = await Game.findOne({ roomCode });

            if (!game) {
                socket.emit('error', { message: 'Game not found' });
                return;
            }

            if (game.status === 'ended') {
                socket.emit('error', { message: 'Game has ended' });
                return;
            }

            // Get available numbers
            const availableNumbers = [];
            for (let i = 1; i <= 90; i++) {
                if (!game.calledNumbers.includes(i)) {
                    availableNumbers.push(i);
                }
            }

            if (availableNumbers.length === 0) {
                socket.emit('error', { message: 'All numbers have been called' });
                return;
            }

            // Pick random number
            const randomIndex = Math.floor(Math.random() * availableNumbers.length);
            const calledNumber = availableNumbers[randomIndex];

            // Update game
            game.calledNumbers.push(calledNumber);
            game.lastCalledNumber = calledNumber;
            game.status = 'active';
            await game.save();

            // Broadcast to room
            io.to(roomCode).emit('numberCalled', {
                number: calledNumber,
                calledNumbers: game.calledNumbers
            });

            console.log(`📢 [${roomCode}] Manual call: ${calledNumber}`);

        } catch (error) {
            console.error('Error calling number:', error);
            socket.emit('error', { message: 'Failed to call number' });
        }
    });

    // Start auto-calling
    socket.on('startAutoCalling', async ({ roomCode, interval }) => {
        try {
            const game = await Game.findOne({ roomCode });

            if (!game) {
                socket.emit('error', { message: 'Game not found' });
                return;
            }

            // Update game settings
            game.autoCallEnabled = true;
            game.autoCallInterval = interval || 5;
            await game.save();

            // Clear existing timer if any
            if (autoCallTimers.has(roomCode)) {
                clearInterval(autoCallTimers.get(roomCode));
            }

            // Start new timer
            const timer = setInterval(() => {
                autoCallNumber(roomCode);
            }, game.autoCallInterval * 1000);

            autoCallTimers.set(roomCode, timer);

            // Broadcast to room
            io.to(roomCode).emit('autoCallingStarted', {
                interval: game.autoCallInterval
            });

            console.log(`🤖 [${roomCode}] Auto-calling started (${game.autoCallInterval}s)`);

        } catch (error) {
            console.error('Error starting auto-calling:', error);
            socket.emit('error', { message: 'Failed to start auto-calling' });
        }
    });

    // Stop auto-calling
    socket.on('stopAutoCalling', async ({ roomCode }) => {
        try {
            const game = await Game.findOne({ roomCode });

            if (!game) {
                socket.emit('error', { message: 'Game not found' });
                return;
            }

            // Update game
            game.autoCallEnabled = false;
            await game.save();

            // Clear timer
            if (autoCallTimers.has(roomCode)) {
                clearInterval(autoCallTimers.get(roomCode));
                autoCallTimers.delete(roomCode);
            }

            // Broadcast to room
            io.to(roomCode).emit('autoCallingStopped');

            console.log(`⏸️ [${roomCode}] Auto-calling stopped`);

        } catch (error) {
            console.error('Error stopping auto-calling:', error);
            socket.emit('error', { message: 'Failed to stop auto-calling' });
        }
    });

    // Mark a number
    socket.on('markNumber', async ({ playerId, number }) => {
        try {
            const player = await Player.findById(playerId);

            if (!player) {
                socket.emit('error', { message: 'Player not found' });
                return;
            }

            // Check if number is in ticket
            let numberInTicket = false;
            for (let row of player.ticket) {
                if (row.includes(number)) {
                    numberInTicket = true;
                    break;
                }
            }

            if (!numberInTicket) {
                socket.emit('error', { message: 'Number not in your ticket' });
                return;
            }

            // Add to marked numbers
            if (!player.markedNumbers.includes(number)) {
                player.markedNumbers.push(number);
                await player.save();
            }

            socket.emit('numberMarked', {
                number,
                markedNumbers: player.markedNumbers
            });

        } catch (error) {
            console.error('Error marking number:', error);
            socket.emit('error', { message: 'Failed to mark number' });
        }
    });

    // Claim prize
    socket.on('claimPrize', async ({ playerId, prizeType, roomCode }) => {
        try {
            const player = await Player.findById(playerId);
            const game = await Game.findOne({ roomCode });

            if (!player || !game) {
                socket.emit('claimRejected', {
                    message: 'Player or game not found',
                    prizeType
                });
                return;
            }

            // Validate last number is marked
            if (!validateLastNumberMarked(player.markedNumbers, game.lastCalledNumber)) {
                socket.emit('claimRejected', {
                    message: `❌ Last called number (${game.lastCalledNumber}) is not marked on your ticket!`,
                    prizeType,
                    lastNumber: game.lastCalledNumber
                });
                return;
            }

            let isValid = false;
            let points = 0;
            let prizeKey = '';

            // Validate prize
            if (prizeType === 'firstLine' || prizeType === 'secondLine' || prizeType === 'thirdLine') {
                const completedLines = getCompletedLines(player.ticket, player.markedNumbers);

                if (prizeType === 'firstLine' && !game.prizes.firstLine.claimed && completedLines.length >= 1) {
                    isValid = true;
                    prizeKey = 'firstLine';
                    points = game.prizes.firstLine.points;
                } else if (prizeType === 'secondLine' && !game.prizes.secondLine.claimed && completedLines.length >= 2) {
                    isValid = true;
                    prizeKey = 'secondLine';
                    points = game.prizes.secondLine.points;
                } else if (prizeType === 'thirdLine' && !game.prizes.thirdLine.claimed && completedLines.length >= 3) {
                    isValid = true;
                    prizeKey = 'thirdLine';
                    points = game.prizes.thirdLine.points;
                }
            } else if (prizeType === 'corners') {
                if (!game.prizes.corners.claimed && validateCorners(player.ticket, player.markedNumbers)) {
                    isValid = true;
                    prizeKey = 'corners';
                    points = game.prizes.corners.points;
                }
            } else if (prizeType === 'early5') {
                if (!game.prizes.early5.claimed && validateEarlyFive(player.ticket, player.markedNumbers)) {
                    isValid = true;
                    prizeKey = 'early5';
                    points = game.prizes.early5.points;
                }
            } else if (prizeType === 'fullHouse') {
                if (game.prizes.fullHouse.winners.length < game.prizes.fullHouse.maxWinners &&
                    validateFullHouse(player.ticket, player.markedNumbers)) {
                    isValid = true;
                    prizeKey = 'fullHouse';
                    points = game.prizes.fullHouse.points;
                }
            }

            if (!isValid) {
                socket.emit('claimRejected', {
                    message: 'Invalid claim or prize already awarded',
                    prizeType
                });
                return;
            }

            // Award prize
            if (prizeKey === 'fullHouse') {
                game.prizes.fullHouse.winners.push(player.name);
            } else {
                game.prizes[prizeKey].claimed = true;
                game.prizes[prizeKey].winner = player.name;
            }

            player.prizesWon.push(prizeType);
            player.totalPoints += points;

            await game.save();
            await player.save();

            // Broadcast to room
            io.to(roomCode).emit('prizeAwarded', {
                prizeType,
                winner: player.name,
                points,
                prizes: game.prizes
            });

            // Sync players for updated points
            const updatedPlayers = await Player.find({ gameId: game.gameId }).select('name isReady totalPoints');
            io.to(roomCode).emit('playerListUpdate', { players: updatedPlayers });

            console.log(`🏆 [${roomCode}] ${player.name} won ${prizeType} (${points} points)`);

            // Auto-pause number calling if enabled
            let wasAutoCalling = game.autoCallEnabled;
            if (wasAutoCalling) {
                game.autoCallEnabled = false;
                await game.save();

                if (autoCallTimers.has(roomCode)) {
                    clearInterval(autoCallTimers.get(roomCode));
                    autoCallTimers.delete(roomCode);
                }

                io.to(roomCode).emit('autoCallingPaused', {
                    message: 'Game paused for winner celebration!',
                    resumeIn: 8500
                });
            }

            // Check if game should end
            const allPrizesAwarded =
                game.prizes.early5.claimed &&
                game.prizes.firstLine.claimed &&
                game.prizes.secondLine.claimed &&
                game.prizes.thirdLine.claimed &&
                game.prizes.corners.claimed &&
                game.prizes.fullHouse.winners.length >= game.prizes.fullHouse.maxWinners;

            if (allPrizesAwarded) {
                game.status = 'ended';
                game.autoCallEnabled = false;
                await game.save();

                // Stop auto-calling (final)
                if (autoCallTimers.has(roomCode)) {
                    clearInterval(autoCallTimers.get(roomCode));
                    autoCallTimers.delete(roomCode);
                }

                io.to(roomCode).emit('gameEnded', {
                    message: 'All prizes have been awarded! Game Over!',
                    prizes: game.prizes
                });

                console.log(`🎉 [${roomCode}] Game ended`);
            } else if (wasAutoCalling) {
                // Auto-resume after celebration (8.5s)
                setTimeout(async () => {
                    try {
                        const refreshedGame = await Game.findOne({ roomCode });
                        if (refreshedGame && refreshedGame.status === 'active' && !allPrizesAwarded) {
                            refreshedGame.autoCallEnabled = true;
                            await refreshedGame.save();

                            const timer = setInterval(() => {
                                autoCallNumber(roomCode);
                            }, refreshedGame.autoCallInterval * 1000);

                            autoCallTimers.set(roomCode, timer);
                            io.to(roomCode).emit('autoCallingResumed');
                            console.log(`▶️ [${roomCode}] Auto-calling resumed after celebration`);
                        }
                    } catch (err) {
                        console.error('Error resuming auto-call:', err);
                    }
                }, 8500);
            }

        } catch (error) {
            console.error('Error claiming prize:', error);
            socket.emit('claimRejected', {
                message: 'Failed to process claim',
                prizeType
            });
        }
    });

    socket.on('disconnect', () => {
        console.log('👋 User disconnected:', socket.id);
    });
});

// REST API endpoints
app.get('/api/game/status/:roomCode', async (req, res) => {
    try {
        const game = await Game.findOne({ roomCode: req.params.roomCode.toUpperCase() });
        if (!game) {
            return res.status(404).json({ error: 'Room not found' });
        }
        res.json(game);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch game status' });
    }
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
