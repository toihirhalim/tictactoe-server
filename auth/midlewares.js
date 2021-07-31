const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const createAndSavePlayer = require('../database').createAndSavePlayer;
const findPlayerByUsernameOrEmail = require('../database').findPlayerByUsernameOrEmail;
const { resultsValidator } = require('./validators')
const Player = require('../model/Player')

const secretToken = process.env.ACCESS_TOKEN_SECRET || 'secret_code_for_token'
const secretRefreshToken = process.env.REFRESH_TOKEN_SECRET || 'secret_code_for_refresh_token'

const authenticate = (req, res, next) => {
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]

    if (!token) return res.sendStatus(401)

    jwt.verify(token, secretToken, (err, player) => {
        if (err) return res.sendStatus(403)

        req.player = player

        next()
    })
}

const verifyErrors = (req, res, next) => {
    const errors = resultsValidator(req)
    if (errors.length > 0)
        return res.status(400).json({ msg: errors })

    next()
}

const registerPlayer = (req, res, next) => {
    bcrypt.hash(req.body.password, 10, (err, hash) => {
        if (err) return res.sendStatus(500)

        const player = new Player({
            username: req.body.username,
            email: req.body.email,
            password: hash
        })

        createAndSavePlayer(player, (err, data) => {
            if (err) return res.status(err.status).json({ msg: err.msg })

            req.tokenData = { id: data.id, username: data.username }

            next()
        })
    });
}

const loginPlayer = (req, res, next) => {
    findPlayerByUsernameOrEmail(req.body.username, (err, data) => {
        if (err) return res.status(400).json({ msg: errors })

        if (!data) return res.status(401).json({ msg: 'Username or Email not found' })

        bcrypt.compare(req.body.password, data.password, (err, result) => {
            if (err) return res.sendStatus(500)

            if (!result) return res.status(401).json({ msg: 'Pasword incorrect' })

            req.tokenData = { id: data.id, username: data.username }

            next()
        });
    })
}

const generateAccesToken = (req, res, next) => {
    const tokenData = req.tokenData
    jwt.sign(tokenData, secretToken, { expiresIn: '15m' }, (err, token) => {
        if (err) return res.sendStatus(500)

        req.jwtToken = token
        next()
    })
}

const generateRefreshToken = (req, res, next) => {
    const tokenData = req.tokenData
    jwt.sign(tokenData, secretRefreshToken, (err, token) => {
        if (err) return res.sendStatus(500)

        req.jwtRefreshToken = token
        next()
    })
}

const verifyRefreshToken = (req, res, next) => {
    const refreshToken = req.body.refreshToken

    if (!refreshToken) return res.sendStatus(401)

    //TODO: if refresh token doesn't exist in database return res.sendStatus(403)

    jwt.verify(refreshToken, secretRefreshToken, (err, player) => {
        if (err) return res.sendStatus(403)

        req.tokenData = { id: player.id, username: player.username }
        next()
    });
}

module.exports = {
    authenticate,
    verifyErrors,
    registerPlayer,
    loginPlayer,
    generateAccesToken,
    generateRefreshToken,
    verifyRefreshToken
}