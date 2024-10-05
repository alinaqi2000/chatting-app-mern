const mongoose = require('mongoose');

const friendSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,  // Reference to User
        ref: 'User',
        required: true
    },
    friendId: {
        type: mongoose.Schema.Types.ObjectId,  // Reference to another User
        ref: 'User',
        required: true
    },
    status: {
        type: String,  // Define allowed values
        enum: ["friend", "block", "friendRequest", "cancelFriendRequest"],
        required: true
    }
}, { timestamps: true });

const Friend = mongoose.model('Friend', friendSchema);
module.exports = Friend;