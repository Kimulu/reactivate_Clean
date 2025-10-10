// models/Challenge.js

const mongoose = require("mongoose");

// FileSchema is likely not directly used here but within the 'files' Mixed type.
// If you want to strictly validate the structure of files within the 'files' object,
// you might integrate this differently, but for now, 'Mixed' handles it.
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

const ChallengeSchema = new mongoose.Schema(
  {
    id: {
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
    files: {
      type: mongoose.Schema.Types.Mixed, // Stores an object like { 'index.js': { code: '...', active: true }, 'utils.js': { code: '...' } }
      required: true,
    },
    // 💡 NEW FIELD: This will store the Jest test code for the challenge
    testCode: {
      type: String,
      required: true, // It's crucial for every challenge to have test code
    },
    // 💡 NEW FIELD: Points for completing this challenge
    points: {
      type: Number,
      required: true,
      default: 10, // Default to 10 points if not specified
      min: 0,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt fields
  }
);

module.exports = mongoose.model("Challenge", ChallengeSchema);
