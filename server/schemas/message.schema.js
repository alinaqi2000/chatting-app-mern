const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,  // Reference to User
        ref: 'User',
        required: true
    },
    friendId: {
        type: mongoose.Schema.Types.ObjectId,  // Reference to Friend (or User)
        ref: 'User',
        required: true
    },
    type: {
        type: String,  // Define allowed values
        enum: ["sent", "received"],
        required: true
    },
    text: {
        type: String,
        required: true
    }
}, { timestamps: true });

const Message = mongoose.model('Message', messageSchema);
module.exports = Message;