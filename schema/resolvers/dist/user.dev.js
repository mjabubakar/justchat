"use strict";

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var _require = require("../../models"),
    User = _require.User;

var validator = require("validator");

var bcrypt = require("bcryptjs");

var functions = require("../../functions");

var data = require("../../data");

var jwt = require("jsonwebtoken");

var errorHandler = require("../../ErrorHandler");

var Op = require("sequelize").Op;

var _require2 = require("../../gcloud"),
    bcLink = _require2.bcLink,
    bucket = _require2.bucket;

var name = new Date().getTime().toString();

exports.createUser = function _callee(_, _ref) {
  var userInput, email, password, username, fullname, profilepic, bio, errors, error, _error, userExist, usernameExist, _error2, hashedPass, _ref2, createReadStream, _error3, user, createdUser, confirmationToken;

  return regeneratorRuntime.async(function _callee$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          userInput = _ref.userInput;
          email = userInput.email, password = userInput.password, username = userInput.username, fullname = userInput.fullname, profilepic = userInput.profilepic, bio = userInput.bio;
          errors = [];

          if (validator.isEmail(email)) {
            _context.next = 7;
            break;
          }

          error = new Error("Invalid email address");
          error.code = 422;
          throw error;

        case 7:
          if (!functions.isAlpha(fullname)) {
            errors.push({
              message: "Fullname must be alphabet"
            });
          }

          if (!validator.isLength(fullname, {
            max: 25,
            min: 5
          })) {
            errors.push({
              message: "Name too short or too long"
            });
          }

          if (!validator.isLength(username, {
            max: 15,
            min: 4
          })) {
            errors.push({
              message: "Username should be more than 3 characters and less than 16 characters"
            });
          }

          if (validator.isEmpty(password) || !validator.isLength(password, {
            min: 8
          })) {
            errors.push({
              message: "Password too short"
            });
          }

          if (validator.isEmpty(email) || validator.isEmpty(username) || validator.isEmpty(fullname)) {
            errors.push({
              message: "All fields are required"
            });
          }

          if (!(errors.length > 0)) {
            _context.next = 17;
            break;
          }

          _error = new Error(errors);
          _error.data = errors;
          _error.code = 422;
          throw _error;

        case 17:
          _context.next = 19;
          return regeneratorRuntime.awrap(User.findOne({
            where: {
              email: email.toLowerCase()
            }
          }));

        case 19:
          userExist = _context.sent;
          _context.next = 22;
          return regeneratorRuntime.awrap(User.findOne({
            where: {
              username: username.toLocaleLowerCase()
            }
          }));

        case 22:
          usernameExist = _context.sent;

          if (!(userExist || usernameExist)) {
            _context.next = 27;
            break;
          }

          _error2 = new Error("".concat(userExist ? "Email" : "Username", " taken already!"));
          _error2.code = 409;
          throw _error2;

        case 27:
          _context.next = 29;
          return regeneratorRuntime.awrap(bcrypt.hash(password, 12));

        case 29:
          hashedPass = _context.sent;
          _context.next = 32;
          return regeneratorRuntime.awrap(profilepic);

        case 32:
          _ref2 = _context.sent;
          createReadStream = _ref2.createReadStream;
          _context.prev = 34;
          _context.next = 37;
          return regeneratorRuntime.awrap(new Promise(function (res) {
            return createReadStream().pipe(bucket.file("".concat(username, "/").concat(name)).createWriteStream({
              resumable: false,
              gzip: true
            })).on("finish", res);
          }));

        case 37:
          _context.next = 44;
          break;

        case 39:
          _context.prev = 39;
          _context.t0 = _context["catch"](34);
          _error3 = new Error("No image uploaded");
          _error3.code = 422;
          throw _error3;

        case 44:
          user = User.build({
            email: email.toLocaleLowerCase(),
            password: hashedPass,
            fullname: fullname,
            username: username,
            verified: false,
            profilepic: "https://storage.googleapis.com/".concat(bcLink).concat(username, "/").concat(name),
            online: false,
            bio: bio
          });
          _context.next = 47;
          return regeneratorRuntime.awrap(user.save());

        case 47:
          createdUser = _context.sent;
          confirmationToken = data.emailConfirmation(user.username, user.email);
          functions.nodemailer(confirmationToken, user.email);
          return _context.abrupt("return", {
            username: createdUser.username,
            fullname: createdUser.fullname,
            message: "Check your inbox for the confirmation link.",
            bio: createdUser.bio
          });

        case 51:
        case "end":
          return _context.stop();
      }
    }
  }, null, null, [[34, 39]]);
};

