const express = require("express")
require('dotenv').config();
const app = express()

app.get("/", function (req, res) {
    res.redirect(process.env.FRONTEND_URL || "https://toihirhalim.github.io/tictactoe-react-redux")
})

app.listen(process.env.PORT || 3000,
    () => console.log("Server is running..."));

