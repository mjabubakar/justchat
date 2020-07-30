const errorHandler = require("../../ErrorHandler");
const { User, Conversation, DirectMessage, Friend } = require("../../models");
const functions = require("../../functions");

exports.friends = async function (_, __, context) {

    if (!context.username) {
        errorHandler.authenticationError();
    };

    const user = await User.findOne({ where: { username: context.username } });

    if (!user) {
        errorHandler.notFound("User");
    }

    const friends = await Friend.findAll({
        where: { userId: user.id }
    });

    const allFriends = [];

    for (friend of friends) {
        const user = await User.findOne({
            where: { id: friend.friendId },
            attributes: ["fullname", "username", "profilepic"]
        });
        allFriends.push(user);
    }

    return allFriends;
}

exports.startConversation = async function (_, { username }, context) {

    if (!context.username) {
        errorHandler.authenticationError();
    };

    const user = await User.findOne({ where: { username: context.username } });

    if (!user) {
        errorHandler.notFound("User");
    }

    const friend = await User.findOne({ where: { username } });

    if (!friend) {
        errorHandler.notFound("Friend");
    }

    const chatId = user.id + friend.id;

    const conversation = await Conversation.findOne({ where: { chatId } });

    if (conversation) {
        const error = new Error("Conversation already exist");
        error.code = 409;
        throw error;
    }

    const newConversation = await Conversation.create({
        chatId
    });

    const friends = [{ friendId: friend.id, userId: user.id, conversationId: newConversation.id },
    { friendId: user.id, userId: friend.id, conversationId: newConversation.id }];

    await Friend.bulkCreate(friends);

    return "Conversation started successfully"

}

exports.deleteChat = async function (_, { id }, context) {

    if (!context.username) {
        errorHandler.authenticationError();
    };

    const user = await User.findOne({ where: { username: context.username } });

    if (!user) {
        errorHandler.notFound("User");
    }

    const conversation = await Conversation.findByPk(id);

    if (!conversation) {
        errorHandler.notFound("Conversation");
    }

    await DirectMessage.destroy({
        where: {
            conversationId: id,
            userId: user.id
        }
    });

    return "Deleted chat successfully";
}

exports.directMessages = async function (_, { id }, context) {

    if (!context.username) {
        errorHandler.authenticationError();
    };

    const user = await User.findOne({ where: { username: context.username } });

    if (!user) {
        errorHandler.notFound("User");
    }

    const conversation = await Conversation.findByPk(id);

    if (!conversation) {
        errorHandler.notFound("Conversation");
    }

    const messages = await DirectMessage.findAll({
        where: {
            userId: user.id,
            conversationId: id
        }
    });

    if (!messages) {
        errorHandler.notFound("Messages")
    }

    const allMessages = [];

    for (msg of messages) {
        const { type, createdAt, sentBy, message } = msg;
        const { username } = await User.findByPk(sentBy);
        const time = functions.convertToTime(createdAt);
        allMessages.push({ type, message, sentBy: username, time });
    }

    return allMessages;
}