exports.allUsers = function _callee2(_, __, context) {
  var user, allUsers, users;
  return regeneratorRuntime.async(function _callee2$(_context2) {
    while (1) {
      switch (_context2.prev = _context2.next) {
        case 0:
          if (!context.username) {
            errorHandler.authenticationError;
          }

          _context2.next = 3;
          return regeneratorRuntime.awrap(User.findOne({
            where: {
              username: context.username
            }
          }));

        case 3:
          user = _context2.sent;

          if (!user) {
            errorHandler.notFound("User");
          }

          _context2.next = 7;
          return regeneratorRuntime.awrap(User.findAll({
            attributes: ["username", "fullname", "profilepic", "bio", "updatedAt"],
            order: [["fullname", "ASC"]],
            where: {
              id: _defineProperty({}, Op.ne, user.id)
            }
          }));

        case 7:
          allUsers = _context2.sent;
          users = [];
          allUsers.map(function (user) {
            var data = user;
            data.online = user.online ? "Online" : functions.lastSeen(user.updatedAt);
            users.push(data);
          });
          return _context2.abrupt("return", users);

        case 11:
        case "end":
          return _context2.stop();
      }
    }
  });
};

exports.sendVerification = function _callee3(_, __, context) {
  var user, confirmationToken;
  return regeneratorRuntime.async(function _callee3$(_context3) {
    while (1) {
      switch (_context3.prev = _context3.next) {
        case 0:
          if (!context.username) {
            errorHandler.authenticationError;
          }

          _context3.next = 3;
          return regeneratorRuntime.awrap(User.findOne({
            where: {
              username: context.username
            }
          }));

        case 3:
          user = _context3.sent;

          if (!(user.verified === true)) {
            _context3.next = 6;
            break;
          }

          return _context3.abrupt("return", "Your email is already verified");

        case 6:
          if (!user) {
            errorHandler.notFound("User");
          }

          confirmationToken = data.emailConfirmation(user.username, user.email);
          functions.nodemailer(confirmationToken, user.email);
          return _context3.abrupt("return", "Check your Inbox for the confirmation link.");

        case 10:
        case "end":
          return _context3.stop();
      }
    }
  });
};

exports.verifyEmail = function _callee4(_, _ref3) {
  var confirmationToken, confirmed, user;
  return regeneratorRuntime.async(function _callee4$(_context4) {
    while (1) {
      switch (_context4.prev = _context4.next) {
        case 0:
          confirmationToken = _ref3.confirmationToken;
          confirmed = jwt.verify(confirmationToken, process.env.EMAIL_CONFIRMATION_TOKEN_SECRET);

          if (!confirmed) {
            errorHandler.notConfirmed();
          }

          _context4.next = 5;
          return regeneratorRuntime.awrap(User.findOne({
            where: {
              username: confirmed.username
            }
          }));

        case 5:
          user = _context4.sent;

          if (!user) {
            errorHandler.notFound("User");
          }

          if (!(user.verified === true && user.email === confirmed.email)) {
            _context4.next = 9;
            break;
          }

          return _context4.abrupt("return", "Your email have already been verified.");

        case 9:
          _context4.next = 11;
          return regeneratorRuntime.awrap(User.update({
            verified: true,
            email: confirmed.email
          }, {
            where: {
              id: user.id
            }
          }));

        case 11:
          return _context4.abrupt("return", "Your email have been verified successfully.");

        case 12:
        case "end":
          return _context4.stop();
      }
    }
  });
};

