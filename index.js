const express = require('express');
const cors = require('cors');
const { appRouter } = require('./routes');
require('dotenv').config()
/*  */
const app = express()
const PORT = process.env.PORT || 3000;
/*  */
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cors())
/* call route */
app.use(appRouter)

app.use("*", (req, res) => {
    res.send("Hello")
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
