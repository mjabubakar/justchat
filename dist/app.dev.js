"use strict";

var app = require("express")();

var _require = require("./models"),
    User = _require.User,
    Conversation = _require.Conversation,
    DirectMessage = _require.DirectMessage,
    Friend = _require.Friend,
    Count = _require.Count;

var functions = require("./functions");

var errorHandler = require("./ErrorHandler");

app.post("/:id/:message", function _callee(req, res) {
  var _req$params, id, message, context, user, conversation, me, friend, messageCount1, lastmessage1, messages, m1, messageCount2, lastmessage2, count, newMessage, time, _ref, username;

  return regeneratorRuntime.async(function _callee$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          _req$params = req.params, id = _req$params.id, message = _req$params.message;
          context = {
            username: "jamil"
          };
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
          return regeneratorRuntime.awrap(Conversation.findOne({
            where: {
              id: id
            }
          }));

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
          me = _context.sent;

          if (!me) {
            errorHandler.notFound("Friend");
          }

          _context.next = 16;
          return regeneratorRuntime.awrap(Friend.findOne({
            where: {
              conversationId: conversation.id,
              userId: conversation.chatId - user.id
            }
          }));

        case 16:
          friend = _context.sent;
          _context.next = 19;
          return regeneratorRuntime.awrap(DirectMessage.findAndCountAll({
            where: {
              conversationId: id,
              userId: user.id
            }
          }));

        case 19:
          messageCount1 = _context.sent;
          lastmessage1 = messageCount1.rows;
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

          if (!friend) {
            _context.next = 37;
            break;
          }

          _context.next = 28;
          return regeneratorRuntime.awrap(DirectMessage.findAndCountAll({
            where: {
              conversationId: id,
              userId: friend.userId
            }
          }));

        case 28:
          messageCount2 = _context.sent;
          lastmessage2 = messageCount2.rows;

          if (messageCount2.count === 0 || functions.isToday(lastmessage2[0].createdAt)) {
            messages.push({
              message: "official",
              userId: friend.userId,
              conversationId: id,
              sentBy: user.id
            });
          }

          messages.push({
            message: message,
            userId: friend.userId,
            conversationId: id,
            sentBy: user.id
          });
          _context.next = 34;
          return regeneratorRuntime.awrap(Count.findOne({
            where: {
              friendId: friend.id
            }
          }));

        case 34:
          count = _context.sent;
          _context.next = 37;
          return regeneratorRuntime.awrap(Count.update({
            count: count.count + 1
          }, {
            where: {
              friendId: friend.id
            }
          }));

        case 37:
          _context.next = 39;
          return regeneratorRuntime.awrap(Friend.update({
            lastmessage: message
          }, {
            where: {
              conversationId: id
            }
          }));

        case 39:
          _context.next = 41;
          return regeneratorRuntime.awrap(DirectMessage.bulkCreate(messages));

        case 41:
          newMessage = _context.sent;
          time = functions.convertToTime(newMessage[0].createdAt);
          _context.next = 45;
          return regeneratorRuntime.awrap(User.findByPk(newMessage[0].sentBy));

        case 45:
          _ref = _context.sent;
          username = _ref.username;
          res.send({
            message: message,
            sentBy: username,
            time: time
          });

        case 48:
        case "end":
          return _context.stop();
      }
    }
  });
});
app.listen(5000);