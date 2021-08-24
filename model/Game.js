function Game(player1, player2) {
    this.player1 = { id: player1, value: 'x' }
    this.player2 = { id: player1, value: 'o' }
    this.board = [
        ['', '', ''],
        ['', '', ''],
        ['', '', '']
    ]
    this.player1Turn = true
    this.gameOver = false
    this.lastPosition = null

    this.play = (x, y) => {
        if (this.board[x][y] !== '') return false

        this.board[x][y] = this.player1Turn ? this.player1.value : this.player2.value
        this.player1Turn = !this.player1Turn
        this.lastPosition = { x, y }

        this.gameOver = this.board.every(row => row.every(col => col !== ''))

        return true
    }

    this.getStatus = () => {
        const board = this.board
        const pos = this.lastPosition
        const status = { result: 'UNKNOWN', types: [] }

        if (!pos) return status

        //check column win
        if (board[0][pos.y] === board[1][pos.y] && board[1][pos.y] === board[2][pos.y]) {
            status.result = 'WIN'
            status.types.push('col')
        }

        //check row win
        if (board[pos.x][0] === board[pos.x][1] && board[pos.x][1] === board[pos.x][2]) {
            status.result = 'WIN'
            status.types.push('row')
        }

        //check diagno win
        if (pos.x === pos.y && board[0][0] === board[1][1] && board[1][1] === board[2][2]) {
            status.result = 'WIN'
            status.types.push('diag')
        }

        //check other diagno win
        if (3 - pos.x - pos.y === 1 && board[0][2] === board[1][1] && board[1][1] === board[2][0]) {
            status.result = 'WIN'
            status.types.push('adiag')
        }

        if (status.result === 'WIN')
            this.gameOver = true

        return status
    }

}
module.exports = Game