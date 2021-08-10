const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const { createAndSavePlayer,
    findPlayerByUsernameOrEmail,
    createAndSaveRefreshToken,
    findRefreshTokenByToken,
    deleteRefreshToken,
    findPlayerByUsername
} = require('../database')
const { resultsValidator } = require('./validators')
const Player = require('../model/Player')
const RefreshToken = require('../model/RefreshToken')

const secretToken = process.env.ACCESS_TOKEN_SECRET || 'secret_code_for_token'
const secretRefreshToken = process.env.REFRESH_TOKEN_SECRET || 'secret_code_for_refresh_token'

const accesTokenExpiration = process.env.ACCES_TOKEN_EXPIRE_IN || '15m'
const refreshTokenExpiration = (process.env.REFRESH_TOKEN_EXPIRE_IN || '30') + 'd'

const authenticate = (req, res, next) => {
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]

    if (!token) return res.sendStatus(401)

    jwt.verify(token, secretToken, (err, player) => {
        if (err) return res.sendStatus(403)

        req.player = { id: player.id, username: player.username }

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

            req.player = { id: data.id, username: data.username }

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
            req.player = { id: data.id, username: data.username }

            next()
        });
    })
}

const generateAccesToken = (req, res, next) => {
    const tokenData = req.player
    jwt.sign(tokenData, secretToken, { expiresIn: accesTokenExpiration }, (err, token) => {
        if (err) return res.sendStatus(500)

        req.token = token

        next()
    })
}

const generateRefreshToken = (req, res, next) => {
    const tokenData = req.player
    jwt.sign(tokenData, secretRefreshToken, { expiresIn: refreshTokenExpiration }, (err, token) => {
        if (err) return res.sendStatus(500)

        req.refreshToken = token

        next()
    })
}

const saveRefreshToken = (req, res, next) => {
    const refreshToken = new RefreshToken({
        value: req.refreshToken,
        playerId: req.player.id
    })

    createAndSaveRefreshToken(refreshToken, (err, data) => {
        if (err) return res.sendStatus(500)

        next()
    })
}

const verifyRefreshToken = (req, res, next) => {
    const refreshToken = req.signedCookies.refreshToken

    if (!refreshToken) return res.sendStatus(401)

    findRefreshTokenByToken(refreshToken, (err, data) => {
        if (err) return res.sendStatus(500)

        if (!data) return res.sendStatus(403)

        jwt.verify(refreshToken, secretRefreshToken, (err, player) => {
            if (err) return res.sendStatus(403)

            req.player = { id: player.id, username: player.username }

            next()
        });
    })

}

const logoutPlayer = (req, res, next) => {
    refreshToken = req.signedCookies.refreshToken

    deleteRefreshToken(refreshToken, (err, data) => {
        if (err) return res.sendStatus(500)

        next()
    })
}

const getPlayerByUsername = (req, res, next) => {
    findPlayerByUsername(req.params.username, (err, data) => {
        if (err) return res.sendStatus(500)

        if (!data) return res.status(401).json({ msg: 'Username not found' })

        req.player = data

        next()
    })
}

module.exports = {
    authenticate,
    verifyErrors,
    registerPlayer,
    loginPlayer,
    generateAccesToken,
    generateRefreshToken,
    saveRefreshToken,
    verifyRefreshToken,
    logoutPlayer,
    getPlayerByUsername
}