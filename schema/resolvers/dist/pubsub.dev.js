"use strict";

var _require = require("apollo-server"),
    PubSub = _require.PubSub,
    withFilter = _require.withFilter;

var pubsub = new PubSub();
module.exports = {
  withFilter: withFilter,
  pubsub: pubsub
};