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
const { resultsValidator, registerValidator } = require('./validators')
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

    bcrypt.hash(req.body.password, 10, function (err, hash) {
        if (err) return res.status(500).json({ msg: 'Internal error' })

        const player = new Player({
            username: req.body.username,
            email: req.body.email,
            password: hash
        })

        createAndSavePlayer(player, (err, data) => {
            if (err) return res.status(err.status).json({ msg: err.msg })

            res.json(data)
        })
    });
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

