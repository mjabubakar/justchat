"use strict";

var _require = require("apollo-server"),
    ApolloServer = _require.ApolloServer;

require("dotenv/config");

var port = process.env.PORT || 3000;

var context = require("./context");

var typeDefs = require("./schema/typeDefs");

var resolvers = require("./schema/resolvers");

var _require2 = require("./subscription"),
    onConnect = _require2.onConnect,
    onDisconnect = _require2.onDisconnect;

var apolloServer = new ApolloServer({
  cors: {
    credentials: true,
    origin: "*"
  },
  context: context,
  typeDefs: typeDefs,
  resolvers: resolvers,
  subscriptions: {
    onConnect: onConnect,
    onDisconnect: onDisconnect
  },
  formatError: function formatError(err) {
    if (!err.originalError) {
      return err;
    }

    var data = err.originalError.data;
    var message = err.message || "An error occured. Try again.";
    var code = err.originalError.code || 500;
    return {
      message: message,
      code: code,
      data: data
    };
  }
});
apolloServer.listen({
  port: port
}, function () {
  console.log("\uD83D\uDE80 Server ready at http://localhost:".concat(port).concat(apolloServer.graphqlPath));
});