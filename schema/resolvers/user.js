const { User } = require("../../models");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const functions = require("../../functions");
const data = require("../../data");
const jwt = require("jsonwebtoken");
const errorHandler = require("../../ErrorHandler");
const Op = require("sequelize").Op;
const { bcLink, bucket } = require("../../gcloud");

const name = new Date().getTime().toString();

exports.createUser = async function (_, { userInput }) {
  const { email, password, username, fullname, profilepic, bio } = userInput;
  const errors = [];

  if (!validator.isEmail(email)) {
    const error = new Error("Invalid email address");
    error.code = 422;
    throw error;
  }

  if (!functions.isAlpha(fullname)) {
    errors.push({ message: "Fullname must be alphabet" });
  }

  if (!validator.isLength(fullname, { max: 25, min: 5 })) {
    errors.push({ message: "Name too short or too long" });
  }

  if (!validator.isLength(username, { max: 15, min: 4 })) {
    errors.push({
      message:
        "Username should be more than 3 characters and less than 16 characters",
    });
  }

  if (
    validator.isEmpty(password) ||
    !validator.isLength(password, { min: 8 })
  ) {
    errors.push({ message: "Password too short" });
  }

  if (
    validator.isEmpty(email) ||
    validator.isEmpty(username) ||
    validator.isEmpty(fullname)
  ) {
    errors.push({ message: "All fields are required" });
  }

  if (errors.length > 0) {
    const error = new Error(errors);
    error.data = errors;
    error.code = 422;
    throw error;
  }

  const userExist = await User.findOne({
    where: { email: email.toLowerCase() },
  });
  const usernameExist = await User.findOne({
    where: { username: username.toLocaleLowerCase() },
  });

  if (userExist || usernameExist) {
    const error = new Error(
      `${userExist ? "Email" : "Username"} taken already!`
    );
    error.code = 409;
    throw error;
  }

  const hashedPass = await bcrypt.hash(password, 12);
  const { createReadStream } = await profilepic;
  try {
    await new Promise((res) =>
      createReadStream()
        .pipe(
          bucket.file(`${username}/${name}`).createWriteStream({
            resumable: false,
            gzip: true,
          })
        )
        .on("finish", res)
    );
  } catch (e) {
    const error = new Error("No image uploaded");
    error.code = 422;
    throw error;
  }

  const user = User.build({
    email: email.toLocaleLowerCase(),
    password: hashedPass,
    fullname,
    username,
    verified: false,
    profilepic: `https://storage.googleapis.com/${bcLink}${username}/${name}`,
    online: false,
    bio,
  });

  const createdUser = await user.save();

  const confirmationToken = data.emailConfirmation(user.username, user.email);

  functions.nodemailer(confirmationToken, user.email);

  return {
    username: createdUser.username,
    fullname: createdUser.fullname,
    message: "Check your inbox for the confirmation link.",
    bio: createdUser.bio,
  };
};

exports.allUsers = async (_, __, context) => {
  if (!context.username) {
    errorHandler.authenticationError;
  }

  const user = await User.findOne({ where: { username: context.username } });

  if (!user) {
    errorHandler.notFound("User");
  }

  const allUsers = await User.findAll({
    attributes: ["username", "fullname", "profilepic", "bio", "updatedAt"],
    order: [["fullname", "ASC"]],
    where: { id: { [Op.ne]: user.id } },
  });
  const users = [];

  allUsers.map((user) => {
    const data = user;
    data.online = user.online ? "Online" : functions.lastSeen(user.updatedAt);
    users.push(data);
  });
  return users;
};

exports.sendVerification = async function (_, __, context) {
  if (!context.username) {
    errorHandler.authenticationError;
  }

  const user = await User.findOne({ where: { username: context.username } });

  if (user.verified === true) return "Your email is already verified";

  if (!user) {
    errorHandler.notFound("User");
  }

  const confirmationToken = data.emailConfirmation(user.username, user.email);

  functions.nodemailer(confirmationToken, user.email);

  return "Check your Inbox for the confirmation link.";
};

exports.verifyEmail = async function (_, { confirmationToken }) {
  let confirmed = jwt.verify(
    confirmationToken,
    process.env.EMAIL_CONFIRMATION_TOKEN_SECRET
  );

  if (!confirmed) {
    errorHandler.notConfirmed();
  }

  const user = await User.findOne({ where: { username: confirmed.username } });

  if (!user) {
    errorHandler.notFound("User");
  }

  if (user.verified === true && user.email === confirmed.email)
    return "Your email have already been verified.";

  await User.update(
    {
      verified: true,
      email: confirmed.email,
    },
    {
      where: {
        id: user.id,
      },
    }
  );

  return "Your email have been verified successfully.";
};

exports.updateEmail = async function (_, { newEmail }, context) {
  if (!context.username) {
    errorHandler.authenticationError();
  }

  const user = await User.findOne({ where: { username: context.username } });

  if (!user) {
    errorHandler.notFound("User");
  }

  const confirmationToken = data.emailConfirmation(user.username, newEmail);

  functions.nodemailer(confirmationToken, newEmail);

  return "A confirmation link have been sent to you. Email will only updated once verified.";
};

