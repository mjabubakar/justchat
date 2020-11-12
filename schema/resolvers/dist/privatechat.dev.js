"use strict";

var errorHandler = require("../../ErrorHandler");

var _require = require("../../models"),
    User = _require.User,
    Conversation = _require.Conversation,
    DirectMessage = _require.DirectMessage,
    Friend = _require.Friend,
    Count = _require.Count;

var functions = require("../../functions");

var _require2 = require("./pubsub"),
    pubsub = _require2.pubsub;

var ALL_MESSAGES = "ALL_MESSAGES";
var PRIVATE_MESSAGE_SENT = "PRIVATE_MESSAGE_SENT";

exports.setCount = function _callee(_, _ref, context) {
  var id, user, conversation, friend;
  return regeneratorRuntime.async(function _callee$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          id = _ref.id;

          if (!context.username) {
            errorHandler.authenticationError();
          }

          _context.next = 4;
          return regeneratorRuntime.awrap(User.findOne({
            where: {
              username: context.username
            }
          }));

        case 4:
          user = _context.sent;

          if (!user) {
            errorHandler.notFound("User");
          }

          _context.next = 8;
          return regeneratorRuntime.awrap(Conversation.findByPk(id));

        case 8:
          conversation = _context.sent;

          if (!conversation) {
            errorHandler.notFound("Conversation");
          }

          _context.next = 12;
          return regeneratorRuntime.awrap(Friend.findOne({
            where: {
              conversationId: conversation.id,
              userId: user.id
            }
          }));

        case 12:
          friend = _context.sent;

          if (!friend) {
            errorHandler.notFound("Friend");
          }

          _context.next = 16;
          return regeneratorRuntime.awrap(Count.update({
            count: 0
          }, {
            where: {
              friendId: friend.id
            }
          }));

        case 16:
          return _context.abrupt("return", "Updated");

        case 17:
        case "end":
          return _context.stop();
      }
    }
  });
};

exports.sendDirectMessage = function _callee2(_, _ref2, context) {
  var id, message, user, conversation, friend;
  return regeneratorRuntime.async(function _callee2$(_context2) {
    while (1) {
      switch (_context2.prev = _context2.next) {
        case 0:
          id = _ref2.id, message = _ref2.message;

          if (!context.username) {
            errorHandler.authenticationError();
          }

          _context2.next = 4;
          return regeneratorRuntime.awrap(User.findOne({
            where: {
              username: context.username
            }
          }));

        case 4:
          user = _context2.sent;

          if (!user) {
            errorHandler.notFound("User");
          }

          _context2.next = 8;
          return regeneratorRuntime.awrap(Conversation.findByPk(id));

        case 8:
          conversation = _context2.sent;

          if (!conversation) {
            errorHandler.notFound("Conversation");
          }

          _context2.next = 12;
          return regeneratorRuntime.awrap(Friend.findOne({
            where: {
              conversationId: conversation.id,
              userId: user.id
            }
          }));

        case 12:
          friend = _context2.sent;

          if (!friend) {
            errorHandler.notFound("Friend");
          }

          _context2.next = 16;
          return regeneratorRuntime.awrap(Count.update({
            count: 0
          }, {
            where: {
              friendId: friend.id
            }
          }));

        case 16:
          return _context2.abrupt("return", "Updated");

        case 17:
        case "end":
          return _context2.stop();
      }
    }
  });
};

