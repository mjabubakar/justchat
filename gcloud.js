const { Storage } = require("@google-cloud/storage");
const path = require("path");

const gc = new Storage({
  keyFilename: process.env.GCLOUD_APPLICATION_CREDENTIALS,
  projectId: process.env.GCLOUD_PROJECT_ID,
});

const bucket = gc.bucket(process.env.GCLOUD_STORAGE_BUCKET_URL);

const bc = process.env.GCLOUD_STORAGE_BUCKET_URL;

const bcLink = bc.split("gs://")[1];

module.exports = {
  bcLink,
  bucket,
};
