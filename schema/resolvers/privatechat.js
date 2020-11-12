const errorHandler = require("../../ErrorHandler");
const {
  User,
  Conversation,
  DirectMessage,
  Friend,
  Count,
} = require("../../models");
const functions = require("../../functions");

const { pubsub } = require("./pubsub");

const ALL_MESSAGES = "ALL_MESSAGES";

const PRIVATE_MESSAGE_SENT = "PRIVATE_MESSAGE_SENT";

exports.setCount = async function (_, { id }, context) {
  if (!context.username) {
    errorHandler.authenticationError();
  }

  const user = await User.findOne({
    where: { username: context.username },
  });

  if (!user) {
    errorHandler.notFound("User");
  }

  const conversation = await Conversation.findByPk(id);

  if (!conversation) {
    errorHandler.notFound("Conversation");
  }

  const friend = await Friend.findOne({
    where: {
      conversationId: conversation.id,
      userId: user.id,
    },
  });

  if (!friend) {
    errorHandler.notFound("Friend");
  }

  await Count.update(
    {
      count: 0,
    },
    { where: { friendId: friend.id } }
  );

  return "Updated";
};

exports.sendDirectMessage = async function (_, { id, message }, context) {
  if (!context.username) {
    errorHandler.authenticationError();
  }

  const user = await User.findOne({
    where: { username: context.username },
  });

  if (!user) {
    errorHandler.notFound("User");
  }

  const conversation = await Conversation.findOne({
    where: { id },
  });

  if (!conversation) {
    errorHandler.notFound("Conversation");
  }

  const me = await Friend.findOne({
    where: {
      conversationId: conversation.id,
      friendId: user.id,
    },
  });

  if (!me) {
    errorHandler.notFound("Friend");
  }

  const friend = await Friend.findOne({
    where: {
      conversationId: conversation.id,
      userId: conversation.chatId - user.id,
    },
  });

  const messageCount1 = await DirectMessage.findAndCountAll({
    where: { conversationId: id, userId: user.id },
    limit: 1,
    order: [["createdAt", "DESC"]],
  });

  const messageCount2 = await DirectMessage.findAndCountAll({
    where: { conversationId: id, userId: friend.userId },
    limit: 1,
    order: [["createdAt", "DESC"]],
  });
  const lastmessage1 = messageCount1.rows;

  const lastmessage2 = messageCount2.rows;

  const messages = [];
  const m1 = {
    message: "official",
    userId: user.id,
    conversationId: id,
    sentBy: user.id,
  };
  if (
    messageCount1.count === 0 ||
    functions.isToday(lastmessage1[0].createdAt)
  ) {
    messages.push(m1);
  }
  messages.push({
    message,
    userId: user.id,
    conversationId: id,
    sentBy: user.id,
  });

  if (friend) {
    const m2 = {
      message: "official",
      userId: friend.userId,
      conversationId: id,
      sentBy: user.id,
    };
    if (
      messageCount2.count === 0 ||
      functions.isToday(lastmessage2[0].createdAt)
    ) {
      messages.push(m2);
    }
    messages.push({
      message,
      userId: friend.userId,
      conversationId: id,
      sentBy: user.id,
    });
    const count = await Count.findOne({ where: { friendId: friend.id } });
    await Count.update(
      {
        count: count.count + 1,
      },
      { where: { friendId: friend.id } }
    );
  }

  await Friend.update(
    {
      lastmessage: message,
    },
    { where: { conversationId: id } }
  );

  const newMessage = await DirectMessage.bulkCreate(messages);

  const time = functions.convertToTime(newMessage[0].createdAt);

  const { username } = await User.findByPk(newMessage[0].sentBy);

  await pubsub.publish(PRIVATE_MESSAGE_SENT, {
    directMessageSent: {
      time,
      message,
      id,
      sentBy: username,
    },
  });
  const friendUsername = await User.findByPk(friend.userId);

  await pubsub.publish(ALL_MESSAGES, {
    directMessages: {
      time,
      message,
      to: friendUsername.username,
      sentBy: username,
    },
  });

  return { message, sentBy: username, time };
};
exports.friends = async function (_, __, context) {
  if (!context.username) {
    errorHandler.authenticationError();
  }

  const user = await User.findOne({ where: { username: context.username } });

  if (!user) {
    errorHandler.notFound("User");
  }

  const friends = await Friend.findAll({
    where: { userId: user.id },
    order: [["updatedAt", "DESC"]],
  });

  const allFriends = [];

  for (friend of friends) {
    const user = await User.findOne({
      where: { id: friend.friendId },
      attributes: ["updatedAt", "username", "profilepic", "online"],
    });
    const count = await Count.findOne({ where: { friendId: friend.id } });
    const data = user;
    data.online = user.online ? "Online" : functions.lastSeen(user.updatedAt);
    data.conversationId = friend.conversationId;
    data.lastmessage = friend.lastmessage;
    data.count = count.count;
    data.lastmsgTime = friend.lastmessage
      ? functions.lastmsgTime(friend.updatedAt)
      : "";
    allFriends.push(data);
  }

  return allFriends;
};

exports.startConversation = async function (_, { username }, context) {
  if (!context.username) {
    errorHandler.authenticationError();
  }

  const user = await User.findOne({ where: { username: context.username } });

  if (!user) {
    errorHandler.notFound("User");
  }

  const friend = await User.findOne({ where: { username } });

  if (username == context.username || !friend) {
    errorHandler.notFound("Friend");
  }

  const chatId = user.id + friend.id;

  const conversation = await Conversation.findOne({ where: { chatId } });

  if (conversation) {
    return conversation.id;
  }

  const newConversation = await Conversation.create({
    chatId,
  });

  const friends = [
    {
      friendId: friend.id,
      userId: user.id,
      conversationId: newConversation.id,
    },
    {
      friendId: user.id,
      userId: friend.id,
      conversationId: newConversation.id,
    },
  ];

  const newFriends = await Friend.bulkCreate(friends);

  await Count.bulkCreate([
    {
      count: 0,
      friendId: newFriends[0].id,
    },
    {
      count: 0,
      friendId: newFriends[1].id,
    },
  ]);

  return newConversation.id;
};

exports.deleteChat = async function (_, { id }, context) {
  if (!context.username) {
    errorHandler.authenticationError();
  }

  const user = await User.findOne({ where: { username: context.username } });

  if (!user) {
    errorHandler.notFound("User");
  }

  const conversation = await Conversation.findByPk(id);

  if (!conversation) {
    errorHandler.notFound("Conversation");
  }

  await Friend.update(
    {
      lastmessage: "",
    },
    {
      where: { userId: user.id, conversationId: id },
    }
  );

  await DirectMessage.destroy({
    where: {
      conversationId: id,
      userId: user.id,
    },
  });

  return "Deleted chat successfully";
};

exports.directMessages = async function (_, { id }, context) {
  if (!context.username) {
    errorHandler.authenticationError();
  }

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
      conversationId: id,
    },
    order: [["createdAt", "ASC"]],
  });

  if (!messages) {
    errorHandler.notFound("Messages");
  }

  const allMessages = [];

  for (i in messages) {
    const { createdAt, sentBy, message } = messages[i];
    const { username } = await User.findByPk(sentBy);
    const time = createdAt;
    allMessages.push({ message, sentBy: username, time });
  }

  return allMessages;
};
