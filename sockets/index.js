let online = 0

module.exports = (io) => {
    io.on('connection', socket => {
        console.log("connected " + socket.id)
        console.log(++online + " online")

        socket.on('disconnect', function () {
            console.log(socket.id + ' disconnected')
            console.log(--online + " online")
        });
    })
}