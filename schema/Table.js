const mongoose = require("mongoose");

const TableSchema = new mongoose.Schema({
  table_number: { type: String },
  seatCount: { type: String },
  description: { type: String },
  photo: { type: String },
  created_date: { type: Date, default: Date.now }, // Correct type and set default value
});

// Export the model correctly
module.exports = mongoose.model("Table", TableSchema);
