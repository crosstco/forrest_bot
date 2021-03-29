const mongoose = require('mongoose');

const LobbySchema = mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users',
    },
    name: String,
    private: {
        isPrivate: Boolean,
        whitelist: [String],
    },
    capacity: Number,
    game: String,
    active: Boolean,
});

module.exports = mongoose.model('lobby', LobbySchema);
