const functions = require("./functions");
const errorHandler = require("./ErrorHandler");
const { PubSub, withFilter } = require('apollo-server');
const pubsub = new PubSub();
const userResolver = require("./schema/resolvers/user");
const groupChatResolver = require("./schema/resolvers/groupchat");
const chatResolver = require("./schema/resolvers/privatechat");

const imports = {
    functions,
    errorHandler,
    pubsub,
    withFilter,
    userResolver,
    groupChatResolver,
    chatResolver
}

module.exports = imports;