
const express = require('express');
const User = require('../schemas/user.schema');
const authMiddleware = require('./middlewares/auth.middleware')
const userRouter = express.Router();

userRouter.post("/register", async (req, res) => {
 const {full_name,email,username,security,password}= req.body

    if (!full_name
        || !email
        || !username
        || !(security && security.question && security.answer)
        || !password) {
        return res.status(400).json({ error: "Please provide all the fields." })
    }

    const checkUser = await User.find({
        $or: [{ email }, { username }]
    });

    if (checkUser.length) {
        return res.status(400).json({ error: "This email or username is already taken!" });
    }

    const user = new User({ full_name, email, security, username, password });
    await user.save();

    const token = user.generateJWT('allAccess');

    res.json({
        user: {
            full_name: user.full_name,
            username: user.username,
            email: user.email
        },
        jwt: token
    })
});

userRouter.post("/login", async (req, res) => {
    const { identity, password } = req.body

    if (!identity || !password) {
        return res.status(400).json({ error: "Please provide all the fields." })
    }

    const user = await User.findOne({
        $or: [{ email: identity }, { username: identity }]
    });

    if (!user) {
        return res.status(400).json({ error: 'Invalid login credentials!' });
    }

    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
        return res.status(400).json({ error: 'Invalid login credentials!' });
    }

    const token = user.generateJWT('allAccess');

    res.json({
        user: {
            full_name: user.full_name,
            username: user.username,
            email: user.email
        },
        jwt: token
    })
});

userRouter.post("/get-security-question", async (req, res) => {
    const { identity } = req.body

    if (!identity) {
        return res.status(400).json({ error: "Please provide all the fields." })
    }

    const user = await User.findOne({
        $or: [{ email: identity }, { username: identity }]
    });

    if (!user) {
        return res.status(400).json({ error: 'No user found!' });
    }
    const token = user.generateJWT('passwordReset');

    res.json({
        securityQuestion: user.security.question,
        jwt: token
    })
});

userRouter.post("/verify-security-question", authMiddleware, async (req, res) => {
    const { answer } = req.body
    const { id } = req.user

    const user = await User.findById(id);

    if (!user) {
        return res.status(400).json({ error: 'No user found!' });
    }

    if (user.security.answer.toLowerCase() !== answer.toLowerCase()) {
        return res.status(400).json({ error: 'Ansser doesn\'t match' });
    }

    const token = user.generateJWT('allAccess');

    res.json({
        user: {
            full_name: user.full_name,
            username: user.username,
            email: user.email
        },
        jwt: token
    })

});

userRouter.get("/verify", authMiddleware, async (req, res) => {
    const { id } = req.user

    const user = await User.findById(id);
    const token = user.generateJWT();

    res.json({
        user: {
            full_name: user.full_name,
            username: user.username,
            email: user.email
        },
        jwt: token
    })
});

module.exports = userRouter;