const mongoose = require('mongoose');

//Create Schema
const ChatRoomSchema = new mongoose.Schema({
    // roomTitle: { type: String, required: true },
    userIds: { type: String, required: true },
    messages: { type: String, required: true, unique: true },
    date: {type: Date, default: Date.now}
});

module.exports = ChatRoom = mongoose.model('users', ChatRoomSchema);