// models/CommunityPost.js

const mongoose = require("mongoose");

const CommunityPostSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // References the User model
      required: true,
    },
    challenge: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Challenge", // References the Challenge model (optional, for solution posts)
      required: false, // Make it optional for general discussion posts
    },
    challengeId: {
      // Frontend-friendly ID for linking to challenge page (optional)
      type: String,
      required: false,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100, // Limit title length
    },
    // For solution posts, this would be the submitted code (object of files)
    // For general discussions, this could be null or empty, or a text body.
    codeContent: {
      type: mongoose.Schema.Types.Mixed, // Stores the submitted code object (similar to UserChallengeSubmission)
      required: false, // Optional if it's a non-code discussion post
    },
    body: {
      // For longer descriptions or general discussion text
      type: String,
      required: false, // Optional if it's purely a code submission
      maxlength: 2000,
    },
    type: {
      // Distinguish between 'solution' and 'discussion'
      type: String,
      enum: ["solution", "discussion"],
      required: true,
      default: "discussion", // Default type
    },
    tags: [String], // Optional tags for filtering posts (e.g., 'React', 'useState')
    comments: [
      // Nested comments array
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        username: {
          // Denormalize username for easier display
          type: String,
          required: true,
        },
        text: {
          type: String,
          required: true,
          maxlength: 500,
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    upvotes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], // Users who upvoted
    downvotes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], // Users who downvoted
  },
  {
    timestamps: true, // Adds createdAt and updatedAt
  }
);

module.exports = mongoose.model("CommunityPost", CommunityPostSchema);
