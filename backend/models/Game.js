const mongoose = require('mongoose');

const gameSchema = new mongoose.Schema({
    gameId: {
        type: String,
        required: true,
        unique: true
    },
    roomCode: {
        type: String,
        required: true,
        unique: true,
        uppercase: true
    },
    calledNumbers: {
        type: [Number],
        default: []
    },
    lastCalledNumber: {
        type: Number,
        default: null
    },
    status: {
        type: String,
        enum: ['waiting', 'active', 'ended'],
        default: 'waiting'
    },
    autoCallEnabled: {
        type: Boolean,
        default: false
    },
    autoCallInterval: {
        type: Number,
        default: 5 // seconds
    },
    hostSocketId: {
        type: String,
        default: null
    },
    hostName: {
        type: String,
        default: null
    },
    prizes: {
        early5: {
            claimed: { type: Boolean, default: false },
            winner: { type: String, default: null },
            points: { type: Number, default: 50 }
        },
        firstLine: {
            claimed: { type: Boolean, default: false },
            winner: { type: String, default: null },
            points: { type: Number, default: 100 }
        },
        secondLine: {
            claimed: { type: Boolean, default: false },
            winner: { type: String, default: null },
            points: { type: Number, default: 100 }
        },
        thirdLine: {
            claimed: { type: Boolean, default: false },
            winner: { type: String, default: null },
            points: { type: Number, default: 100 }
        },
        corners: {
            claimed: { type: Boolean, default: false },
            winner: { type: String, default: null },
            points: { type: Number, default: 50 }
        },
        fullHouse: {
            winners: { type: [String], default: [] },
            points: { type: Number, default: 200 },
            maxWinners: { type: Number, default: 2 }
        }
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Game', gameSchema);
