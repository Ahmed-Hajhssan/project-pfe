const mongoose = require('mongoose');

let Questions = new mongoose.Schema({ 
    Question: {type: String, required: true},
    Answer: {type: String, required: true}
})

module.exports = mongoose.model('Question', Questions)