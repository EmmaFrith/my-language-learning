const mongoose = require('mongoose');

const phrasesSchema = new mongoose.Schema({
    phrase: { type: String, required: true },
    translatedToEng: { type: String, required: true }
});


module.exports = mongoose.model('Phrases', phrasesSchema); 