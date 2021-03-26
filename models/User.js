const mongoose = require('mongoose');

const UserSchema = mongoose.Schema({
    accountName: String,
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