exports.sendDirectMessage = function _callee3(_, _ref3, context) {
  var id, message, user, conversation, friend, messageCount1, messageCount2, lastmessage1, lastmessage2, messages, m1, m2, count, newMessage, time, _ref4, username, friendUsername;

  return regeneratorRuntime.async(function _callee3$(_context3) {
    while (1) {
      switch (_context3.prev = _context3.next) {
        case 0:
          id = _ref3.id, message = _ref3.message;

          if (!context.username) {
            errorHandler.authenticationError();
          }

          _context3.next = 4;
          return regeneratorRuntime.awrap(User.findOne({
            where: {
              username: context.username
            }
          }));

        case 4:
          user = _context3.sent;

          if (!user) {
            errorHandler.notFound("User");
          }

          _context3.next = 8;
          return regeneratorRuntime.awrap(Conversation.findOne({
            where: {
              id: id
            }
          }));

        case 8:
          conversation = _context3.sent;

          if (!conversation) {
            errorHandler.notFound("Conversation");
          }

          _context3.next = 12;
          return regeneratorRuntime.awrap(Friend.findOne({
            where: {
              conversationId: conversation.id,
              userId: conversation.chatId - user.id
            }
          }));

        case 12:
          friend = _context3.sent;
          _context3.next = 15;
          return regeneratorRuntime.awrap(DirectMessage.findAndCountAll({
            where: {
              conversationId: id,
              userId: user.id
            }
          }));

        case 15:
          messageCount1 = _context3.sent;
          _context3.next = 18;
          return regeneratorRuntime.awrap(DirectMessage.findAndCountAll({
            where: {
              conversationId: id,
              userId: friend.id
            }
          }));

        case 18:
          messageCount2 = _context3.sent;
          _context3.next = 21;
          return regeneratorRuntime.awrap(DirectMessage.findAll({
            where: {
              conversationId: id,
              userId: user.id
            },
            limit: 1,
            order: [["createdAt", "DESC"]]
          }));

        case 21:
          lastmessage1 = _context3.sent;
          _context3.next = 24;
          return regeneratorRuntime.awrap(DirectMessage.findAll({
            where: {
              conversationId: id,
              userId: friend.id
            },
            limit: 1,
            order: [["createdAt", "DESC"]]
          }));

        case 24:
          lastmessage2 = _context3.sent;
          messages = [];
          m1 = {
            message: "official",
            userId: user.id,
            conversationId: id,
            sentBy: user.id
          };

          if (messageCount1.count === 0 || functions.isToday(lastmessage1[0].createdAt)) {
            messages.push(m1);
          }

          messages.push({
            message: message,
            userId: user.id,
            conversationId: id,
            sentBy: user.id
          });
          m2 = {
            message: "official",
            userId: friend.userId,
            conversationId: id,
            sentBy: user.id
          };

          if (!friend) {
            _context3.next = 40;
            break;
          }

          if (messageCount2.count === 0 || functions.isToday(lastmessage2[0].createdAt)) {
            messages.push(m2);
          }

          messages.push({
            message: message,
            userId: friend.userId,
            conversationId: id,
            sentBy: user.id
          });
          _context3.next = 35;
          return regeneratorRuntime.awrap(Count.findOne({
            where: {
              friendId: friend.id
            }
          }));

        case 35:
          count = _context3.sent;
          _context3.next = 38;
          return regeneratorRuntime.awrap(Count.update({
            count: count.count + 1
          }, {
            where: {
              friendId: friend.id
            }
          }));

        case 38:
          _context3.next = 41;
          break;

        case 40:
          errorHandler.notFound("Friend");

        case 41:
          _context3.next = 43;
          return regeneratorRuntime.awrap(Friend.update({
            lastmessage: message
          }, {
            where: {
              conversationId: id
            }
          }));

        case 43:
          _context3.next = 45;
          return regeneratorRuntime.awrap(DirectMessage.bulkCreate(messages));

        case 45:
          newMessage = _context3.sent;
          time = functions.convertToTime(newMessage[0].createdAt);
          _context3.next = 49;
          return regeneratorRuntime.awrap(User.findByPk(newMessage[0].sentBy));

        case 49:
          _ref4 = _context3.sent;
          username = _ref4.username;
          _context3.next = 53;
          return regeneratorRuntime.awrap(pubsub.publish(PRIVATE_MESSAGE_SENT, {
            directMessageSent: {
              time: time,
              message: message,
              id: id,
              sentBy: username
            }
          }));

        case 53:
          _context3.next = 55;
          return regeneratorRuntime.awrap(User.findByPk(friend.userId));

        case 55:
          friendUsername = _context3.sent;
          _context3.next = 58;
          return regeneratorRuntime.awrap(pubsub.publish(ALL_MESSAGES, {
            directMessages: {
              time: time,
              message: message,
              to: friendUsername.username,
              sentBy: username
            }
          }));

        case 58:
          return _context3.abrupt("return", {
            message: message,
            sentBy: username,
            time: time
          });

        case 59:
        case "end":
          return _context3.stop();
      }
    }
  });
};

