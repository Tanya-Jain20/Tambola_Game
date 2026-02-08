const mongoose = require('mongoose');

const playerSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    socketId: {
        type: String,
        required: true
    },
    gameId: {
        type: String,
        required: true
    },
    ticket: {
        type: [[Number]], // 3x9 grid
        required: true
    },
    markedNumbers: {
        type: [Number],
        default: []
    },
    prizesWon: {
        type: [String],
        default: []
    },
    totalPoints: {
        type: Number,
        default: 0
    },
    isReady: {
        type: Boolean,
        default: false
    },
    joinedAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Player', playerSchema);
