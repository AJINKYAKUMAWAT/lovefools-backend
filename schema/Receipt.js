const mongoose = require("mongoose");

const ReceiptSchema = new mongoose.Schema({
  emailId: { type: String, required: true },
  mobileNo: { type: String, required: true },
  date: { type: Date, required: true }, // Consider changing to Number if appropriate
  time: { type: String, required: true },
  price: { type: Number, required: true }, // Consider changing to Number if appropriate
  type: { type: String, required: true },
  sub_type: { type: String, required: true },
  created_date: { type: Date, default: Date.now }, // Correct type and set default value
});

// Export the model correctly
module.exports = mongoose.model("Receipt", ReceiptSchema);
