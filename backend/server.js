const dotenv = require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();

// MIDDLEWARES
app.use(express.json())
app.use(express.urlencoded({extended: false}))
app.use(bodyParser.json())

// ROUTES
app.get('/', (req, res) => {
  res.send('homepage')
})

const PORT = process.env.PORT || 5000;

//connect to DB and start server
mongoose
  .connect(process.env.MONGO_URL)
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => console.log(err));
