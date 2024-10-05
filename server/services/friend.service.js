const Friend = require("../schemas/friend.schema");
const User = require("../schemas/user.schema");
const { mapDate } = require("./date.service");

const searchUsers = async (search, currentUserId) => {
    try {
        const users = await User.find({
            $or: [
                { fullName: new RegExp(search, 'i') },
                { username: new RegExp(search, 'i') },
                { email: new RegExp(search, 'i') }
            ],
            _id: {
                $ne: currentUserId,
                $nin: await Friend.find({ friendId: currentUserId, status: 'block' }).distinct('friendId')
            }
        });

        return searchResponseMapper(users, currentUserId);
    } catch (err) {
        console.error('Error fetching users:', err.message);
        return searchResponseMapper([], currentUserId);
    }
};

const singleRequestResponse = async (request, friendId) => {
    const friend = await User.findById(friendId);

    return {
        id: request._id,
        user: {
            id: friend._id,
            fullName: friend.fullName,
            username: friend.username,
            avatar: friend.avatar || null,
        },
        friendshipStatus: request ? request.status : null,
        date: mapDate(request.createdAt, request.updatedAt)
    };
};

const sendRequest = async (userId, friendId) => {
    try {
        const request = new Friend({ userId, friendId, status: "friendRequest" })
        request.save();

        return singleRequestResponse(request, request.friendId);
    } catch (err) {
        console.error('Error send friend request:', err.message);
        return null;
    }
};

const blockUser = async (userId, friendId) => {
    try {
        const friendRequest = await Friend.findOne({ userId, friendId })
        if (friendRequest) {
            friendRequest.set({ status: "block" });
            friendRequest.save();
            return singleRequestResponse(friendRequest, friendRequest.friendId);
        }

        const request = new Friend({ userId, friendId, status: "block" })
        request.save();

        return singleRequestResponse(request, request.friendId);
    } catch (err) {
        console.error('Error blocking user:', err.message);
        return null;
    }
};

const acceptRequest = async (request) => {
    try {
        request.set({ status: "friend" });
        request.save();

        const friendRequest = new Friend({ userId: request.friendId, friendId: request.userId, status: "friend" })
        friendRequest.save();

        return singleRequestResponse(request, request.userId);
    } catch (err) {
        console.error('Error accepting friend request:', err.message);
        return null;
    }
};

const cancelRequest = async (request, id) => {
    try {

        if (request.userId.toString() === id) {
            await Friend.findByIdAndDelete(request._id)
            return null;
        }

        request.set({ status: "cancelFriendRequest" });
        request.save();

        return singleRequestResponse(request, request.userId);
    } catch (err) {
        console.error('Error cancelling friend request:', err.message);
        return null;
    }
};

const filterFriendshipsByStatus = async (friendships, status, userKey) => {
    const result = [];
    const items = friendships.filter(f => f.status === status);
    for (const f of items) {
        result.push(await singleRequestResponse(f, f[userKey]));
    }
    return result;
}

const getAllFriendships = async (userId) => {
    try {
        const myFriendships = await Friend.find({ userId });
        const friends = await filterFriendshipsByStatus(myFriendships, "friend", "friendId");
        const blocked = await filterFriendshipsByStatus(myFriendships, "block", "friendId");
        const cancelRequests = await filterFriendshipsByStatus(myFriendships, "cancelFriendRequest", "friendId");
        const sentRequests = await filterFriendshipsByStatus(myFriendships, "friendRequest", "friendId");

        const otherFriendships = await Friend.find({ friendId: userId });
        const requests = await filterFriendshipsByStatus(otherFriendships, "friendRequest", "userId");

        return { friends, blocked, requests, sentRequests, cancelRequests }
    } catch (err) {
        console.error('Error cancelling friend request:', err.message);
        return {};
    }
};

const searchResponseMapper = async (users, currentUserId) => {
    try {
        const searchUsers = await Promise.all(users.map(async (user) => {
            const friendship = await Friend.findOne({ userId: currentUserId, friendId: user._id });
            return singleRequestResponse(friendship, user._id);
        }));

        return searchUsers;
    } catch (err) {
        console.error('Error creating search users response:', err.message);
        return [];
    }
};



module.exports = { searchUsers, sendRequest, blockUser, acceptRequest, cancelRequest, getAllFriendships }