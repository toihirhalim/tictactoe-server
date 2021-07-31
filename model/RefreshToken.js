const mongoose = require("mongoose");
const { Schema } = mongoose;

const refreshTokenExpiration = process.env.REFRESH_TOKEN_EXPIRE_IN || 30

const RefreshTokenSchema = new Schema({
    playerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Player'
    },
    value: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now(),
        expires: refreshTokenExpiration * 24 * 60 * 60
    }
});

module.exports = mongoose.model("RefreshToken", RefreshTokenSchema);