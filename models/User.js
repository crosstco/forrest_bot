const mongoose = require('mongoose');

const UserSchema = mongoose.Schema({
    discordID: String,
    displayName: String,
    nickname: String,
    motto: String,
    dateJoined: {
        type: Date,
        default: Date.now,
    },
    experience: Number,
    stats: {
        messagesSent: Number,
        voiceMinutes: Number,
    },
    achievements: [{ achievementID: Number, date: Date }],
    violations: Number,
});

module.exports = mongoose.model('user', UserSchema);
