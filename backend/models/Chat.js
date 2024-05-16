const mongoose = require('mongoose');

let Chat = new mongoose.Schema({
    senderId: { type: String, required: false},
    receiverId: { type: String, required: false},
    message: { type: String, required: false},
    timestamp: { type: String, required: false},
    read: { type: Boolean, required:false, default:false }
})

module.exports = mongoose.model('Chat', Chat)