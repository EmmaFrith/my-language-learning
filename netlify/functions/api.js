const serverless = require('serverless-http')
const express = require("express");

const Users = require("../../models/users.js");

const express = require('express');
const app = express();

const dotenv = require('dotenv');
dotenv.config();

const bcrypt = require('bcrypt');

const mongoose = require('mongoose');
mongoose.connect(process.env.MONGODB_URI);
mongoose.connection.on("connected", () => {
    console.log(`Connected to MongoDB ${mongoose.connection.name}.`);
});

const methodOverride = require('method-override');

const morgan = require('morgan');

const Words = require('../../models/words.js');

const Phrases = require('../../models/phrases.js');

const path = require('path')

const session = require('express-session')

app.use(express.json())

app.use(express.urlencoded({ extended: false }));

app.use(methodOverride("_method"))

app.use(morgan('dev'));

app.use(express.static("public"));

app.use(
    session({
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: true,
        cookie: { secure: false },
    })
);

app.get("/", async (req, res) => {
    if (req.session.user) {
        try {
            const findUserFromDatabase = await Users.findById(req.session.user._id)
            const words = await Words.find({ createdBy: findUserFromDatabase._id })
            const wordLength = words.length
            const phrases = await Phrases.find({ createdBy: findUserFromDatabase._id })
            const phrasesLength = phrases.length
            res.render("home.ejs", {
                wordLength, phrasesLength
            });
        } catch (error) {
            res.send('Something went wrong.')
        }
    } else {
        res.redirect('/sign-in-language-learning')
    }
});

app.get("/my-words", async (req, res) => {
    if (req.session.user) {
        try {
            const findUserFromDatabase = await Users.findById(req.session.user._id)
            const words = await Words.find({ createdBy: findUserFromDatabase._id })
            res.render("words/my-words.ejs", {
                words
            });
        } catch (error) {
            res.send('Something went wrong.')
        }
    } else {
        res.redirect('/sign-in-language-learning')
    }
});

app.get("/my-phrases", async (req, res) => {
    if (req.session.user) {
        try {
            const findUserFromDatabase = await Users.findById(req.session.user._id)
            const phrases = await Phrases.find({ createdBy: findUserFromDatabase._id })
            res.render("phrases/my-phrases.ejs", {
                phrases
            });
        } catch (error) {
            res.send('Something went wrong.')
        }
    } else {
        res.redirect('/sign-in-language-learning')
    }
});

app.get("/my-words/new-word", (req, res) => {
    res.render("words/new-word.ejs");
});

app.get("/my-phrases/new-phrase", (req, res) => {
    res.render("phrases/new-phrase.ejs");
});

app.post("/my-words", async (req, res) => {
    if (req.session.user) {
        try {
            req.body.createdBy = req.session.user._id
            await Words.create(req.body)
            res.redirect('/my-words')
        } catch (error) {
            res.send('Include a word and translation')
        }
    } else {
        res.redirect('/sign-in-language-learning')
    }
});

app.post("/my-phrases", async (req, res) => {
    if (req.session.user) {
        try {
            req.body.createdBy = req.session.user._id
            await Phrases.create(req.body)
            res.redirect('/my-phrases')
        } catch (error) {
            res.send('Include a phrase and translation')
        }
    } else {
        res.redirect('/sign-in-language-learning')
    }
})

app.get('/my-words/:wordId', async (req, res) => {
    if (req.session.user) {
        try {
            const singleWord = await Words.findById(req.params.wordId)
            res.render('words/single-word.ejs', {
                singleWord
            });
        } catch (error) {
            res.send('Something went wrong.')
        }
    } else {
        res.redirect('/sign-in-language-learning')
    }
})

app.get('/my-phrases/:phraseId', async (req, res) => {
    if (req.session.user) {
        try {
            const singlePhrase = await Phrases.findById(req.params.phraseId)
            res.render('phrases/single-phrase.ejs', {
                singlePhrase
            });
        } catch (error) {
            res.send('Something went wrong.')
        }
    } else {
        res.redirect('/sign-in-language-learning')
    }
})

app.delete('/my-words/:wordId', async (req, res) => {
    if (req.session.user) {
        try {
            await Words.findByIdAndDelete(req.params.wordId)
            res.redirect('/my-words')
        } catch (error) {
            res.send('Something went wrong.')
        }
    } else {
        res.redirect('/sign-in-language-learning')
    }
})

app.delete('/my-phrases/:phraseId', async (req, res) => {
    if (req.session.user) {
        try {
            await Phrases.findByIdAndDelete(req.params.phraseId)
            res.redirect('/my-phrases')
        } catch (error) {
            res.send('Something went wrong.')
        }
    } else {
        res.redirect('/sign-in-language-learning')
    }
})

app.put('/my-words/:wordId', async (req, res) => {
    if (req.session.user) {
        try {
            const updateWord = await Words.findByIdAndUpdate(req.params.wordId, req.body)
            res.redirect('/my-words')
        } catch (error) {
            res.send('Something went wrong.')
        }
    } else {
        res.redirect('/sign-in-language-learning')
    }
})

app.put('/my-phrases/:phraseId', async (req, res) => {
    if (req.session.user) {
        try {
            const updateWord = await Phrases.findByIdAndUpdate(req.params.phraseId, req.body)
            res.redirect('/my-phrases')
        } catch (error) {
            res.send('Something went wrong.')
        }
    } else {
        res.redirect('/sign-in-language-learning')
    }
})

app.get('/start-language-learning', (req, res) => {
    res.render('start-journey/start-page.ejs')
})

app.post('/start-language-learning', async (req, res) => {
    const userInDatabase = await Users.findOne({ username: req.body.username })
    if (userInDatabase) {
        return res.send('Username already taken.')
    }
    if (req.body.password !== req.body.confirmPassword) {
        return res.send("Passwords don't match")
    }
    if (req.body.password === '') {
        return res.send("Passwords don't match")
    }
    const hash = bcrypt.hashSync(req.body.password, 10);
    req.body.password = hash;
    const newUser = await Users.create(req.body)
    req.session.user = {
        username: newUser.username,
        _id: newUser._id
    };
    res.redirect('/')
})

app.get('/sign-in-language-learning', (req, res) => {
    res.render('start-journey/sign-in.ejs')
})

app.post('/sign-in-language-learning', async (req, res) => {
    const findUser = await Users.findOne({
        username: req.body.username,
    });
    if (!findUser) {
        return res.send('Sign in failed. Please try again.')
    }
    const passwordsMatch = await bcrypt.compare(req.body.password, findUser.password)
    req.session.user = {
        username: findUser.username,
        _id: findUser._id
    };
    if (passwordsMatch) {
        res.redirect("/");
    } else {
        return res.send(`Login Failed`);
    }
})

app.get("/sign-out", (req, res) => {
    req.session.destroy();
    res.redirect('/start-language-learning');
});

module.exports.handler = serverless(app)


