const mongoose = require('mongoose');

let Comment = new mongoose.Schema({
  image: { type: String, required: false},
  name: { type: String, required: false},
  content: { type: String, required: false },
  date: { type: String, required: false },
})

module.exports = mongoose.model('Comment', Comment)