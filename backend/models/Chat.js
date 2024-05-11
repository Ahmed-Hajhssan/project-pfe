const mongoose = require('mongoose');

let Chat = new mongoose.Schema({
    senderId: String,
    receiverId: String,
    message: String,
    timestamp: { type: Date, default: Date.now },
})

module.exports = mongoose.model('Chat', Chat)