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
    full_name: {
        type: String,
        required: true
    },
    security: {
        type: {
            question: String,
            answer: String,
        },
        required: true
    },
    password: {
        type: String,
        required: true
    }
});

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

userSchema.methods.comparePassword = async function (password) {
    return bcrypt.compare(password, this.password);
};

userSchema.methods.generateJWT = function (role) {
    const token = jwt.sign(
        { id: this._id, username: this.username, full_name: this.full_name, email: this.email, role },
        process.env.JWT_SECRET_KEY,
        { expiresIn: '2h' }
    );
    return token;
};

const User = mongoose.model('User', userSchema);
module.exports = User;