const mongoose = require('mongoose');

let User = new mongoose.Schema({
  email: { type: String, required: false, unique : true },
  password: { type: String, required: false },
  role: { type: String, required: false },
  request_sent: [{ type: mongoose.Schema.Types.ObjectId, required: false }],
  request_received : [{ type: mongoose.Schema.Types.ObjectId, required: false }],
  matchmakings_list: [{ type: mongoose.Schema.Types.ObjectId, required: false }],
  active: { type: Boolean, required: false, default: true },
  posts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Post' }], 

})

module.exports = mongoose.model('User', User)