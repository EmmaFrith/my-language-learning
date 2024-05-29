
const Users = require("./models/users.js");

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

const Words = require('./models/words.js');

const Phrases = require('./models/phrases.js');

const path = require('path')

const port = process.env.PORT ? process.env.PORT : 3000;

const session = require('express-session')

app.use(express.json())

app.use(express.urlencoded({ extended: false }));

app.use(methodOverride("_method"))

app.use(morgan('dev'));

app.use(express.static(path.join(__dirname, "public")));

app.use(
    session({
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: true,
        cookie: { secure: false },
    })
);


app.get("/", (req, res) => {
    res.render("home.ejs");
});

app.get("/my-words", async (req, res) => {
    const findUserFromDatabase = await Users.findById(req.session.user._id)
    const words = await Words.find({ createdBy: findUserFromDatabase._id })
    res.render("words/my-words.ejs", {
        words
    });
});

app.get("/my-phrases", async (req, res) => {
    const findUserFromDatabase = await Users.findById(req.session.user._id)
    const phrases = await Phrases.find({ createdBy: findUserFromDatabase._id })
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
    req.body.createdBy = req.session.user._id
    await Words.create(req.body)
    res.redirect('/my-words')
})

app.post("/my-phrases", async (req, res) => {
    req.body.createdBy = req.session.user._id
    await Phrases.create(req.body)
    res.redirect('/my-phrases')
})


app.get('/my-words/:wordId', async (req, res) => {

    console.log(req.params.wordId)

    const singleWord = await Words.findById(req.params.wordId)

    // res.send(singleWord) 

    res.render('words/single-word.ejs', {
        singleWord
    });
})

app.get('/my-phrases/:phraseId', async (req, res) => {

    const singlePhrase = await Phrases.findById(req.params.phraseId)

    res.render('phrases/single-phrase.ejs', {
        singlePhrase
    });
})


app.delete('/my-words/:wordId', async (req, res) => {
    await Words.findByIdAndDelete(req.params.wordId)
    res.redirect('/my-words')
})

app.delete('/my-phrases/:phraseId', async (req, res) => {
    await Phrases.findByIdAndDelete(req.params.phraseId)
    res.redirect('/my-phrases')
})


app.put('/my-words/:wordId', async (req, res) => {
    const updateWord = await Words.findByIdAndUpdate(req.params.wordId, req.body)
    res.redirect('/my-words')
})

app.put('/my-phrases/:phraseId', async (req, res) => {
    const updateWord = await Phrases.findByIdAndUpdate(req.params.phraseId, req.body)
    res.redirect('/my-phrases')
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
    console.log(req.body)

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


app.listen(port, () => {
    console.log("Listening on port", process.env.PORT);
});
