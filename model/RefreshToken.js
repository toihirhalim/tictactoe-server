const mongoose = require("mongoose");
const { Schema } = mongoose;

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
        default: Date.now()
    }
});

module.exports = mongoose.model("RefreshToken", RefreshTokenSchema);