exports.updateEmail = function _callee5(_, _ref4, context) {
  var newEmail, user, confirmationToken;
  return regeneratorRuntime.async(function _callee5$(_context5) {
    while (1) {
      switch (_context5.prev = _context5.next) {
        case 0:
          newEmail = _ref4.newEmail;

          if (!context.username) {
            errorHandler.authenticationError();
          }

          _context5.next = 4;
          return regeneratorRuntime.awrap(User.findOne({
            where: {
              username: context.username
            }
          }));

        case 4:
          user = _context5.sent;

          if (!user) {
            errorHandler.notFound("User");
          }

          confirmationToken = data.emailConfirmation(user.username, newEmail);
          functions.nodemailer(confirmationToken, newEmail);
          return _context5.abrupt("return", "A confirmation link have been sent to you. Email will only updated once verified.");

        case 9:
        case "end":
          return _context5.stop();
      }
    }
  });
};

exports.login = function _callee6(_, _ref5) {
  var email, password, user, isEqual, token;
  return regeneratorRuntime.async(function _callee6$(_context6) {
    while (1) {
      switch (_context6.prev = _context6.next) {
        case 0:
          email = _ref5.email, password = _ref5.password;
          _context6.next = 3;
          return regeneratorRuntime.awrap(User.findOne({
            where: {
              email: email.toLocaleLowerCase()
            }
          }));

        case 3:
          user = _context6.sent;

          if (!user) {
            errorHandler.isInCorrect();
          }

          _context6.next = 7;
          return regeneratorRuntime.awrap(bcrypt.compare(password, user.password));

        case 7:
          isEqual = _context6.sent;

          if (!isEqual) {
            errorHandler.isInCorrect();
          }

          token = data.createAccessToken(user);
          return _context6.abrupt("return", token);

        case 11:
        case "end":
          return _context6.stop();
      }
    }
  });
};

exports.deleteUser = function _callee7(_, _ref6, context) {
  var password, user, isEqual;
  return regeneratorRuntime.async(function _callee7$(_context7) {
    while (1) {
      switch (_context7.prev = _context7.next) {
        case 0:
          password = _ref6.password;

          if (!context.username) {
            errorHandler.authenticationError();
          }

          _context7.next = 4;
          return regeneratorRuntime.awrap(User.findOne({
            where: {
              username: context.username
            }
          }));

        case 4:
          user = _context7.sent;

          if (!user) {
            errorHandler.notFound("User");
          }

          _context7.next = 8;
          return regeneratorRuntime.awrap(bcrypt.compare(password, user.password));

        case 8:
          isEqual = _context7.sent;

          if (!isEqual) {
            errorHandler.isNotEqual();
          }

          _context7.next = 12;
          return regeneratorRuntime.awrap(User.destroy({
            where: {
              id: user.id
            }
          }));

        case 12:
          return _context7.abrupt("return", "Account deleted successfully");

        case 13:
        case "end":
          return _context7.stop();
      }
    }
  });
};

