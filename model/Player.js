const mongoose = require("mongoose");
const { Schema } = mongoose;

const UserSchema = new Schema({
    username: {
        type: String,
        trim: true,
        unique: true,
        required: true,
        dropDups: true
    },
    email: {
        type: String,
        trim: true,
        unique: true,
        sparse: true,
        dropDups: true
    },
    name: {
        type: String,
        trim: true
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

module.exports = mongoose.model("Player", UserSchema);