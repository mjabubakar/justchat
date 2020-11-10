const { AuthenticationError } = require("apollo-server-express");
const jwt = require("jsonwebtoken");
const { User } = require("./models");

module.exports = async ({ req, connection }) => {
  if (connection) return connection.context;

  if (!req || !req.headers) {
    throw new AuthenticationError("Not authenticated");
  }
  let auth = (req.headers && req.headers.authorization) || "";

  let username = "";
  let token = "";

  const getToken = () => {
    return auth.split(" ")[1];
  };
  if (auth.length && auth.split(" ")[1]) {
    token = getToken();
  }
  if (token !== "") {
    username = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET).username;
  }

  return { username };
};
