const mongoose = require('mongoose');

const phrasesSchema = new mongoose.Schema({
    phrase: { type: String, required: true },
    translatedToEng: { type: String, required: true },
    createdBy: { type: mongoose.Schema.ObjectId, ref: 'User'}
});


module.exports = mongoose.model('Phrases', phrasesSchema); 