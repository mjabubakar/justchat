const { PubSub, withFilter } = require("apollo-server-express");
const pubsub = new PubSub();

module.exports = { withFilter, pubsub };
