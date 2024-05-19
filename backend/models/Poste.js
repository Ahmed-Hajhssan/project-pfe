const mongoose = require('mongoose');

let Poste = new mongoose.Schema({
  title: { type: String, required: false},
  content: { type: String, required: false },
  file_path: { type: String, required: false },
  visibility: { type: String, required: false },
})

module.exports = mongoose.model('Poste', Poste)