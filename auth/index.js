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
    logoutPlayer
} = require('./midlewares')

module.exports = (app) => {

    app.post('/register', registerValidator(), verifyErrors, registerPlayer,
        generateAccesToken, generateRefreshToken, saveRefreshToken, (req, res) => {
            res.json({ token: req.jwtToken, refreshToken: req.jwtRefreshToken })
        })

    app.post('/login', loginValidator(), verifyErrors, loginPlayer,
        generateAccesToken, generateRefreshToken, saveRefreshToken, (req, res) => {
            res.json({ token: req.jwtToken, refreshToken: req.jwtRefreshToken })
        })

    app.post('/logout', logoutValidator(), verifyErrors, logoutPlayer, (req, res) => {
        res.status(200).json({ msg: 'loged out succesfly' })
    })

    app.post('/token', verifyRefreshToken, generateAccesToken, (req, res) => {
        res.json({ newToken: req.jwtToken })
    })

    app.get('/authorization-test', authenticate, (req, res) => {
        res.json({ player: req.player })
    })
}