const mongoose = require('mongoose');

let Company = new mongoose.Schema({
  name: { type: String, required: false},
  amount: { type: String, required: false },
  type: { type: String, required: false },
  image: { type: String, required: false },
})

module.exports = mongoose.model('Company', Company)