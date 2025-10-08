// models/UserChallengeSubmission.js

const mongoose = require("mongoose");

const UserChallengeSubmissionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    challenge: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Challenge",
      required: true,
    },
    challengeId: {
      type: String,
      required: true,
    },
    submittedCode: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
    completed: {
      type: Boolean,
      default: false,
    },
    submittedAt: {
      type: Date,
      default: Date.now,
    },
    // 💡 NEW FIELD: Store the points earned for this specific submission
    pointsEarned: {
      type: Number,
      required: true,
      default: 0, // Default to 0, will be updated upon submission
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

UserChallengeSubmissionSchema.index(
  { user: 1, challenge: 1 },
  { unique: true }
);

module.exports = mongoose.model(
  "UserChallengeSubmission",
  UserChallengeSubmissionSchema
);
