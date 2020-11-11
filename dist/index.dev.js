"use strict";

var _require = require("apollo-server-express"),
    ApolloServer = _require.ApolloServer;

var express = require("express");

var cors = require("cors");

var http = require("http");

require("dotenv/config");

var port = process.env.PORT || 3000;

var context = require("./context");

var typeDefs = require("./schema/typeDefs");

var resolvers = require("./schema/resolvers");

var _require2 = require("./subscription"),
    onConnect = _require2.onConnect,
    onDisconnect = _require2.onDisconnect;

var server = new ApolloServer({
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
var app = express();

var allowCrossDomain = function allowCrossDomain(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE,OPTIONS");
  res.header("Access-Control-Allow-Credentials", true);
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization, Content-Length, X-Requested-With"); // intercept OPTIONS method

  if ("OPTIONS" == req.method) {
    res.send(200);
  } else {
    next();
  }
};

app.use(allowCrossDomain);
app.use(cors());
server.applyMiddleware({
  app: app
});
var httpServer = http.createServer(app);
server.installSubscriptionHandlers(httpServer);
httpServer.listen({
  port: port
}, function () {
  console.log("\uD83D\uDE80 Server ready at http://localhost:".concat(port).concat(server.graphqlPath));
});