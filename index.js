const { ApolloServer } = require('apollo-server-express');
const jwt = require("jsonwebtoken");
const express = require("express");
const { createServer } = require("http");

require("dotenv/config");

const port = process.env.PORT || 4000;

const typeDefs = require('./schema/typeDefs');
const resolvers = require('./schema/resolvers');

const app = express();

const apolloServer = new ApolloServer(
  {
    context: async ({ req, connection }) => {
      if (connection) {
        return connection.context;
      }

      if (!req || !req.headers) {
        const error = "User not authenticated";
        error.code = 401;
        throw error;
      }

      const auth = (req.headers && req.headers.authorization) || '';
      let username = ""
      let token = ""

      const getToken = () => {
        return auth.split(" ")[1]
      }
      if (auth.length && auth.split(" ")[1]) {
        token = getToken()
      }
      if (token !== "") {
        username = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET).username;
      }
      return { username };
    },
    typeDefs,
    resolvers,
    formatError(err) {
      if (!err.originalError) {
        return err;
      }

      const { data } = err.originalError;
      const message = err.message || "An error occured. Try again.";
      const code = err.originalError.code || 500;
      return { message, code, data };
    }
  });
apolloServer.applyMiddleware({ app });

const httpServer = createServer(app);
apolloServer.installSubscriptionHandlers(httpServer);

httpServer.listen({ port }, () => {
  console.log(`🚀 Server ready at http://localhost:${port}${apolloServer.graphqlPath}`);
});