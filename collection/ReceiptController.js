const ReceiptSchema = require("../schema/Receipt");

const AddReceiptData = async (req, res) => {
  try {
    // Create a new instance of the Receipt model with the request body
    const newReceipt = new ReceiptSchema(req.body);

    // Save the receipt to the database
    const savedReceipt = await newReceipt.save();

    // Respond with the ID of the newly created receipt
    res.status(201).json({ StatusCode: 201, data: savedReceipt._id });
  } catch (error) {
    // Handle any errors during the process
    res.status(500).json({ message: "Error adding receipt", error });
  }
};

const UpdateReceiptData = async (req, res) => {
  try {
    const receiptId = req.query.receiptId;

    // Check if receiptId is provided
    if (!receiptId) {
      return res.status(400).json({ message: "Receipt ID is required" });
    }

    // Update the receipt with the new data from the request body
    const updatedReceipt = await ReceiptSchema.findOneAndUpdate(
      { _id: receiptId }, // Query to find the receipt by ID
      req.body
    );

    // If the receipt is not found, return a 404 response
    if (!updatedReceipt) {
      return res
        .status(404)
        .json({ StatusCode: 404, message: "Receipt not found" });
    }

    // Respond with the updated receipt data
    res.status(200).json({ StatusCode: 200, data: updatedReceipt });
  } catch (error) {
    // Handle any errors during the process
    res.status(500).json({ message: "Error updating receipt", error });
  }
};

const GetReceiptsList = async (req, res) => {
  try {
    // Extract query parameters for sorting, limiting, and searching
    const sortBy = req.body.sortBy || "createdAt"; // Default sorting field
    const sortOrder =
      req.body.sortOrder === "desc" ? -1 : req.body.sortOrder === "asc" ? 1 : 1; // Default sorting order
    const limit = parseInt(req.body.limit, 10) || 10; // Default limit
    const searchKey = req.body.searchKey || ""; // Search key for filtering by receipt_Name

    // Build query object
    const query = searchKey
      ? { receipt_Name: { $regex: searchKey, $options: "i" } }
      : {};

    // Retrieve and sort receipts from the database
    const receipts = await ReceiptSchema.find(query)
      .sort({ [sortBy]: sortOrder }) // Sort by specified field and order
      .limit(limit); // Limit the number of results

    // Respond with the list of receipts
    res.status(200).json({ StatusCode: 200, data: receipts });
  } catch (error) {
    // Log the error for debugging
    console.error("Error retrieving receipts:", error);

    // Respond with a detailed error message
    res.status(500).json({
      message: "Error retrieving receipts",
      error: error.message || "Unknown error",
    });
  }
};

module.exports = { AddReceiptData, UpdateReceiptData, GetReceiptsList };
