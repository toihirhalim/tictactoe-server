const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const Player = require('./model/Player');
const createAndSavePlayer = require('./database').createAndSavePlayer;
const findPlayerByUsernameOrEmail = require('./database').findPlayerByUsernameOrEmail;
const { resultsValidator, registerValidator, loginValidator } = require('./validators')
const secretToken = process.env.ACCESS_TOKEN_SECRET || 'secret_code_for_token'
const secretRefreshToken = process.env.REFRESH_TOKEN_SECRET || 'secret_code_for_refresh_token'

module.exports = (app) => {
    const authenticate = (req, res, next) => {
        const authHeader = req.headers['authorization']
        const token = authHeader && authHeader.split(' ')[1]

        if (!token) return res.sendStatus(401)

        jwt.verify(token, secretToken, (err, player) => {
            if (err) return res.sendStatus(403)

            req.player = player

            next()
        });
    }

    const generateAccesToken = (player, done) => {
        jwt.sign(player, secretToken, { expiresIn: '15m' }, (err, token) => done(err, token))
    }

    const generateRefreshToken = (player, done) => {
        jwt.sign(player, secretRefreshToken, (err, token) => done(err, token))
    }

    app.post('/register', registerValidator(), (req, res) => {

        const errors = resultsValidator(req)
        if (errors.length > 0)
            return res.status(400).json({ msg: errors })

        bcrypt.hash(req.body.password, 10, (err, hash) => {
            if (err) return res.sendStatus(500)

            const player = new Player({
                username: req.body.username,
                email: req.body.email,
                password: hash
            })

            createAndSavePlayer(player, (err, data) => {
                if (err) return res.status(err.status).json({ msg: err.msg })

                generateAccesToken({ username: data.username }, (err, token) => {
                    if (err) return res.sendStatus(500)

                    generateRefreshToken({ username: data.username }, (err, refreshToken) => {
                        if (err) return res.sendStatus(500)

                        res.json({ token, refreshToken })
                    })
                })
            })
        });
    })

    app.post('/login', loginValidator(), (req, res) => {
        const errors = resultsValidator(req)
        if (errors.length > 0)
            return res.status(400).json({ msg: errors })

        findPlayerByUsernameOrEmail(req.body.username, (err, data) => {
            if (err) return res.status(400).json({ msg: errors })

            if (!data) return res.status(401).json({ msg: 'Username or Email not found' })

            bcrypt.compare(req.body.password, data.password, (err, result) => {
                if (err) return res.sendStatus(500)

                if (!result) return res.status(401).json({ msg: 'Pasword incorrect' })

                generateAccesToken({ username: data.username }, (err, token) => {
                    if (err) return res.sendStatus(500)

                    generateRefreshToken({ username: data.username }, (err, refreshToken) => {
                        if (err) return res.sendStatus(500)

                        res.json({ token, refreshToken })
                    })
                })
            });
        })
    })

    app.post('/token', (req, res) => {
        const refreshToken = req.body.refreshToken

        if (!refreshToken) return res.sendStatus(401)

        //TODO: if refresh token doesn't exist in database return res.sendStatus(403)

        jwt.verify(refreshToken, secretRefreshToken, (err, player) => {
            if (err) return res.sendStatus(403)

            generateAccesToken({ username: player.username }, (err, token) => {
                if (err) return res.sendStatus(500)

                res.json({ token })
            })

        });
    })

    app.get('/authorization-test', authenticate, (req, res) => {
        res.json({ player: req.player })
    })

}