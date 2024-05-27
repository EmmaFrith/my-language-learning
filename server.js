


const express = require('express');
const app = express();

const dotenv = require('dotenv');
dotenv.config();


const mongoose = require('mongoose');
mongoose.connect(process.env.MONGODB_URI);
mongoose.connection.on("connected", () => {
    console.log(`Connected to MongoDB ${mongoose.connection.name}.`);
  });


const methodOverride = require('method-override');

const morgan = require('morgan');

const Word = require('./models/words.js');

const Phrase = require('./models/phrases.js');

app.use(express.json())

app.use(express.urlencoded({ extended: false }));

app.use(methodOverride("_method"))

app.use(morgan('dev'));


const port = process.env.PORT ? process.env.PORT : 3000;

app.listen(port, () => {
    console.log("Listening on port", process.env.PORT);
  });


  app.get("/", (req, res) => {
    res.render("home.ejs");
  });

  app.get("/my-words", (req, res) => {
    res.render("words/my-words.ejs");
  });

  app.get("/my-phrases", (req, res) => {
    res.render("phrases/my-phrases.ejs");
  });

  app.get("/my-words/new-word", (req, res) => {
    res.render("words/new-word.ejs");
  });

  app.get("/my-phrases/new-phrase", (req, res) => {
    res.render("phrases/new-phrase.ejs");
  });



