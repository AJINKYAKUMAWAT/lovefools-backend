const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Define storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // Path to store files
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const id = req.body.id || req.params.id; // Get the ID from body or params
    cb(null, file.fieldname + "-" + id + "-" + Date.now() + ext); // Create file name with ID
  },
});

// File filter to allow only specific types (images and videos)
const fileFilter = (req, file, cb) => {
  console.log("Uploaded file:", file); // Log the file details
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

// Middleware to handle file replacement
const replaceFileIfExists = (req, res, next) => {
  const id = req.body.id || req.params.id;
  const existingFilePath = path.join(__dirname, "uploads", `file-${id}-*`); // Adjust filename pattern

  // Use fs.readdir to check for existing files matching the ID
  fs.readdir("uploads/", (err, files) => {
    if (err) return next(err);

    // Filter files to find any that match the pattern
    const existingFiles = files.filter((file) => file.includes(`-${id}-`));

    // Delete existing files
    existingFiles.forEach((file) => {
      fs.unlink(path.join("uploads/", file), (err) => {
        if (err) console.error(`Error deleting file: ${file}`, err);
      });
    });

    next();
  });
};

const getPhoto = (req, res) => {
  const id = req.params.id;
  const filePath = path.join(__dirname, "../uploads"); // Path to uploads directory

  // Check for files matching the ID
  fs.readdir(filePath, (err, files) => {
    if (err) {
      return res.status(500).json({ message: "Unable to read directory" });
    }

    const matchedFiles = files.filter((file) => file.includes(`-${id}-`)); // Adjust as necessary

    if (matchedFiles.length === 0) {
      return res.status(404).json({ message: "File not found" });
    }

    // Send the file path or serve the file
    const fileToSend = path.join(filePath, matchedFiles[0]); // Send the first matched file
    res.json({
      message: "File retrieved successfully",
      filePath: fileToSend, // Return the file path
    });
  });
};
// Export the upload middleware and replacement function
module.exports = {
  upload,
  replaceFileIfExists,
  getPhoto,
};
