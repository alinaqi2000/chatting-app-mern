const mongoose = require('mongoose');

const circleSchema = new mongoose.Schema({
    ownerId: {
        type: mongoose.Schema.Types.ObjectId,  // Reference to User
        ref: 'User',
        required: true
    },
    memberIds: [{
        type: mongoose.Schema.Types.ObjectId,  // Array of references to User
        ref: 'User',
        required: true
    }],
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
    },
    icon: {
        type: String
    },
    latestMessage: {
        type: Map,  // Assuming this is a map containing message info
        required: true
    }
}, { timestamps: true });

const Circle = mongoose.model('Circle', circleSchema);
module.exports = Circle;