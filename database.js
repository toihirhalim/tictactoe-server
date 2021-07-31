require('dotenv').config();
const Player = require('./model/Player')
const RefreshToken = require('./model/RefreshToken')
const mongoose = require('mongoose');

mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true
}, (err) => {
    if (err) throw err;
    console.log('connected to database')
});

const createAndSavePlayer = (player, done) => {
    player.save((err, data) => {
        if (err) {
            err.msg = 'Internal server error'
            err.status = 500

            if (err.name === 'MongoError' && err.code === 11000) {
                err.msg = Object.keys(err.keyValue)[0] + " already exists."
                err.status = 409
            }
            else
                console.log(err)

            done({ msg: err.msg, status: err.status })
        } else
            done(null, data);
    });
}

const findPlayerByUsername = (username, done) => {
    Player.findOne({ username: username }, (err, data) => {
        if (err) {
            console.log(err)
            done({ msg: 'Internal Error', status: 500 })
        } else
            done(null, data);
    });
}

const findPlayerByUsernameOrEmail = (username, done) => {
    Player.findOne({
        $or: [
            { username: username },
            { email: username }
        ]
    }, (err, data) => {
        if (err) {
            console.log(err)
            done({ msg: 'Internal Error', status: 500 })
        } else
            done(null, data);
    });
}

const createAndSaveRefreshToken = (refreshToken, done) => {
    refreshToken.save((err, data) => {
        if (err) console.log(err)

        done(err, data);
    });
}

const findRefreshTokenByToken = (token, done) => {
    RefreshToken.findOne({ value: token }, (err, data) => {
        if (err) console.log(err)

        done(err, data);
    });
}

const findRefreshTokenByplayerId = (playerId, done) => {
    RefreshToken.findOne({ playerId: playerId }, (err, data) => {
        if (err) console.log(err)

        done(err, data);
    });
}

module.exports = {
    createAndSavePlayer,
    findPlayerByUsername,
    findPlayerByUsernameOrEmail,
    createAndSaveRefreshToken,
    findRefreshTokenByToken,
    findRefreshTokenByplayerId
}