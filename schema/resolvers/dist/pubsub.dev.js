"use strict";

var _require = require("apollo-server-express"),
    PubSub = _require.PubSub,
    withFilter = _require.withFilter;

var pubsub = new PubSub();
module.exports = {
  withFilter: withFilter,
  pubsub: pubsub
};