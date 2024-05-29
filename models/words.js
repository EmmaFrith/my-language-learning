const mongoose = require('mongoose');

const wordsSchema = new mongoose.Schema({
    word: { type: String, required: true },
    translatedToEng: { type: String, required: true },
    createdBy: { type: mongoose.Schema.ObjectId, ref: 'User'}
});


module.exports = mongoose.model('Words', wordsSchema); 