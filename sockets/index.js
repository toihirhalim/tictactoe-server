let online = 0
const games = {}

module.exports = (io) => {
    io.on('connection', socket => {
        ++online
        io.emit('online', online)
        io.to(socket.id).emit('games', Object.keys(games).length)

        socket.on('disconnect', () => {
            online--
            io.emit('online', online)
        });
    })
}