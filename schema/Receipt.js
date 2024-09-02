const mongoose = require("mongoose");

const ReceiptSchema = new mongoose.Schema({
  receipt_Name: { type: String, required: true, unique: true },
  description: { type: String, required: true },
  price: { type: String, required: true }, // Consider changing to Number if appropriate
  type: { type: String, required: true },
  sub_type: { type: String, required: true },
  photo: { type: String, required: true },
  created_date: { type: Date, default: Date.now }, // Correct type and set default value
});

// Export the model correctly
module.exports = mongoose.model("Receipt", ReceiptSchema);