exports.friends = function _callee4(_, __, context) {
  var user, friends, allFriends, _iteratorNormalCompletion, _didIteratorError, _iteratorError, _iterator, _step, _user, count, data;

  return regeneratorRuntime.async(function _callee4$(_context4) {
    while (1) {
      switch (_context4.prev = _context4.next) {
        case 0:
          if (!context.username) {
            errorHandler.authenticationError();
          }

          _context4.next = 3;
          return regeneratorRuntime.awrap(User.findOne({
            where: {
              username: context.username
            }
          }));

        case 3:
          user = _context4.sent;

          if (!user) {
            errorHandler.notFound("User");
          }

          _context4.next = 7;
          return regeneratorRuntime.awrap(Friend.findAll({
            where: {
              userId: user.id
            },
            order: [["updatedAt", "DESC"]]
          }));

        case 7:
          friends = _context4.sent;
          allFriends = [];
          _iteratorNormalCompletion = true;
          _didIteratorError = false;
          _iteratorError = undefined;
          _context4.prev = 12;
          _iterator = friends[Symbol.iterator]();

        case 14:
          if (_iteratorNormalCompletion = (_step = _iterator.next()).done) {
            _context4.next = 32;
            break;
          }

          friend = _step.value;
          _context4.next = 18;
          return regeneratorRuntime.awrap(User.findOne({
            where: {
              id: friend.friendId
            },
            attributes: ["updatedAt", "username", "profilepic", "online"]
          }));

        case 18:
          _user = _context4.sent;
          _context4.next = 21;
          return regeneratorRuntime.awrap(Count.findOne({
            where: {
              friendId: friend.id
            }
          }));

        case 21:
          count = _context4.sent;
          data = _user;
          data.online = _user.online ? "Online" : functions.lastSeen(_user.updatedAt);
          data.conversationId = friend.conversationId;
          data.lastmessage = friend.lastmessage;
          data.count = count.count;
          data.lastmsgTime = friend.lastmessage ? functions.lastmsgTime(friend.updatedAt) : "";
          allFriends.push(data);

        case 29:
          _iteratorNormalCompletion = true;
          _context4.next = 14;
          break;

        case 32:
          _context4.next = 38;
          break;

        case 34:
          _context4.prev = 34;
          _context4.t0 = _context4["catch"](12);
          _didIteratorError = true;
          _iteratorError = _context4.t0;

        case 38:
          _context4.prev = 38;
          _context4.prev = 39;

          if (!_iteratorNormalCompletion && _iterator["return"] != null) {
            _iterator["return"]();
          }

        case 41:
          _context4.prev = 41;

          if (!_didIteratorError) {
            _context4.next = 44;
            break;
          }

          throw _iteratorError;

        case 44:
          return _context4.finish(41);

        case 45:
          return _context4.finish(38);

        case 46:
          return _context4.abrupt("return", allFriends);

        case 47:
        case "end":
          return _context4.stop();
      }
    }
  }, null, null, [[12, 34, 38, 46], [39,, 41, 45]]);
};

exports.startConversation = function _callee5(_, _ref5, context) {
  var username, user, friend, chatId, conversation, newConversation, friends, newFriends;
  return regeneratorRuntime.async(function _callee5$(_context5) {
    while (1) {
      switch (_context5.prev = _context5.next) {
        case 0:
          username = _ref5.username;

          if (!context.username) {
            errorHandler.authenticationError();
          }

          _context5.next = 4;
          return regeneratorRuntime.awrap(User.findOne({
            where: {
              username: context.username
            }
          }));

        case 4:
          user = _context5.sent;

          if (!user) {
            errorHandler.notFound("User");
          }

          _context5.next = 8;
          return regeneratorRuntime.awrap(User.findOne({
            where: {
              username: username
            }
          }));

        case 8:
          friend = _context5.sent;

          if (username == context.username || !friend) {
            errorHandler.notFound("Friend");
          }

          chatId = user.id + friend.id;
          _context5.next = 13;
          return regeneratorRuntime.awrap(Conversation.findOne({
            where: {
              chatId: chatId
            }
          }));

        case 13:
          conversation = _context5.sent;

          if (!conversation) {
            _context5.next = 16;
            break;
          }

          return _context5.abrupt("return", conversation.id);

        case 16:
          _context5.next = 18;
          return regeneratorRuntime.awrap(Conversation.create({
            chatId: chatId
          }));

        case 18:
          newConversation = _context5.sent;
          friends = [{
            friendId: friend.id,
            userId: user.id,
            conversationId: newConversation.id
          }, {
            friendId: user.id,
            userId: friend.id,
            conversationId: newConversation.id
          }];
          _context5.next = 22;
          return regeneratorRuntime.awrap(Friend.bulkCreate(friends));

        case 22:
          newFriends = _context5.sent;
          _context5.next = 25;
          return regeneratorRuntime.awrap(Count.bulkCreate([{
            count: 0,
            friendId: newFriends[0].id
          }, {
            count: 0,
            friendId: newFriends[1].id
          }]));

        case 25:
          return _context5.abrupt("return", newConversation.id);

        case 26:
        case "end":
          return _context5.stop();
      }
    }
  });
};

