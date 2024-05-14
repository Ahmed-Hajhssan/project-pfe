const mongoose = require('mongoose');

let Chat = new mongoose.Schema({
    senderId: String,
    receiverId: String,
    message: String,
    timestamp: Date,
})

module.exports = mongoose.model('Chat', Chat)