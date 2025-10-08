// models/Challenge.js

const mongoose = require("mongoose");

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
      type: mongoose.Schema.Types.Mixed,
      required: true,
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
    timestamps: true,
  }
);

module.exports = mongoose.model("Challenge", ChallengeSchema);
