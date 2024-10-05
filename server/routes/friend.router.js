
const express = require('express');
const authMiddleware = require('./middlewares/auth.middleware');
const { searchUsers, sendRequest, acceptRequest, cancelRequest, getAllFriendships, blockUser } = require('../services/friend.service');
const Friend = require('../schemas/friend.schema');
const friendRouter = express.Router();

friendRouter.get("/search", authMiddleware, async (req, res) => {
    const { id } = req.user
    const { s } = req.query

    const items = await searchUsers(s, id);

    res.json({ items })
});

friendRouter.get("/request", authMiddleware, async (req, res) => {
    const { id } = req.user

    const items = await getAllFriendships(id);

    res.json({ ...items })
});

friendRouter.post("/request", authMiddleware, async (req, res) => {
    const { id } = req.user
    const { userId } = req.body

    if (id === userId) {
        return res.status(400).json({ error: "You can't request yourself" })
    }

    const request = await Friend.findOne({ userId: id, friendId: userId });
    if (request) {
        return res.status(400).json({ error: "Request already sent" })
    }

    const friendRequest = await Friend.findOne({ userId, friendId: id });
    if (friendRequest.status === "block") {
        return res.status(400).json({ error: "You are blocked by the user" })
    }

    const item = await sendRequest(id, userId);

    res.json({ item })
});

friendRouter.post("/request/accept", authMiddleware, async (req, res) => {
    const { id } = req.user
    const { requestId } = req.body

    const request = await Friend.findById(requestId);
    if (request.friendId.toString() !== id) {
        return res.status(400).json({ error: "You can't accept this request" })
    }

    const item = await acceptRequest(request);

    res.json({ item })
});

friendRouter.post("/request/cancel", authMiddleware, async (req, res) => {
    const { id } = req.user
    const { requestId } = req.body

    const request = await Friend.findById(requestId);
    if (!(request.userId.toString() === id || request.friendId.toString() === id)) {
        return res.status(400).json({ error: "You can't cancel this request" })
    }

    const item = await cancelRequest(request, id);

    res.json({ item })
});

friendRouter.post("/block", authMiddleware, async (req, res) => {
    const { id } = req.user
    const { userId } = req.body

    if (id === userId) {
        return res.status(400).json({ error: "You can't block yourself" })
    }

    const item = await blockUser(id, userId);

    res.json({ item })
});

module.exports = friendRouter;