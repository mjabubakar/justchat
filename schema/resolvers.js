const { userResolver, groupChatResolver, chatResolver } = require("../imports");
const { pubsub, withFilter } = require("./resolvers/pubsub");

const resolvers = {
  Query: {
    userDetails: userResolver.userDetails,
    allUsers: userResolver.allUsers,
    //chat
    directMessages: chatResolver.directMessages,
    friends: chatResolver.friends,
    groupInfo: groupChatResolver.groupInfo,
    groupMessages: groupChatResolver.groupMessages,
    myGroups: groupChatResolver.myGroups,
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
    sendMessage: groupChatResolver.sendMessage,
    //privatechat
    startConversation: chatResolver.startConversation,
    deleteChat: chatResolver.deleteChat,
    sendDirectMessage: chatResolver.sendDirectMessage,
    setCount: chatResolver.setCount,

  },
  Subscription: {
    messageSent: {
      subscribe: withFilter(
        () => pubsub.asyncIterator("MESSAGE_SENT"),
        (payload, variables) => {
          return payload.messageSent.id === variables.id;
        }
      ),
    },
    directMessageSent: {
      subscribe: withFilter(
        () => pubsub.asyncIterator("PRIVATE_MESSAGE_SENT"),
        (payload, variables) => {
          return payload.directMessageSent.id === variables.id;
        }
      ),
    },
    directMessages: {
      subscribe: withFilter(
        () => pubsub.asyncIterator("ALL_MESSAGES"),
        ({ directMessages }, _, context) => {
          return (
            directMessages.sentBy === context.username ||
            directMessages.to === context.username
          );
        }
      ),
    },
  },
};

module.exports = resolvers;
