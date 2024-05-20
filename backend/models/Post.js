const mongoose = require('mongoose');

let Post = new mongoose.Schema({
  image: { type: String, required: false},
  name: { type: String, required: false},
  content: { type: String, required: false },
  file_path: { type: String, required: false },
  likes: { type: String, required: false },
  Comments: [{ type: String, required: false }],
})

module.exports = mongoose.model('Post', Post)