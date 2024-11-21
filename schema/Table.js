const mongoose = require("mongoose");

const TableSchema = new mongoose.Schema({
  floor_id:{ type: String, required:true},
  table_number: { type: String },
  seatCount: { type: String },
  description: { type: String },
  created_date: { type: Date, default: Date.now }, 
});

// Export the model correctly
module.exports = mongoose.model("Table", TableSchema);
