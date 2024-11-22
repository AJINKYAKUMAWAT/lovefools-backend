const TableSchema = require("../schema/Table");

const AddTableData = async (req, res) => {
  try {
    // Create a new instance of the Table model with the request body
    const newTable = new TableSchema(req.body);

    // Save the receipt to the database
    const savedTable = await newTable.save();

    // Respond with the ID of the newly created receipt
    res.status(201).json({ StatusCode: 201, data: savedTable._id });
  } catch (error) {
    // Handle any errors during the process
    res.status(500).json({ message: "Error adding receipt", error });
  }
};

const UpdateTableData = async (req, res) => {
  try {
    const tableId = req.params.tableId;

    // Check if tableId is provided
    if (!tableId) {
      return res.status(400).json({ message: "Table ID is required" });
    }

    // Update the receipt with the new data from the request body
    const updatedTable = await TableSchema.findOneAndUpdate(
      { _id: tableId }, // Query to find the receipt by ID
      req.body
    );

    // If the receipt is not found, return a 404 response
    if (!updatedTable) {
      return res
        .status(404)
        .json({ StatusCode: 404, message: "Table not found" });
    }

    // Respond with the updated receipt data
    res.status(200).json({ StatusCode: 200, data: updatedTable });
  } catch (error) {
    // Handle any errors during the process
    res.status(500).json({ message: "Error updating receipt", error });
  }
};

const GetTablesList = async (req, res) => {
  try {
    const sortBy = req.body.sortBy || "createdAt";
    const sortOrder = parseInt(req.body.sortOrder, 10) || 1;
    const limit = parseInt(req.body.limit, 10) || 10;
    const page = parseInt(req.body.page, 10) || 1;
    const searchKey = req.body.search || "";
    const floor_id = req.body.floor_id; // Assume `floor_id` is passed in the request body
    const room_id = req.body.room_id; // Assume `floor_id` is passed in the request body

    // Construct the query
    const query = {
      ...(floor_id ? { floor_id: floor_id } : {}), // Filter by `floor_id` if provided
      ...(room_id ? { room_id: room_id } : {}), // Filter by `room_id` if provided
      ...(searchKey
        ? { table_number: { $regex: searchKey, $options: "i" } }
        : {}),
    };

    const totalTables = await TableSchema.countDocuments(query);

    const receipts = await TableSchema.find(query)
      .collation({ locale: "en", strength: 2 })
      .sort({ [sortBy]: sortOrder })
      .skip((page - 1) * limit)
      .limit(limit);

    res.status(200).json({
      StatusCode: 200,
      data: receipts,
      pageData: {
        total: totalTables,
        page: page,
        limit: limit,
      },
    });
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


const DeleteTable = async (req, res) => {
  try {
    const tableId = req.params.tableId; // Accessing the query parameter from the URL

    if (!tableId) {
      return res
        .status(400)
        .json({ StatusCode: 400, message: "Table ID is required" });
    }

    // Attempt to delete the receipt by its ID
    const deletedTable = await TableSchema.findByIdAndDelete(tableId);

    if (!deletedTable) {
      // If no receipt was found, respond with a 404 status code
      return res
        .status(404)
        .json({ StatusCode: 404, message: "Table not found" });
    }

    // Respond with success if the receipt was deleted
    res.status(200).json({
      StatusCode: 200,
      message: "Table deleted successfully",
      data: deletedTable,
    });
  } catch (error) {
    // Log and respond with any errors
    console.error("Error deleting receipt:", error);
    res.status(500).json({
      StatusCode: 500,
      message: "Error deleting receipt",
      error: error.message || "Unknown error",
    });
  }
};

module.exports = {
  AddTableData,
  UpdateTableData,
  GetTablesList,
  DeleteTable,
};
