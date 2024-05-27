


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

const Words = require('./models/words.js');

const Phrases = require('./models/phrases.js');


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

 app.get("/my-words", async (req, res) => {
    const words = await Words.find()
     res.render("words/my-words.ejs", {
        words
     });
 });

app.get("/my-phrases", async (req, res) => {
    const phrases = await Phrases.find()
    res.render("phrases/my-phrases.ejs", {
        phrases
    });
});

app.get("/my-words/new-word", (req, res) => {
    res.render("words/new-word.ejs");
});

app.get("/my-phrases/new-phrase", (req, res) => {
    res.render("phrases/new-phrase.ejs");
});

app.post("/my-words", async (req, res) => {
    console.log(req.body)
    await Words.create(req.body)
    res.redirect('/my-words')
})

app.post("/my-phrases", async (req, res) => {
    console.log(req.body)
    await Phrases.create(req.body)
    res.redirect('/my-phrases')
})

