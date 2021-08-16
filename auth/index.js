const { registerValidator, loginValidator, logoutValidator } = require('./validators')
const {
    authenticate,
    verifyErrors,
    registerPlayer,
    loginPlayer,
    generateAccesToken,
    generateRefreshToken,
    verifyRefreshToken,
    saveRefreshToken,
    logoutPlayer,
    getPlayerInfos,
    getPlayerPublicInfosByUsername
} = require('./midlewares')
const refreshTokenMaxAge = (process.env.REFRESH_TOKEN_EXPIRE_IN || 30) * 24 * 60 * 60 * 1000

module.exports = (app) => {
    app.post('/register', registerValidator(), verifyErrors, registerPlayer,
        generateAccesToken, generateRefreshToken, saveRefreshToken, (req, res) => {
            res.cookie('refreshToken', req.refreshToken, {
                maxAge: refreshTokenMaxAge,
                httpOnly: true,
                signed: true,
                sameSite: true
            })
            res.json({
                token: req.token,
                player: req.player
            })
        })

    app.post('/login', loginValidator(), verifyErrors, loginPlayer,
        generateAccesToken, generateRefreshToken, saveRefreshToken, (req, res) => {
            res.cookie('refreshToken', req.refreshToken, {
                maxAge: refreshTokenMaxAge,
                httpOnly: true,
                signed: true,
                sameSite: true
            })
            res.json({
                token: req.token,
                player: req.player
            })
        })

    app.get('/logout', logoutPlayer, (req, res) => {
        res.clearCookie('refreshToken');
        res.status(200).json({ msg: 'loged out succesfly' })
    })

    app.get('/token', verifyRefreshToken, generateAccesToken, (req, res) => {
        res.json({ newToken: req.token })
    })

    app.get('/authorization-test', authenticate, (req, res) => {
        res.json({ player: req.player })
    })

    app.get('/player/:username', getPlayerPublicInfosByUsername, (req, res) => {
        res.json(req.player)
    })

    app.get('/player', authenticate, getPlayerInfos, (req, res) => {
        res.json(req.player)
    })

    app.get('/isloggedin', verifyRefreshToken, generateAccesToken, (req, res) => {
        res.json({
            token: req.token,
            player: req.player
        })
    })
}