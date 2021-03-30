const mongoose = require('mongoose');

const LobbySchema = mongoose.Schema({
    owner: {
        type: String,
        ref: 'users',
    },
    name: String,
    channels: {
        voice: String,
        text: String,
    },
    type: {
        type: String,
        default: 'private',
    },
    whitelist: [],
    capacity: {
        type: Number,
        default: 0,
    },
    topic: String,
    isActive: Boolean,
});

module.exports = mongoose.model('lobby', LobbySchema);