exports.login = async function (_, { email, password }) {
  const user = await User.findOne({
    where: { email: email.toLocaleLowerCase() },
  });

  if (!user) {
    errorHandler.isInCorrect();
  }

  const isEqual = await bcrypt.compare(password, user.password);

  if (!isEqual) {
    errorHandler.isInCorrect();
  }

  const token = data.createAccessToken(user);

  return token;
};

exports.deleteUser = async function (_, { password }, context) {
  if (!context.username) {
    errorHandler.authenticationError();
  }

  const user = await User.findOne({ where: { username: context.username } });

  if (!user) {
    errorHandler.notFound("User");
  }

  const isEqual = await bcrypt.compare(password, user.password);

  if (!isEqual) {
    errorHandler.isNotEqual();
  }

  await User.destroy({
    where: { id: user.id },
  });
  return "Account deleted successfully";
};

exports.updateUser = async function (
  _,
  { bio, about, fullname, username },
  context
) {
  if (!context.username) {
    errorHandler.authenticationError();
  }

  const user = await User.findOne({ where: { username: context.username } });

  if (!user) {
    errorHandler.notFound("User");
  }

  const errors = [];

  if (!functions.isAlpha(fullname)) {
    const error = new Error("Name must be alphabet");
    error.code = 422;
    throw error;
  }

  if (!validator.isLength(fullname, { max: 25, min: 5 })) {
    errors.push({ message: "Name too short or too long" });
  }

  if (!validator.isLength(username, { max: 15, min: 4 })) {
    errors.push({
      message:
        "Username should be more than 3 characters and less than 16 characters",
    });
  }

  if (errors.length > 0) {
    const error = new Error("Invalid input.");
    error.data = errors;
    error.code = 422;
    throw error;
  }

  const checkUsername = await User.findOne({ where: { username } });

  if (checkUsername && checkUsername.id !== user.id) {
    const error = new Error("Username already exist");
    error.code = 409;
    throw error;
  }

  await User.update(
    {
      bio,
      about,
      fullname,
      username,
    },
    { where: { id: user.id } }
  );
  return "Updated successfully";
};

exports.userDetails = async function (_, __, context) {
  if (!context.username) {
    errorHandler.authenticationError();
  }

  const user = await User.findOne({ where: { username: context.username } });

  if (!user) {
    errorHandler.notFound("User");
  }

  const { username, email, fullname, bio, profilepic } = user;

  return { username, email, fullname, bio, profilepic };
};

exports.changePassword = async function (
  _,
  { password, newPassword },
  context
) {
  if (!context.username) {
    errorHandler.authenticationError();
  }

  const user = await User.findOne({ where: { username: context.username } });

  if (!user) {
    errorHandler.notFound("User");
  }

  const isEqual = await bcrypt.compare(password, user.password);

  if (!isEqual) {
    errorHandler.isNotEqual();
  }

  if (
    validator.isEmpty(newPassword) ||
    !validator.isLength(newPassword, { min: 8 })
  ) {
    throw new Error("Password too short");
  }

  await User.update(
    {
      password: newPassword,
    },
    { where: { id: user.id } }
  );
  return "Password changed successfully.";
};

exports.changeProfilePic = async (_, { image }, context) => {
  if (!context.username) {
    return errorCheck();
  }

  const user = await User.findOne({ where: { username: context.username } });

  if (!user) {
    errorHandler.notFound("User");
  }

  const { createReadStream } = await image;

  try {
    await new Promise((res) =>
      createReadStream()
        .pipe(
          bucket.file(`${context.username}/${name}`).createWriteStream({
            resumable: false,
            gzip: true,
          })
        )
        .on("finish", res)
    );
  } catch (e) {
    const error = new Error("No image uploaded");
    error.code = 422;
    throw error;
  }
  await User.update(
    {
      profilepic: `https://storage.googleapis.com/${bcLink}${context.username}/${name}`,
    },
    {
      where: {
        id: user.id,
      },
    }
  );
  return "Profilepic updated";
};

exports.forgotPassword = async function (
  _,
  { confirmationToken, newPassword }
) {
  const confirmed = jwt.verify(
    confirmationToken,
    process.env.CONFIRMATION_TOKEN_SECRET
  );

  if (!confirmed) {
    errorHandler.notConfirmed();
  }

  const user = await User.findOne({ where: { username: confirmed.username } });
  const password = await bcrypt.hash(newPassword, 12);

  await User.update(
    {
      password,
    },
    {
      where: {
        id: user.id,
      },
    }
  );
  return "Password updated successfully";
};

exports.sendForgotPassMail = async function (_, { email }) {
  const user = await User.findOne({ where: { email } });

  if (!user) {
    const error = new Error("User does'nt exist");
    throw error;
  }

  const confirmationToken = data.confimationToken(user);

  functions.forgotPassword(confirmationToken, email);

  return "Check your Inbox for the confirmation link.";
};
