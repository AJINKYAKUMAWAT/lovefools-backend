const multer = require("multer");
const path = require("path");
const fs = require("fs").promises;
const fsp = require("fs");
const mongoose = require("mongoose");
const AWS = require("aws-sdk");
// Define storage

const AWS_BUCKET_NAME="the-lovefools"
const s3Bucket = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});
const s3 = new AWS.S3();
const storage = multer.diskStorage({
  s3: s3Bucket,
  bucket: AWS_BUCKET_NAME,
  acl: "public-read",
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const id = req.body.id || req.params.id;
    cb(null, file.fieldname + "-" + id + "-" + Date.now() + ext); // Create file name with ID
  },
});
// File filter to allow only specific types (images and videos)
const fileFilter = (req, file, cb) => {
  const fileTypes = /jpeg|jpg|png|gif|mp4|avi|mkv/;
  const extname = fileTypes.test(path.extname(file.originalname).toLowerCase());
  const mimeType = fileTypes.test(file.mimetype);
  if (mimeType && extname) {
    return cb(null, true);
  } else {
    cb(new Error("Only images and videos are allowed"));
  }
};

// Initialize the upload middleware
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
});

// Utility function to extract file extension
const getFileExtension = (filename) => {
  return filename.split(".").pop().toLowerCase(); // Get the part after the last dot and make it lowercase
};

// Utility function to check if the file is a video based on its extension
const isVideoFile = (extension) => {
  const videoExtensions = ["mp4", "avi", "mov", "mkv", "flv", "wmv", "webm"];
  return videoExtensions.includes(extension);
};

const replaceFileIfExists = async (req, res, next) => {
  const id = req.body.id || req.params.id;
  console.log(id);
  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded." });
  }

  console.log(id);
  

  try {
    const isVideo = isVideoFile(getFileExtension(req.file.originalname));
    const uploadResult = await uploadFileToS3(req.file, id, isVideo);

    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();

    const updatePromises = collections.map(async (collection) => {
      const model = db.collection(collection.name);
      const objectId = new mongoose.Types.ObjectId(id);

      const fieldToUpdate = isVideo
        ? { video: uploadResult.location }
        : { photo: uploadResult.location };

      const updatedPhoto = await model.findOneAndUpdate(
        { _id: objectId },
        { $set: fieldToUpdate },
        { returnDocument: "after" }
      );

      if (!updatedPhoto) {
        console.warn(
          `Document with ID ${id} not found in collection ${collection.name}`
        );
      }
    });

    await Promise.all(updatePromises);

    res.status(200).json({
      StatusCode: 200,
      message: isVideo
        ? "Video uploaded and updated successfully."
        : "Photo uploaded and updated successfully.",
      file: {
        name: req.file.originalname,
        s3Path: uploadResult.location,
      },
    });
  } catch (err) {
    console.error("Error replacing file:", err);
    return res.status(500).json({ message: "An error occurred", err });
  }
};

const getPhoto = async (req, res) => {
  const id = req.params.id;

  try {
    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();

    let fileUrl = null;
    for (const collection of collections) {
      const model = db.collection(collection.name);
      const objectId = new mongoose.Types.ObjectId(id);

      const document = await model.findOne({ _id: objectId });
      if (document && (document.photo || document.video)) {
        fileUrl = document.photo || document.video;
        break;
      }
    }

    if (!fileUrl) {
      return res.status(404).json({ message: "File not found" });
    }

    res.json({
      message: "File URL retrieved successfully",
      fileUrl,
    });
  } catch (err) {
    console.error("Error retrieving file:", err);
    return res.status(500).json({ message: "Unable to retrieve file" });
  }
};

const uploadFileToS3 = async (file, id, isVideo) => {
  const s3Key = `uploads/${id}-${path.extname(file.originalname)}`;
  console.log(file, "file");
  const fileContent = fsp.readFileSync(file.path);
  const params = {
    Bucket: AWS_BUCKET_NAME,
    Key: s3Key,
    Body: fileContent,
    ContentType: file.mimetype,
    ACL: "public-read",
  };

  try {
    const uploadResult = await s3.upload(params).promise();
    console.log("File uploaded to S3:", uploadResult.Location);
    return {
      location: uploadResult.Location,
      key: uploadResult.Key,
    };
  } catch (err) {
    console.error("Error uploading to S3:", err);
    throw err;
  }
};

const DeleteImg = async (req, res) => {
  const bucketName = AWS_BUCKET_NAME; // Replace with your S3 bucket name
  const key = `uploads/${req.body.PhotoUrl}`; // Include folder and file extension

  if (!key) {
    return res
      .status(400)
      .json({ error: "Key is required to delete the file." });
  }

  const params = {
    Bucket: bucketName,
    Key: key, // Full path to the object
  };

  try {
    await s3.deleteObject(params).promise();
    res.status(200).json({ message: "File deleted successfully." });
  } catch (error) {
    console.error("Error deleting file:", error);
    res
      .status(500)
      .json({ error: "Failed to delete file.", details: error.message });
  }
};

// Export the upload middleware and replacement function
module.exports = {
  upload,
  s3,
  DeleteImg,
  replaceFileIfExists,
  getPhoto,
};
