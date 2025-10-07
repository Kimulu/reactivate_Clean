// models/UserChallengeSubmission.js

const mongoose = require("mongoose");

const UserChallengeSubmissionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // References the User model
      required: true,
    },
    challenge: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Challenge", // References the Challenge model
      required: true,
    },
    // We'll store the challenge's custom 'id' (e.g., "fragments") for easier querying on frontend
    challengeId: {
      type: String,
      required: true,
    },
    // Store the user's submitted code for this challenge
    submittedCode: {
      type: mongoose.Schema.Types.Mixed, // Use Mixed for flexible file structure
      required: true,
    },
    completed: {
      type: Boolean,
      default: false, // Initially false, set to true upon successful submission
    },
    submittedAt: {
      type: Date,
      default: Date.now,
    },
    // You might add fields for score, attempts, etc., later.
  },
  {
    timestamps: true, // Adds createdAt and updatedAt
  }
);

// Ensure a user can only have one submission per challenge
UserChallengeSubmissionSchema.index(
  { user: 1, challenge: 1 },
  { unique: true }
);

module.exports = mongoose.model(
  "UserChallengeSubmission",
  UserChallengeSubmissionSchema
);
