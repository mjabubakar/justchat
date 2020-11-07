const nodemailer = require("nodemailer");
const sendgridTransport = require("nodemailer-sendgrid-transport");

const API_KEY = process.env.API_KEY;

exports.lastmsgTime = function lastmsgTime(t) {
  const date = new Date(t);
  const day = date.getDate();
  const month = date.getMonth() + 1;
  const year = date.getFullYear();
  const hours = date.getHours();
  let minutes = date.getMinutes();
  if (minutes < 10) {
    minutes = "0" + minutes;
  }

  const time =
    hours > 12 ? `${hours - 12}:${minutes} PM` : `${hours}:${minutes} AM`;
  let currentDate = new Date();
  if (
    `${day}/${month}/${year}` ===
    `${currentDate.getDate()}/${
      currentDate.getMonth() + 1
    }/${currentDate.getFullYear()}`
  ) {
    return time;
  }
  currentDate.setDate(currentDate.getDate() - 1);

  if (date > currentDate) return `Yesterday`;

  return `${day}/${month + 1}/${year}`;
};

exports.lastSeen = function lastSeen(t) {
  const date = new Date(t);
  const day = date.getDate();
  const month = date.getMonth() + 1;
  const year = date.getFullYear();
  const hours = date.getHours();
  let minutes = date.getMinutes();
  if (minutes < 10) {
    minutes = "0" + minutes;
  }
  const time =
    hours > 12 ? `${hours - 12}:${minutes} PM` : `${hours}:${minutes} AM`;
  let newDate = new Date();
  if (
    `${day}/${month}/${year}` ==
    `${newDate.getDate()}/${newDate.getMonth() + 1}/${newDate.getFullYear()}`
  ) {
    return `last seen today at ${time}`;
  }
  let currentDate = new Date();

  currentDate.setDate(currentDate.getDate() - 1);

  if (date > currentDate) return `last seen yesterday at ${time}`;

  return `last seen ${day}/${month + 1}/${year} at ${time}`;
};

exports.isAlpha = function allLetter(inputtxt) {
  const str = inputtxt.split("");

  return str.every(isTrue);
};

function isTrue(alpha) {
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz ";
  const letters_arr = letters.split("");
  return letters_arr.includes(alpha);
}

exports.nodemailer = (confirmationToken, email) => {
  const transporter = nodemailer.createTransport(
    sendgridTransport({
      auth: {
        api_key: API_KEY,
      },
    })
  );

  const url = `http://localhost:${process.env.PORT}/confirmation/${confirmationToken}`;
  const mailOptions = {
    from: process.env.EMAIL_ADDRESS, //env
    to: email,
    subject: "Verify Email Address.",
    text: `Please click on this link to activate your account. Link expires in 15 minutes. 
        ${url}.`,
  };

  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      throw new Error(error);
    }
  });
};

exports.forgotPassword = (confirmationToken, email) => {
  const transporter = nodemailer.createTransport(
    sendgridTransport({
      auth: {
        api_key: API_KEY,
      },
    })
  );

  const url = `http://localhost:${process.env.PORT}/confirmation/${confirmationToken}`;
  const mailOptions = {
    from: process.env.EMAIL_ADDRESS,
    to: email,
    subject: "Forgot Password",
    text: `Please click on this link to change your password. Link expires in 15minutes. 
        ${url}.`,
  };

  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      throw new Error(error);
    }
  });
};

exports.convertToTime = function convertToTime(createdAt) {
  const date = new Date(createdAt);
  let hours = date.getHours();
  let time = "AM";
  let minutes = date.getMinutes();

  if (minutes < 10) {
    minutes = "0" + minutes;
  }

  if (hours > 12) {
    hours = hours - 12;
    time = "PM";
  } else if (hours < 1) {
    hours = "12";
    time = "AM";
  }

  return hours + ":" + minutes + " " + time;
};

exports.isToday = function isToday(t) {
  const date = new Date(t);
  const day = date.getDate();
  const month = date.getMonth() + 1;
  const year = date.getFullYear();
  let minutes = date.getMinutes();
  if (minutes < 10) {
    minutes = "0" + minutes;
  }

  let currentDate = new Date();
  if (
    `${day}/${month}/${year}` ===
    `${currentDate.getDate()}/${
      currentDate.getMonth() + 1
    }/${currentDate.getFullYear()}`
  ) {
    return false;
  }
  return true;
};
