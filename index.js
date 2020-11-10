const { ApolloServer } = require("apollo-server-express");
const express = require("express");
const app = express();
const cors = require("cors");
const http = require("http");
require("dotenv/config");

const port = process.env.PORT || 3000;
const context = require("./context");
const typeDefs = require("./schema/typeDefs");
const resolvers = require("./schema/resolvers");
const { onConnect, onDisconnect } = require("./subscription");

const corsOptions = {
  origin: "https://whatsappweb-7a129.web.app",
  optionsSuccessStatus: 200,
};

app.use((_, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, DELETE");
  res.setHeader("Access-Control-Allow-Headers", "*");
  next();
});

app.use(cors());

const server = new ApolloServer({
  context,
  typeDefs,
  resolvers,
  subscriptions: {
    onConnect,
    onDisconnect,
  },
  formatError(err) {
    if (!err.originalError) {
      return err;
    }

    const { data } = err.originalError;
    const message = err.message || "An error occured. Try again.";
    const code = err.originalError.code || 500;
    return { message, code, data };
  },
});

server.applyMiddleware({ app });

const httpServer = http.createServer(app);
server.installSubscriptionHandlers(httpServer);

httpServer.listen({ port }, () => {
  console.log(
    `🚀 Server ready at http://localhost:${port}${server.graphqlPath}`
  );
});
