const AWS = require("aws-sdk");
const multer = require("multer");
const multerS3 = require("multer-s3");

// Configure AWS with your access and secret key.
AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID, // Your Access Key ID
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY, // Your Secret Access Key
  region: process.env.AWS_REGION, // Your AWS Region
});

const s3 = new AWS.S3();

// Set up multer and configure the storage option using multerS3
const uploadPhoto = multer({
  storage: multerS3({
    s3: s3,
    bucket: "your-bucket-name", // Your bucket name
    acl: "public-read", // Set permissions
    key: function (req, file, cb) {
      cb(null, Date.now().toString() + "-" + file.originalname); // File name to be saved in S3
    },
  }),
});

// Export the upload middleware for use in your routes
module.exports = uploadPhoto;
