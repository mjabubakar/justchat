const { Storage } = require("@google-cloud/storage");

const gc = new Storage({
  keyFilename: process.env.GCLOUD_FILE_PATH,
  projectId: process.env.GCLOUD_PROJECT_ID,
});

const bucket = gc.bucket(process.env.GCLOUD_STORAGE_BUCKET_URL);

const bc = process.env.GCLOUD_STORAGE_BUCKET_URL;

const bcLink = bc.split("gs://")[1];

module.exports = {
  bcLink,
  bucket,
};