exports.deleteChat = function _callee6(_, _ref6, context) {
  var id, user, conversation;
  return regeneratorRuntime.async(function _callee6$(_context6) {
    while (1) {
      switch (_context6.prev = _context6.next) {
        case 0:
          id = _ref6.id;

          if (!context.username) {
            errorHandler.authenticationError();
          }

          _context6.next = 4;
          return regeneratorRuntime.awrap(User.findOne({
            where: {
              username: context.username
            }
          }));

        case 4:
          user = _context6.sent;

          if (!user) {
            errorHandler.notFound("User");
          }

          _context6.next = 8;
          return regeneratorRuntime.awrap(Conversation.findByPk(id));

        case 8:
          conversation = _context6.sent;

          if (!conversation) {
            errorHandler.notFound("Conversation");
          }

          _context6.next = 12;
          return regeneratorRuntime.awrap(Friend.update({
            lastmessage: ""
          }, {
            where: {
              userId: user.id,
              conversationId: id
            }
          }));

        case 12:
          _context6.next = 14;
          return regeneratorRuntime.awrap(DirectMessage.destroy({
            where: {
              conversationId: id,
              userId: user.id
            }
          }));

        case 14:
          return _context6.abrupt("return", "Deleted chat successfully");

        case 15:
        case "end":
          return _context6.stop();
      }
    }
  });
};

exports.directMessages = function _callee7(_, _ref7, context) {
  var id, user, conversation, messages, allMessages, _messages$i, createdAt, sentBy, message, _ref8, username, time;

  return regeneratorRuntime.async(function _callee7$(_context7) {
    while (1) {
      switch (_context7.prev = _context7.next) {
        case 0:
          id = _ref7.id;

          if (!context.username) {
            errorHandler.authenticationError();
          }

          _context7.next = 4;
          return regeneratorRuntime.awrap(User.findOne({
            where: {
              username: context.username
            }
          }));

        case 4:
          user = _context7.sent;

          if (!user) {
            errorHandler.notFound("User");
          }

          _context7.next = 8;
          return regeneratorRuntime.awrap(Conversation.findByPk(id));

        case 8:
          conversation = _context7.sent;

          if (!conversation) {
            errorHandler.notFound("Conversation");
          }

          _context7.next = 12;
          return regeneratorRuntime.awrap(DirectMessage.findAll({
            where: {
              userId: user.id,
              conversationId: id
            },
            order: [["createdAt", "ASC"]]
          }));

        case 12:
          messages = _context7.sent;

          if (!messages) {
            errorHandler.notFound("Messages");
          }

          allMessages = [];
          _context7.t0 = regeneratorRuntime.keys(messages);

        case 16:
          if ((_context7.t1 = _context7.t0()).done) {
            _context7.next = 27;
            break;
          }

          i = _context7.t1.value;
          _messages$i = messages[i], createdAt = _messages$i.createdAt, sentBy = _messages$i.sentBy, message = _messages$i.message;
          _context7.next = 21;
          return regeneratorRuntime.awrap(User.findByPk(sentBy));

        case 21:
          _ref8 = _context7.sent;
          username = _ref8.username;
          time = createdAt;
          allMessages.push({
            message: message,
            sentBy: username,
            time: time
          });
          _context7.next = 16;
          break;

        case 27:
          return _context7.abrupt("return", allMessages);

        case 28:
        case "end":
          return _context7.stop();
      }
    }
  });
};