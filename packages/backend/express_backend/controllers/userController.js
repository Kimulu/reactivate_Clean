// controllers/userController.js

const User = require("../models/User");
const UserChallengeSubmission = require("../models/UserChallengeSubmission"); // 💡 NEW: Import submission model
const Challenge = require("../models/Challenge"); // 💡 NEW: Import Challenge model if needed for validation
const bcrypt = require("bcryptjs"); // 💡 CRITICAL FIX: Import bcryptjs

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

// 💡 NEW: @route PUT /api/users/:userId/profile
// @desc Update user profile (username, email)
// @access Private (only self or admin)
exports.updateProfile = async (req, res) => {
  const { userId } = req.params;
  const { username, email } = req.body;
  const loggedInUserId = req.user._id;

  // 💡 SECURITY: Ensure user is updating their own profile
  if (loggedInUserId.toString() !== userId.toString()) {
    return res
      .status(403)
      .json({ message: "Not authorized to update this profile." });
  }

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // Check if new username/email already exists for *another* user
    if (username && username !== user.username) {
      const existingUsername = await User.findOne({ username });
      if (existingUsername)
        return res.status(400).json({ message: "Username already taken." });
    }
    if (email && email !== user.email) {
      const existingEmail = await User.findOne({ email });
      if (existingEmail)
        return res.status(400).json({ message: "Email already registered." });
    }

    // Update fields
    user.username = username || user.username;
    user.email = email || user.email;

    await user.save(); // Mongoose pre-save hooks (like password hashing) won't run unless password is modified.

    // Return updated user info (excluding password)
    res.status(200).json({
      message: "Profile updated successfully!",
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        totalPoints: user.totalPoints,
        createdAt: user.createdAt,
      },
    });
  } catch (err) {
    console.error(`Error updating profile for user ${userId}:`, err.message);
    res.status(500).json({ message: "Server error updating profile." });
  }
};

// 💡 NEW: @route PUT /api/users/:userId/password
// @desc Update user password
// @access Private (only self)
exports.updatePassword = async (req, res) => {
  const { userId } = req.params;
  const { currentPassword, newPassword } = req.body;
  const loggedInUserId = req.user._id;

  if (loggedInUserId.toString() !== userId.toString()) {
    return res
      .status(403)
      .json({ message: "Not authorized to change this password." });
  }
  if (!currentPassword || !newPassword) {
    return res
      .status(400)
      .json({ message: "Current password and new password are required." });
  }
  if (newPassword.length < 6) {
    // Basic password strength check
    return res
      .status(400)
      .json({ message: "New password must be at least 6 characters." });
  }

  try {
    // Select password explicitly as it's typically set to select: false
    const user = await User.findById(userId).select("+password");
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // Check current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid current password." });
    }

    // Update password
    user.password = newPassword; // Mongoose pre-save hook will hash this
    await user.save();

    res.status(200).json({ message: "Password updated successfully!" });
  } catch (err) {
    console.error(`Error updating password for user ${userId}:`, err.message);
    res.status(500).json({ message: "Server error updating password." });
  }
};

// 💡 NEW: @route DELETE /api/users/:userId
// @desc Delete user account
// @access Private (only self or admin)
exports.deleteAccount = async (req, res) => {
  const { userId } = req.params;
  const loggedInUserId = req.user._id;

  if (loggedInUserId.toString() !== userId.toString()) {
    return res
      .status(403)
      .json({ message: "Not authorized to delete this account." });
  }

  try {
    // Optionally delete related data (submissions, posts, comments)
    await UserChallengeSubmission.deleteMany({ user: userId });
    await CommunityPost.deleteMany({ user: userId });
    // Also remove comments made by this user from other posts (complex, might be a separate job)

    const user = await User.findByIdAndDelete(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    res.status(200).json({ message: "Account deleted successfully!" });
  } catch (err) {
    console.error(`Error deleting account for user ${userId}:`, err.message);
    res.status(500).json({ message: "Server error deleting account." });
  }
};
