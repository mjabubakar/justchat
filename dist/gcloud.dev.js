"use strict";

var _require = require("@google-cloud/storage"),
    Storage = _require.Storage;

var gc = new Storage({
  keyFilename: process.env.GCLOUD_APPLICATION_CREDENTIALS,
  projectId: process.env.GCLOUD_PROJECT_ID
});
var bucket = gc.bucket(process.env.GCLOUD_STORAGE_BUCKET_URL);
var bc = process.env.GCLOUD_STORAGE_BUCKET_URL;
var bcLink = bc.split("gs://")[1];
module.exports = {
  bcLink: bcLink,
  bucket: bucket
};