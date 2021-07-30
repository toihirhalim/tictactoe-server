require('dotenv').config()
var cors = require('cors')
const express = require('express')
const app = express();
const auth = require('./auth')
const server = require('http').createServer(app)
const io = require('socket.io')(server, {
    cors: {
        origin: [
            "https://toihirhalim.github.io/tictactoe-react-redux",
            process.env.FRONTEND_URL
        ]
    }
});
app.use(express.json())

app.use(cors({
    origin: ['https://toihirhalim.github.io/tictactoe-react-redux', process.env.FRONTEND_URL]
}))

auth(app)
app.get("/", (req, res) => {
    res.redirect(process.env.FRONTEND_URL || "https://toihirhalim.github.io/tictactoe-react-redux")
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

