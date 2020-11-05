const { ApolloServer } = require("apollo-server");

require("dotenv/config");

const port = process.env.PORT || 3000;
const context = require("./context");
const typeDefs = require("./schema/typeDefs");
const resolvers = require("./schema/resolvers");
const { onConnect, onDisconnect } = require("./subscription");
const apolloServer = new ApolloServer({
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

apolloServer.listen({ port }, () => {
  console.log(
    `🚀 Server ready at http://localhost:${port}${apolloServer.graphqlPath}`
  );
});
