"use strict";

var _require = require("apollo-server-express"),
    AuthenticationError = _require.AuthenticationError;

var jwt = require("jsonwebtoken");

module.exports = function _callee(_ref) {
  var req, connection, auth, username, token, getToken;
  return regeneratorRuntime.async(function _callee$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          req = _ref.req, connection = _ref.connection;

          if (!connection) {
            _context.next = 3;
            break;
          }

          return _context.abrupt("return", connection.context);

        case 3:
          if (!(!req || !req.headers)) {
            _context.next = 5;
            break;
          }

          throw new AuthenticationError("Not authenticated");

        case 5:
          auth = req.headers && req.headers.authorization || "";
          username = "";
          token = "";

          getToken = function getToken() {
            return auth.split(" ")[1];
          };

          if (auth.length && auth.split(" ")[1]) {
            token = getToken();
          }

          if (token !== "") {
            username = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET).username;
          }

          return _context.abrupt("return", {
            username: username
          });

        case 12:
        case "end":
          return _context.stop();
      }
    }
  });
};