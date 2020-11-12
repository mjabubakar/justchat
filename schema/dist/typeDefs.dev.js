"use strict";

function _templateObject() {
  var data = _taggedTemplateLiteral(["\n\n    ", "\n\n    ", "\n\n    ", "\n\n    type Query {\n        ", "\n\n        ", "\n\n        ", "\n    }\n    type Mutation {\n        ", "\n\n        ", "\n\n        ", "\n    },\n    type Subscription {\n        messageSent(id: ID!): Message\n        directMessageSent(id: ID!): Message\n        directMessages: Message\n    }\n"]);

  _templateObject = function _templateObject() {
    return data;
  };

  return data;
}

function _taggedTemplateLiteral(strings, raw) { if (!raw) { raw = strings.slice(0); } return Object.freeze(Object.defineProperties(strings, { raw: { value: Object.freeze(raw) } })); }

var _require = require("apollo-server-express"),
    gql = _require.gql;

var grouptypeDefs = require("./typeDefs/groupchat");

var usertypeDefs = require("./typeDefs/user");

var chatypeDefs = require("./typeDefs/privatechat");

var typeDefs = gql(_templateObject(), usertypeDefs.types, grouptypeDefs.types, chatypeDefs.types, grouptypeDefs.queries, usertypeDefs.queries, chatypeDefs.queries, usertypeDefs.mutations, grouptypeDefs.mutations, chatypeDefs.mutations);
module.exports = typeDefs;