exports.updateUser = function _callee8(_, _ref7, context) {
  var bio, about, fullname, username, user, errors, error, _error4, checkUsername, _error5;

  return regeneratorRuntime.async(function _callee8$(_context8) {
    while (1) {
      switch (_context8.prev = _context8.next) {
        case 0:
          bio = _ref7.bio, about = _ref7.about, fullname = _ref7.fullname, username = _ref7.username;

          if (!context.username) {
            errorHandler.authenticationError();
          }

          _context8.next = 4;
          return regeneratorRuntime.awrap(User.findOne({
            where: {
              username: context.username
            }
          }));

        case 4:
          user = _context8.sent;

          if (!user) {
            errorHandler.notFound("User");
          }

          errors = [];

          if (functions.isAlpha(fullname)) {
            _context8.next = 11;
            break;
          }

          error = new Error("Name must be alphabet");
          error.code = 422;
          throw error;

        case 11:
          if (!validator.isLength(fullname, {
            max: 25,
            min: 5
          })) {
            errors.push({
              message: "Name too short or too long"
            });
          }

          if (!validator.isLength(username, {
            max: 15,
            min: 4
          })) {
            errors.push({
              message: "Username should be more than 3 characters and less than 16 characters"
            });
          }

          if (!(errors.length > 0)) {
            _context8.next = 18;
            break;
          }

          _error4 = new Error("Invalid input.");
          _error4.data = errors;
          _error4.code = 422;
          throw _error4;

        case 18:
          _context8.next = 20;
          return regeneratorRuntime.awrap(User.findOne({
            where: {
              username: username
            }
          }));

        case 20:
          checkUsername = _context8.sent;

          if (!(checkUsername && checkUsername.id !== user.id)) {
            _context8.next = 25;
            break;
          }

          _error5 = new Error("Username already exist");
          _error5.code = 409;
          throw _error5;

        case 25:
          _context8.next = 27;
          return regeneratorRuntime.awrap(User.update({
            bio: bio,
            about: about,
            fullname: fullname,
            username: username
          }, {
            where: {
              id: user.id
            }
          }));

        case 27:
          return _context8.abrupt("return", "Updated successfully");

        case 28:
        case "end":
          return _context8.stop();
      }
    }
  });
};

exports.userDetails = function _callee9(_, __, context) {
  var user, username, email, fullname, bio, profilepic;
  return regeneratorRuntime.async(function _callee9$(_context9) {
    while (1) {
      switch (_context9.prev = _context9.next) {
        case 0:
          if (!context.username) {
            errorHandler.authenticationError();
          }

          _context9.next = 3;
          return regeneratorRuntime.awrap(User.findOne({
            where: {
              username: context.username
            }
          }));

        case 3:
          user = _context9.sent;

          if (!user) {
            errorHandler.notFound("User");
          }

          username = user.username, email = user.email, fullname = user.fullname, bio = user.bio, profilepic = user.profilepic;
          return _context9.abrupt("return", {
            username: username,
            email: email,
            fullname: fullname,
            bio: bio,
            profilepic: profilepic
          });

        case 7:
        case "end":
          return _context9.stop();
      }
    }
  });
};

exports.changePassword = function _callee10(_, _ref8, context) {
  var password, newPassword, user, isEqual;
  return regeneratorRuntime.async(function _callee10$(_context10) {
    while (1) {
      switch (_context10.prev = _context10.next) {
        case 0:
          password = _ref8.password, newPassword = _ref8.newPassword;

          if (!context.username) {
            errorHandler.authenticationError();
          }

          _context10.next = 4;
          return regeneratorRuntime.awrap(User.findOne({
            where: {
              username: context.username
            }
          }));

        case 4:
          user = _context10.sent;

          if (!user) {
            errorHandler.notFound("User");
          }

          _context10.next = 8;
          return regeneratorRuntime.awrap(bcrypt.compare(password, user.password));

        case 8:
          isEqual = _context10.sent;

          if (!isEqual) {
            errorHandler.isNotEqual();
          }

          if (!(validator.isEmpty(newPassword) || !validator.isLength(newPassword, {
            min: 8
          }))) {
            _context10.next = 12;
            break;
          }

          throw new Error("Password too short");

        case 12:
          _context10.next = 14;
          return regeneratorRuntime.awrap(User.update({
            password: newPassword
          }, {
            where: {
              id: user.id
            }
          }));

        case 14:
          return _context10.abrupt("return", "Password changed successfully.");

        case 15:
        case "end":
          return _context10.stop();
      }
    }
  });
};

