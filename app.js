require('dotenv').config()
var cors = require('cors')
const express = require('express')
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server, {
    cors: {
        origin: [
            "https://toihirhalim.github.io/tictactoe-react-redux",
            process.env.FRONTEND_URL
        ]
    }
});
const bcrypt = require('bcrypt')
const Player = require('./model/Player');
const createAndSavePlayer = require('./database').createAndSavePlayer;
const findPlayerByUsernameOrEmail = require('./database').findPlayerByUsernameOrEmail;
const { resultsValidator, registerValidator, loginValidator } = require('./validators')
app.use(express.json())

app.use(cors({
    origin: ['https://toihirhalim.github.io/tictactoe-react-redux', process.env.FRONTEND_URL]
}))

app.get("/", (req, res) => {
    res.redirect(process.env.FRONTEND_URL || "https://toihirhalim.github.io/tictactoe-react-redux")
})

app.post('/register', registerValidator(), (req, res) => {

    const errors = resultsValidator(req)
    if (errors.length > 0)
        return res.status(400).json({ msg: errors })

    bcrypt.hash(req.body.password, 10, (err, hash) => {
        if (err) return res.status(500).json({ msg: 'Internal error' })

        const player = new Player({
            username: req.body.username,
            email: req.body.email,
            password: hash
        })

        createAndSavePlayer(player, (err, data) => {
            if (err) return res.status(err.status).json({ msg: err.msg })

            res.json({ username: data.uername })
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
            if (err) return res.status(500).json({ msg: 'Internal Error' })

            if (!result) return res.status(401).json({ msg: 'Pasword incorrect' })

            res.json({ username: data.username })
        });
    })
})

let online = 0

io.on('connection', socket => {
    console.log("connected " + socket.id)
    console.log(++online + " online")

    socket.on('disconnect', function () {
        console.log(socket.id + ' disconnected')
        console.log(--online + " online")
    });
})

server.listen(process.env.PORT || 3000, () => {
    console.log('server is running on port ' + server.address().port)
});

