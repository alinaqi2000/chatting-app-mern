const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    fullName: {
        type: String,
        required: true
    },
    security: {
        question: {
            type: String,
            required: true
        },
        answer: {
            type: String,
            required: true
        }
    },
    password: {
        type: String,
        required: true
    },
    chatIds: [{
        type: mongoose.Schema.Types.ObjectId,  // Array of references to Chat
        ref: 'Chat'
    }],
    avatar: {
        type: String
    }
}, { timestamps: true });

// Hash password before saving
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();

    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (err) {
        next(err);
    }
});

// Compare password method
userSchema.methods.comparePassword = async function (password) {
    return bcrypt.compare(password, this.password);
};

// Generate JWT method
userSchema.methods.generateJWT = function (role) {
    const token = jwt.sign(
        { id: this._id, username: this.username, fullName: this.fullName, email: this.email, role },
        process.env.JWT_SECRET_KEY,
        { expiresIn: '2h' }
    );
    return token;
};

const User = mongoose.model('User', userSchema);
module.exports = User;