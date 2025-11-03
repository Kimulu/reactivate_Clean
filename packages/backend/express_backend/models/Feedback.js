// models/Feedback.js
const mongoose = require("mongoose");

const FeedbackSchema = new mongoose.Schema(
  {
    // The user who submitted the feedback.
    // This is automatically linked from the 'protect' middleware.
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true, // Switched to true because your route is protected.
    },
    // The main content of the feedback.
    message: {
      type: String,
      required: true,
      trim: true,
    },
    // The 1-5 star rating.
    rating: {
      type: Number,
      min: 1,
      max: 5,
      required: true,
    },
  },
  {
    // Automatically adds `createdAt` and `updatedAt` fields.
    timestamps: true,
  }
);

module.exports = mongoose.model("Feedback", FeedbackSchema);
