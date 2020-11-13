"use strict";

var nodemailer = require("nodemailer");

var sendgridTransport = require("nodemailer-sendgrid-transport");

var API_KEY = process.env.API_KEY;

exports.lastmsgTime = function lastmsgTime(t) {
  var date = new Date(t);
  var day = date.getDate();
  var month = date.getMonth() + 1;
  var year = date.getFullYear();
  var hours = date.getHours();
  var minutes = date.getMinutes();

  if (minutes < 10) {
    minutes = "0" + minutes;
  }

  var time = hours > 12 ? "".concat(hours - 12, ":").concat(minutes, " PM") : "".concat(hours, ":").concat(minutes, " AM");
  var currentDate = new Date();

  if ("".concat(day, "/").concat(month, "/").concat(year) === "".concat(currentDate.getDate(), "/").concat(currentDate.getMonth() + 1, "/").concat(currentDate.getFullYear())) {
    return time;
  }

  currentDate.setDate(currentDate.getDate() - 1);
  if (date > currentDate) return "Yesterday";
  return "".concat(day, "/").concat(month + 1, "/").concat(year);
};

exports.lastSeen = function lastSeen(t) {
  var date = new Date(t);
  var day = date.getDate();
  var month = date.getMonth() + 1;
  var year = date.getFullYear();
  var hours = date.getHours();
  var minutes = date.getMinutes();

  if (minutes < 10) {
    minutes = "0" + minutes;
  }

  var time = hours > 12 ? "".concat(hours - 12, ":").concat(minutes, " PM") : "".concat(hours, ":").concat(minutes, " AM");
  var newDate = new Date();

  if ("".concat(day, "/").concat(month, "/").concat(year) == "".concat(newDate.getDate(), "/").concat(newDate.getMonth() + 1, "/").concat(newDate.getFullYear())) {
    return "last seen today at ".concat(time);
  }

  var currentDate = new Date();
  currentDate.setDate(currentDate.getDate() - 1);
  if (date > currentDate) return "last seen yesterday at ".concat(time);
  return "last seen ".concat(day, "/").concat(month + 1, "/").concat(year, " at ").concat(time);
};

exports.isAlpha = function allLetter(inputtxt) {
  var str = inputtxt.split("");
  return str.every(isTrue);
};

function isTrue(alpha) {
  var letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz ";
  var letters_arr = letters.split("");
  return letters_arr.includes(alpha);
}

exports.nodemailer = function (confirmationToken, email) {
  var transporter = nodemailer.createTransport(sendgridTransport({
    auth: {
      api_key: API_KEY
    }
  }));
  var url = "".concat(process.env.FRONT_END_URL, "/confirmation/").concat(confirmationToken);
  var mailOptions = {
    from: process.env.EMAIL_ADDRESS,
    //env
    to: email,
    subject: "Verify Email Address.",
    text: "Please click on this link to activate your account. Link expires in 15 minutes. \n        ".concat(url, ".")
  };
  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      throw new Error(error);
    }
  });
};

exports.forgotPassword = function (confirmationToken, email) {
  var transporter = nodemailer.createTransport(sendgridTransport({
    auth: {
      api_key: API_KEY
    }
  }));
  var url = "".concat(process.env.FRONT_END_URL, "/confirmation/").concat(confirmationToken);
  var mailOptions = {
    from: process.env.EMAIL_ADDRESS,
    to: email,
    subject: "Forgot Password",
    text: "Please click on this link to change your password. Link expires in 15minutes. \n        ".concat(url, ".")
  };
  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      throw new Error(error);
    }
  });
};

exports.convertToTime = function convertToTime(createdAt) {
  var date = new Date(createdAt);
  var hours = date.getHours() + 1;
  var time = "AM";
  var minutes = date.getMinutes();

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
  var date = new Date(t);
  var day = date.getDate();
  var month = date.getMonth() + 1;
  var year = date.getFullYear();
  var minutes = date.getMinutes();

  if (minutes < 10) {
    minutes = "0" + minutes;
  }

  var currentDate = new Date();

  if ("".concat(day, "/").concat(month, "/").concat(year) === "".concat(currentDate.getDate(), "/").concat(currentDate.getMonth() + 1, "/").concat(currentDate.getFullYear())) {
    return false;
  }

  return true;
};