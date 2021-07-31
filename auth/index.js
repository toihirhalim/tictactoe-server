const { registerValidator, loginValidator } = require('./validators')
const {
    authenticate,
    verifyErrors,
    registerPlayer,
    loginPlayer,
    generateAccesToken,
    generateRefreshToken,
    verifyRefreshToken
} = require('./midlewares')

module.exports = (app) => {

    app.post('/register', registerValidator(), verifyErrors, registerPlayer, generateAccesToken, generateRefreshToken, (req, res) => {
        res.json({ token: req.jwtToken, refreshToken: req.jwtRefreshToken })
    })

    app.post('/login', loginValidator(), verifyErrors, loginPlayer, generateAccesToken, generateRefreshToken, (req, res) => {
        res.json({ token: req.jwtToken, refreshToken: req.jwtRefreshToken })
    })

    app.post('/token', verifyRefreshToken, generateAccesToken, (req, res) => {
        res.json({ newToken: req.jwtToken })
    })

    app.get('/authorization-test', authenticate, (req, res) => {
        res.json({ player: req.player })
    })
}