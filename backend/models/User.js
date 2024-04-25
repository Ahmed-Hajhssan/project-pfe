const mongoose = require('mongoose');

let User = new mongoose.Schema({
  email: { type: String, required: false, unique : true },
  password: { type: String, required: false },
  role: { type: String, required: false },
})

module.exports = mongoose.model('User', User)