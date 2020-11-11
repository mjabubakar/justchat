const { PubSub, withFilter } = require("apollo-server");
const pubsub = new PubSub();

module.exports = { withFilter, pubsub };
