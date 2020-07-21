const mongoose = require('mongoose');

// Create Schema
const ProfileSchema = new mongoose.Schema({
    _id:{type:String, required: true},
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    profilePicture:{type: "string", default:""},
    friendsList:{type: Array, default:[]},
    chatrooms:{type: Array, default:[]},
    friendRequestList: {type: Array, default:[]},
    photoGallery: {type: Array, default:[]},
    date: {type: Date, default: Date.now}
});

module.exports = Profile = mongoose.model('profiles', ProfileSchema);