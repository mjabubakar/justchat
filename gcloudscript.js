const fs = require('fs');
require('dotenv/config');

const obj = process.env.GCLOUD_CRED;

fs.appendFile('key.json', obj, function (err) {
	if (err) throw err;
});
