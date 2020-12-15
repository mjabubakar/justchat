"use strict";

var fs = require('fs');

require('dotenv/config');

var obj = process.env.GCLOUD_CRED;
fs.appendFile('key.json', obj, function (err) {
  if (err) throw err;
});