const mongoose = require('mongoose');

let Post = new mongoose.Schema({
  image: { type: String, required: false},
  name: { type: String, required: false},
  content: { type: String, required: false },
  file_path: [{ type: String, required: false }],
  likes: [{ type: String, required: false }],
  comments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }], 
  date: { type: Date, required: false , default: Date.now},
})

module.exports = mongoose.model('Post', Post)