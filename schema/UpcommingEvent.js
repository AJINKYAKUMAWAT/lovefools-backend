const mongoose = require("mongoose");

const UpcomingEventSchema = new mongoose.Schema({
  upcomingEvent_Name: { type: String, required: true },
  description: { type: String, required: true },
  date: { type: Date, required: true }, // Consider changing to Number if appropriate
  status: { type: String, required: true },
  photo: { type: String },
  created_date: { type: Date, default: Date.now }, // Correct type and set default value
});

// Export the model correctly
module.exports = mongoose.model("UpcomingEvent", UpcomingEventSchema);
