const multer = require("multer");
const path = require("path");
const fs = require("fs").promises;
const mongoose = require("mongoose");

// Ensure uploads directory exists
const ensureUploadsDir = async () => {
  try {
    await fs.mkdir(
      "C:/Users/Ajinkya/OneDrive/Desktop/projects/Lovefools/lovefools-user_panel/public/uploads",
      { recursive: true }
    );
  } catch (err) {
    console.error("Error creating uploads directory:", err);
  }
};

// Define storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(
      null,
      "C:/Users/Ajinkya/OneDrive/Desktop/projects/Lovefools/lovefools-user_panel/public/uploads/"
    ); // Path to store files
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const id = req.body.id || req.params.id;
    cb(null, file.fieldname + "-" + id + "-" + Date.now() + ext); // Create file name with ID
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

// const replaceFileIfExists = async (req, res, next) => {
//   const id = req.body.id || req.params.id;

//   if (!req.file) {
//     return res.status(400).json({ message: "No file uploaded." });
//   }

//   try {
//     await ensureUploadsDir();
//     const uploadsPath = "C:/Users/Ajinkya/OneDrive/Desktop/projects/Lovefools/lovefools-user_panel/public/uploads/";

//     // Read files in the uploads directory
//     const files = await fs.readdir(uploadsPath);

//     // Filter files to find any that match the pattern
//     const existingFiles = files.filter((file) => file.includes(`-${id}-`));

//     // Delete existing files
//     const deletePromises = existingFiles.map((file) => fs.unlink(path.join(uploadsPath, file)));
//     await Promise.all(deletePromises);

//     next();

//     // The new file is already saved by multer in the correct location
//     const newFilePath = `uploads/${req.file.filename}`;

//     const db = mongoose.connection.db;
//     const collections = await db.listCollections().toArray();

//     // Store promises for updates
//     const updatePromises = collections.map(async (collection) => {
//       const model = db.collection(collection.name);
//       const objectId = new mongoose.Types.ObjectId(id);

//       const updatedPhoto = await model.findOneAndUpdate(
//         { _id: objectId },
//         { $set: { photo: newFilePath } }, // Update with new file path
//         { new: true }
//       );

//       if (!updatedPhoto) {
//         console.warn(`Document with ID ${id} not found in collection ${collection.name}`);
//       }
//     });

//     await Promise.all(updatePromises);
//     console.log("All collections updated successfully");

//     res.status(200).json({
//       StatusCode: 200,
//       message: "Photos updated successfully.",
//       file: {
//         name: req.file.filename,
//         path: newFilePath,
//       },
//     });
//   } catch (err) {
//     console.error("Error:", err);
//     return res.status(500).json({ message: err.message || "An error occurred" });
//   }
// };

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

  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded." });
  }

  try {
    // Ensure uploads directory exists
    await ensureUploadsDir();

    // Path to your uploads directory
    const uploadsDir =
      "C:/Users/Ajinkya/OneDrive/Desktop/projects/Lovefools/lovefools-user_panel/public/uploads/";

    // Read files in the uploads directory
    const files = await fs.readdir(uploadsDir);

    // Extract the extension of the new file
    const newFileExtension = getFileExtension(req.file.filename);
    const newFilePath = `${uploadsDir}${req.file.filename}`;

    // Determine if the new file is a video
    const isVideo = isVideoFile(newFileExtension);

    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();

    // Store promises for updates
    const updatePromises = collections.map(async (collection) => {
      const model = db.collection(collection.name);
      const objectId = new mongoose.Types.ObjectId(id);

      // Set the appropriate field based on whether the file is a video
      const fieldToUpdate = isVideo
        ? { video: newFilePath }
        : { photo: newFilePath };

      const updatedPhoto = await model.findOneAndUpdate(
        { _id: objectId },
        { $set: fieldToUpdate }, // Update with the correct field (video or photo)
        { returnDocument: "after" } // Returns the updated document
      );

      if (!updatedPhoto) {
        console.warn(
          `Document with ID ${id} not found in collection ${collection.name}`
        );
      }
    });

    await Promise.all(updatePromises);

    // Filter out the new file from the files array and ensure the extension matches
    const existingFiles = files.filter((file) => {
      // Check if the file matches the current ID and is not the newly uploaded file
      const existingFileExtension = getFileExtension(file);
      return (
        file.includes(`-${id}-`) &&
        file !== req.file.filename &&
        existingFileExtension === newFileExtension // Ensure extensions match
      );
    });

    if (existingFiles.length === 0) {
      return res.status(400).json({
        StatusCode: 400,
        message: "No existing files with the same extension to replace.",
      });
    }

    // Delete existing files
    const deletePromises = existingFiles.map((file) =>
      fs.unlink(path.join(uploadsDir, file)).catch((err) => {
        console.error(`Error deleting file: ${file}`, err);
      })
    );

    await Promise.all(deletePromises);

    // Send response after all tasks are completed
    res.status(200).json({
      StatusCode: 200,
      message: isVideo
        ? "Video updated successfully."
        : "Photo updated successfully.",
      file: {
        name: req.file.filename,
        path: newFilePath,
      },
    });

    // Do not call next() after sending the response
  } catch (err) {
    console.error("Error:", err);
    return res
      .status(500)
      .json({ message: err.message || "An error occurred" });
  }
};
const getPhoto = async (req, res) => {
  const id = req.params.id;
  const uploadsPath =
    "C:/Users/Ajinkya/OneDrive/Desktop/projects/Lovefools/lovefools-user_panel/public/uploads/";

  try {
    const files = await fs.readdir(uploadsPath);
    const matchedFiles = files.filter((file) => file.includes(`-${id}-`));

    if (matchedFiles.length === 0) {
      return res.status(404).json({ message: "File not found" });
    }

    const fileToSend = path.join(uploadsPath, matchedFiles[0]);
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
