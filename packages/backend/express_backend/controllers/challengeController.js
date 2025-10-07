// controllers/challengeController.js
const Challenge = require("../models/Challenge");
const UserChallengeSubmission = require("../models/UserChallengeSubmission"); // 💡 NEW: Import submission model

// @route GET /api/challenges
// @desc Get all challenges
// @access Public
exports.getChallenges = async (req, res) => {
  try {
    const challenges = await Challenge.find({});
    const formattedChallenges = challenges.map((challenge) =>
      challenge.toObject()
    );
    res.status(200).json(formattedChallenges);
  } catch (err) {
    console.error("Error fetching challenges:", err.message);
    res.status(500).json({ message: "Server error fetching challenges" });
  }
};

// 💡 NEW: @route GET /api/challenges/:id
// @desc Get a single challenge by its custom 'id' field
// @access Public
exports.getChallengeById = async (req, res) => {
  try {
    // Find by the custom 'id' field, not MongoDB's '_id'
    const challenge = await Challenge.findOne({ id: req.params.id });

    if (!challenge) {
      return res.status(404).json({ message: "Challenge not found" });
    }

    // Convert to plain object and send
    res.status(200).json(challenge.toObject());
  } catch (err) {
    console.error(`Error fetching challenge ${req.params.id}:`, err.message);
    res.status(500).json({ message: "Server error fetching challenge" });
  }
};

// 💡 NEW: @route POST /api/challenges/:challengeId/submit
// @desc Submit code for a challenge
// @access Private (requires auth)
exports.submitChallenge = async (req, res) => {
  const { challengeId } = req.params; // Get custom challenge ID from URL
  const { submittedCode } = req.body; // User's submitted code (object of files)
  const userId = req.user._id; // User ID from auth middleware

  if (!submittedCode || Object.keys(submittedCode).length === 0) {
    return res.status(400).json({ message: "Submitted code is required." });
  }

  try {
    // 1. Find the challenge by its custom ID to get its MongoDB _id
    const challenge = await Challenge.findOne({ id: challengeId });
    if (!challenge) {
      return res.status(404).json({ message: "Challenge not found" });
    }

    // 2. Create or Update the UserChallengeSubmission
    const submission = await UserChallengeSubmission.findOneAndUpdate(
      { user: userId, challenge: challenge._id }, // Find by user and challenge _id
      {
        submittedCode: submittedCode,
        completed: true, // Mark as completed (since frontend already passed tests)
        submittedAt: Date.now(),
        challengeId: challenge.id, // Store frontend-friendly challenge ID
      },
      {
        new: true, // Return the updated document
        upsert: true, // Create a new document if it doesn't exist
        setDefaultsOnInsert: true, // Apply defaults if a new doc is inserted
      }
    );

    res.status(200).json({
      message: "Challenge submitted and marked as completed successfully!",
      submission,
    });
  } catch (err) {
    console.error("Error submitting challenge:", err.message);
    res
      .status(500)
      .json({ message: "Server error during challenge submission" });
  }
};

// 💡 NEW: @route GET /api/challenges/completed
// @desc Get all challenges completed by the logged-in user
// @access Private (requires auth)
exports.getCompletedChallenges = async (req, res) => {
  const userId = req.user._id; // User ID from auth middleware

  try {
    const completedSubmissions = await UserChallengeSubmission.find({
      user: userId,
      completed: true,
    }).select("challengeId -_id"); // Only return the challengeId and hide _id

    // Extract just the challengeId strings
    const completedChallengeIds = completedSubmissions.map(
      (sub) => sub.challengeId
    );

    res.status(200).json(completedChallengeIds);
  } catch (err) {
    console.error("Error fetching completed challenges:", err.message);
    res
      .status(500)
      .json({ message: "Server error fetching completed challenges" });
  }
};
