const mongoose = require('mongoose');

let Member = new mongoose.Schema({
  image_member: { type: String, required: false },
  name: { type: String, required: false },
  job: { type: String, required: false },
  bio: { type: String, required: false },
  linkedin_url: {type: String, required: false},
  facebook_url: {type: String, required: false},
  twitter_url: {type: String, required: false},
  entrepreneur: { type: mongoose.Schema.Types.ObjectId, ref: 'Entrepreneur' }
})

module.exports = mongoose.model('Member', Member)