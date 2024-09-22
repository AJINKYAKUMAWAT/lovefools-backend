const multer = require("multer");
const path = require("path");
const fs = require("fs").promises; // Use promises version for easier async/await handling
const mongoose = require("mongoose");

// Ensure uploads directory exists
const ensureUploadsDir = async () => {
  try {
    await fs.mkdir("uploads", { recursive: true });
  } catch (err) {
    console.error("Error creating uploads directory:", err);
  }
};

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

const replaceFileIfExists = async (req, res, next) => {
  const id = req.body.id || req.params.id;
  console.log("ID received:", id);
  console.log("Uploaded File:", req.file);

  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded." });
  }

  try {
    // Ensure uploads directory exists
    await ensureUploadsDir();

    // Read files in the uploads directory
    const files = await fs.readdir("uploads/");
    console.log("Files in uploads directory:", files);

    fs.readdir("uploads/", async (err, files) => {
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

      // The new file is already saved by multer in the correct location
      const newFilePath = `uploads/${req.file.filename}`;
      console.log(`New file saved as: ${newFilePath}`);

      const db = mongoose.connection.db;
      const collections = await db.listCollections().toArray();

      // Store promises for updates
      const updatePromises = collections.map(async (collection) => {
        const model = db.collection(collection.name);
        const objectId = new mongoose.Types.ObjectId(id);

        const updatedPhoto = await model.findOneAndUpdate(
          { _id: objectId },
          { $set: { photo: newFilePath } }, // Update with new file path
          { new: true }
        );

        if (!updatedPhoto) {
          console.warn(
            `Document with ID ${id} not found in collection ${collection.name}`
          );
        }
      });

      await Promise.all(updatePromises);
      console.log("All collections updated successfully");

      res.status(200).json({
        StatusCode: 200,
        message: "Photos updated successfully.",
        file: {
          name: req.file.filename,
          path: newFilePath,
        },
      });
    });
  } catch (err) {
    console.error("Error:", err);
    return res
      .status(500)
      .json({ message: err.message || "An error occurred" });
  }
};

const getPhoto = async (req, res) => {
  const id = req.params.id;
  const filePath = path.join(__dirname, "../uploads"); // Path to uploads directory

  try {
    // Check for files matching the ID
    const files = await fs.readdir(filePath); // Use fs.promises.readdir
    const matchedFiles = files.filter((file) => file.includes(`-${id}-`));

    if (matchedFiles.length === 0) {
      return res.status(404).json({ message: "File not found" });
    }

    const fileToSend = path.join(filePath, matchedFiles[0]);
    res.json({
      message: "File retrieved successfully",
      filePath: fileToSend,
    });
  } catch (err) {
    console.error("Error reading directory:", err);
    return res.status(500).json({ message: "Unable to read directory" });
  }
};

// Export the upload middleware and replacement function
module.exports = {
  upload,
  replaceFileIfExists,
  getPhoto,
};
