const { v4: uuidv4 } = require('uuid');
const Game = require('../model/Game')
let online = 0
const games = {}
const gameRequests = []

module.exports = (io) => {
    io.on('connection', socket => {
        ++online
        io.emit('online', online)
        io.to(socket.id).emit('games', Object.keys(games).length)

        socket.on('play-request', playerId => {
            if (gameRequests.length === 0) {
                gameRequests.push({ socketId: socket.id, playerId })
                setTimeout(() => {
                    const index = gameRequests.findIndex(req => req.socketId === socket.id)

                    if (index >= 0) {
                        gameRequests.splice(index, 1)
                        io.to(socket.id).emit('request-rejected')
                    }
                }, 10000);
            }
            else {
                const gameRequest = gameRequests.splice(0, 1)[0]
                const id = uuidv4()
                games[id] = new Game(gameRequest.playerId, playerId)
                io.to(socket.id,).to(gameRequest.socketId).emit('request-accepted', id)
                io.emit('games', Object.keys(games).length)
            }
        })

        socket.on('disconnect', () => {
            online--
            io.emit('online', online)
        });
    })
}