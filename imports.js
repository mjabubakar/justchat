const functions = require("./functions");
const errorHandler = require("./ErrorHandler");
const userResolver = require("./schema/resolvers/user");
const groupChatResolver = require("./schema/resolvers/groupchat");
const chatResolver = require("./schema/resolvers/privatechat");
const imports = {
  functions,
  errorHandler,
  userResolver,
  groupChatResolver,
  chatResolver,
};

module.exports = imports;
