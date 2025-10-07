// models/Challenge.js

const mongoose = require("mongoose");

// Define a schema for individual files within a challenge
const FileSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
  },
  active: {
    type: Boolean,
    default: false,
  },
  hidden: {
    type: Boolean,
    default: false,
  },
});

// Main Challenge Schema
const ChallengeSchema = new mongoose.Schema(
  {
    id: {
      // This will be the unique ID used by your frontend (e.g., "fragments", "counter")
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    title: {
      type: String,
      required: true,
    },
    difficulty: {
      type: String,
      required: true,
      enum: ["easy", "medium", "hard"],
    },
    instructions: {
      type: String,
      required: true,
    },
    // 💡 FIX: Change 'files' type from Map to a plain Object
    // Mongoose will store this as a subdocument (embedded document)
    files: {
      type: mongoose.Schema.Types.Mixed, // Use Mixed for flexible object keys/values
      required: true,
      // You can also define it as a plain object like:
      // type: Object,
      // default: {}, // A default empty object is good practice
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Challenge", ChallengeSchema);