exports.changeProfilePic = function _callee11(_, _ref9, context) {
  var image, user, _ref10, createReadStream, error;

  return regeneratorRuntime.async(function _callee11$(_context11) {
    while (1) {
      switch (_context11.prev = _context11.next) {
        case 0:
          image = _ref9.image;

          if (context.username) {
            _context11.next = 3;
            break;
          }

          return _context11.abrupt("return", errorCheck());

        case 3:
          _context11.next = 5;
          return regeneratorRuntime.awrap(User.findOne({
            where: {
              username: context.username
            }
          }));

        case 5:
          user = _context11.sent;

          if (!user) {
            errorHandler.notFound("User");
          }

          _context11.next = 9;
          return regeneratorRuntime.awrap(image);

        case 9:
          _ref10 = _context11.sent;
          createReadStream = _ref10.createReadStream;
          _context11.prev = 11;
          _context11.next = 14;
          return regeneratorRuntime.awrap(new Promise(function (res) {
            return createReadStream().pipe(bucket.file("".concat(context.username, "/").concat(name)).createWriteStream({
              resumable: false,
              gzip: true
            })).on("finish", res);
          }));

        case 14:
          _context11.next = 21;
          break;

        case 16:
          _context11.prev = 16;
          _context11.t0 = _context11["catch"](11);
          error = new Error("No image uploaded");
          error.code = 422;
          throw error;

        case 21:
          _context11.next = 23;
          return regeneratorRuntime.awrap(User.update({
            profilepic: "https://storage.googleapis.com/".concat(bcLink).concat(context.username, "/").concat(name)
          }, {
            where: {
              id: user.id
            }
          }));

        case 23:
          return _context11.abrupt("return", "Profilepic updated");

        case 24:
        case "end":
          return _context11.stop();
      }
    }
  }, null, null, [[11, 16]]);
};

exports.forgotPassword = function _callee12(_, _ref11) {
  var confirmationToken, newPassword, confirmed, user, password;
  return regeneratorRuntime.async(function _callee12$(_context12) {
    while (1) {
      switch (_context12.prev = _context12.next) {
        case 0:
          confirmationToken = _ref11.confirmationToken, newPassword = _ref11.newPassword;
          confirmed = jwt.verify(confirmationToken, process.env.CONFIRMATION_TOKEN_SECRET);

          if (!confirmed) {
            errorHandler.notConfirmed();
          }

          _context12.next = 5;
          return regeneratorRuntime.awrap(User.findOne({
            where: {
              username: confirmed.username
            }
          }));

        case 5:
          user = _context12.sent;
          _context12.next = 8;
          return regeneratorRuntime.awrap(bcrypt.hash(newPassword, 12));

        case 8:
          password = _context12.sent;
          _context12.next = 11;
          return regeneratorRuntime.awrap(User.update({
            password: password
          }, {
            where: {
              id: user.id
            }
          }));

        case 11:
          return _context12.abrupt("return", "Password updated successfully");

        case 12:
        case "end":
          return _context12.stop();
      }
    }
  });
};

exports.sendForgotPassMail = function _callee13(_, _ref12) {
  var email, user, error, confirmationToken;
  return regeneratorRuntime.async(function _callee13$(_context13) {
    while (1) {
      switch (_context13.prev = _context13.next) {
        case 0:
          email = _ref12.email;
          _context13.next = 3;
          return regeneratorRuntime.awrap(User.findOne({
            where: {
              email: email
            }
          }));

        case 3:
          user = _context13.sent;

          if (user) {
            _context13.next = 7;
            break;
          }

          error = new Error("User does'nt exist");
          throw error;

        case 7:
          confirmationToken = data.confimationToken(user);
          functions.forgotPassword(confirmationToken, email);
          return _context13.abrupt("return", "Check your Inbox for the confirmation link.");

        case 10:
        case "end":
          return _context13.stop();
      }
    }
  });
};