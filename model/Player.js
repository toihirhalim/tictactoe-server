const mongoose = require("mongoose");
const { Schema } = mongoose;

const UserSchema = new Schema({
    username: {
        type: String,
        unique: true,
        required: true,
        dropDups: true
    },
    email: {
        type: String,
        unique: true,
        required: true,
        dropDups: true
    },
    password: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now()
    },
    statistics: {
        rating: Number,
        wins: Number,
        losses: Number,
        draws: Number
    }
});

module.exports = mongoose.model("player", UserSchema);