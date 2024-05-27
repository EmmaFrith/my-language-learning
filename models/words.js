const mongoose = require('mongoose');

const wordsSchema = new mongoose.Schema({
    word: { type: String, required: true },
    translatedToEng: { type: String, required: true }
});


module.exports = mongoose.model('Words', wordsSchema); 