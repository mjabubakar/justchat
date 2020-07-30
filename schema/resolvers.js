
const { pubsub, withFilter, functions, userResolver, groupChatResolver, errorHandler, chatResolver } = require("../imports");
const { User, Group, GroupMember, GroupMessage, DirectMessage, Conversation } = require("../models");

const MESSAGE_SENT = 'MESSAGE_SENT';

const PRIVATE_MESSAGE_SENT = 'PRIVATE_MESSAGE_SENT';

const resolvers = {
    Query: {
        userDetails: userResolver.userDetails,
        allUsers: userResolver.allUsers,
        //chat
        directMessages: chatResolver.directMessages,
        friends: chatResolver.friends,
        // groups: groupChatResolver.groups,
        groupInfo: groupChatResolver.groupInfo,
        groupMessages: groupChatResolver.groupMessages,
        myGroups: groupChatResolver.myGroups

    },
    Mutation: {
        //user
        login: userResolver.login,
        createUser: userResolver.createUser,
        deleteUser: userResolver.deleteUser,
        updateUser: userResolver.updateUser,
        changePassword: userResolver.changePassword,
        sendForgotPassMail: userResolver.sendForgotPassMail,
        forgotPassword: userResolver.forgotPassword,
        updateEmail: userResolver.updateEmail,
        verifyEmail: userResolver.verifyEmail,
        sendVerification: userResolver.sendVerification,
        changeProfilePic: userResolver.changeProfilePic,

        //groupchat
        createGroup: groupChatResolver.createGroup,
        updateType: groupChatResolver.updateType,
        removeMember: groupChatResolver.removeMember,
        leaveGroup: groupChatResolver.leaveGroup,
        addMember: groupChatResolver.addMember,
        changeGProfilePic: groupChatResolver.changeGProfilePic,
        //privatechat
        startConversation: chatResolver.startConversation,
        deleteChat: chatResolver.deleteChat,
        async sendMessage(_, { id, message }, context) {

            if (!context.username) {
                errorHandler.authenticationError();
            };

            const user = await User.findOne({ where: { username: context.username } });

            if (!user) {
                errorHandler.notFound("User");
            }

            const group = await Group.findByPk(id);

            if (!group) {
                errorHandler.notFound("Group");
            }

            const member = GroupMember.findOne({ where: { groupId: id, memberId: user.id } });

            if (!member) {
                errorHandler.notAuthorized();
            }

            const newMessage = await GroupMessage.create({
                message,
                type: false,
                userId: user.id,
                groupId: id,
            });

            await Group.update({
                lastmessage: message,
            },
                { where: { id } }
            );

            const time = functions.convertToTime(newMessage.createdAt);

            await pubsub.publish(MESSAGE_SENT, { messageSent: { time, message, id, type: false, sentBy: user.username } });

            const { type, userId } = newMessage;

            return { message: newMessage.message, type, sentBy: user.username, time };
        },
        sendDirectMessage: async function (_, { id, message }, context) {

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

            const friend = await User.findByPk(conversation.chatId - user.id);

            const messages = [{
                message,
                type: false,
                userId: user.id,
                conversationId: id,
                sentBy: user.id
            }];

            if (friend) {
                messages.push({ message, type: false, userId: friend.id, conversationId: id, sentBy: user.id });
            }

            const newMessage = await DirectMessage.bulkCreate(messages);

            const time = functions.convertToTime(newMessage[0].createdAt);

            const { username } = await User.findByPk(newMessage[0].sentBy);

            await pubsub.publish(PRIVATE_MESSAGE_SENT, { directMessageSent: { time, message, id, type: false, sentBy: username } });

            const { type } = newMessage[0];

            return { message, type, sentBy: username, time };

        }
    },
    Subscription: {
        messageSent: {
            subscribe: withFilter(
                () => pubsub.asyncIterator('MESSAGE_SENT'),
                (payload, variables) => {
                    return payload.messageSent.id === variables.id;
                },
            ),
        },
        directMessageSent: {
            subscribe: withFilter(
                () => pubsub.asyncIterator('PRIVATE_MESSAGE_SENT'),
                (payload, variables) => {
                    return payload.directMessageSent.id === variables.id;
                },
            ),
        }
    }
}

module.exports = resolvers;