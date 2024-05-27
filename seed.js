const mongoose = require('mongoose')
require('dotenv').config();

const phrases = require('./models/phrases.js')

async function seed() {
    mongoose.connect(process.env.MONGODB_URI)
    const phrasesData = await phrases.create({
        phrase: 'Les carottes sont cuites',
        translatedToEng: 'It is over for good'
    })
 }
 
 seed()