// controllers/userController.js

const User = require("../models/User");
const UserChallengeSubmission = require("../models/UserChallengeSubmission"); // 💡 NEW: Import submission model
const Challenge = require("../models/Challenge"); // 💡 NEW: Import Challenge model if needed for validation

exports.getLeaderboard = async (req, res) => {
  console.log("Backend: /api/users/leaderboard route hit."); // 💡 NEW LOG
  console.log("Backend: req.user from protect middleware:", req.user); // 💡 NEW LOG (should show logged-in user if token is valid)

  try {
    const leaderboard = await User.find({})
      .sort({ totalPoints: -1 })
      .select("username totalPoints -_id")
      .limit(100);

    console.log(
      "Backend: Leaderboard data fetched from DB:",
      leaderboard.length,
      "users."
    ); // 💡 NEW LOG
    res.status(200).json(leaderboard);
  } catch (err) {
    console.error("Backend Error fetching leaderboard:", err.message); // 💡 MODIFIED LOG
    res.status(500).json({ message: "Server error fetching leaderboard" });
  }
};

// 💡 NEW: @route GET /api/users/:userId/submissions/:challengeId
// @desc Get a specific user's submission for a given challenge
// @access Private (only the user themselves or admin can see it)
exports.getUserChallengeSubmission = async (req, res) => {
  const { userId, challengeId } = req.params;
  const loggedInUserId = req.user._id; // From auth middleware

  // 💡 SECURITY: Ensure the logged-in user is either viewing their own submission
  // or is an admin (if you implement roles). For now, assume only own user.
  if (loggedInUserId.toString() !== userId.toString()) {
    return res
      .status(403)
      .json({ message: "Not authorized to view this submission." });
  }

  try {
    // First, find the challenge to get its MongoDB _id
    const challenge = await Challenge.findOne({ id: challengeId });
    if (!challenge) {
      return res.status(404).json({ message: "Challenge not found." });
    }

    // Then, find the submission for that user and challenge
    const submission = await UserChallengeSubmission.findOne({
      user: loggedInUserId,
      challenge: challenge._id,
      completed: true, // Only consider completed/passing submissions
    }).select("submittedCode submittedAt pointsEarned -_id"); // Select specific fields

    if (!submission) {
      return res
        .status(404)
        .json({ message: "No passing submission found for this challenge." });
    }

    res.status(200).json(submission);
  } catch (err) {
    console.error(
      `Error fetching user submission for ${challengeId} by ${userId}:`,
      err.message
    );
    res.status(500).json({ message: "Server error fetching submission." });
  }
};

// 💡 NEW: @route GET /api/users/:userId/highest-score
// @desc Get a specific user's highest points earned in a single challenge submission
// @access Private (only the user themselves or admin can see it)
exports.getHighestChallengeScore = async (req, res) => {
  const { userId } = req.params;
  const loggedInUserId = req.user._id;

  if (loggedInUserId.toString() !== userId.toString()) {
    return res
      .status(403)
      .json({ message: "Not authorized to view this user's highest score." });
  }

  try {
    const highestScoreSubmission = await UserChallengeSubmission.findOne({
      user: loggedInUserId,
      completed: true,
    })
      .sort({ pointsEarned: -1 }) // Sort by highest points earned
      .select("pointsEarned -_id"); // Select only pointsEarned

    const highestScore = highestScoreSubmission
      ? highestScoreSubmission.pointsEarned
      : 0;

    res.status(200).json({ highestScore });
  } catch (err) {
    console.error(
      `Error fetching highest score for user ${userId}:`,
      err.message
    );
    res.status(500).json({ message: "Server error fetching highest score." });
  }
};
