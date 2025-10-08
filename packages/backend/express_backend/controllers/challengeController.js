// controllers/challengeController.js

const Challenge = require("../models/Challenge");
const UserChallengeSubmission = require("../models/UserChallengeSubmission");
const User = require("../models/User"); // 💡 NEW: Import User model to update totalPoints

// @route GET /api/challenges
// @desc Get all challenges
// @access Public
exports.getChallenges = async (req, res) => {
  try {
    // 💡 MODIFIED: .find({}) will now automatically include the 'points' field
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

// @route GET /api/challenges/:id
// @desc Get a single challenge by its custom 'id' field
// @access Public
exports.getChallengeById = async (req, res) => {
  try {
    // 💡 MODIFIED: .findOne({}) will now automatically include the 'points' field
    const challenge = await Challenge.findOne({ id: req.params.id });

    if (!challenge) {
      return res.status(404).json({ message: "Challenge not found" });
    }

    res.status(200).json(challenge.toObject());
  } catch (err) {
    console.error(`Error fetching challenge ${req.params.id}:`, err.message);
    res.status(500).json({ message: "Server error fetching challenge" });
  }
};

// @route POST /api/challenges/:challengeId/submit
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
    // 1. Find the challenge by its custom ID to get its MongoDB _id AND points
    const challenge = await Challenge.findOne({ id: challengeId });
    if (!challenge) {
      return res.status(404).json({ message: "Challenge not found" });
    }

    // Determine points to award. This challenge's points will be used.
    const pointsToAward = challenge.points;
    let oldPointsEarned = 0; // To track if points were previously earned for this challenge

    // 2. Create or Update the UserChallengeSubmission
    // We need to check if a submission already exists to correctly update totalPoints
    const existingSubmission = await UserChallengeSubmission.findOne({
      user: userId,
      challenge: challenge._id,
    });

    const submission = await UserChallengeSubmission.findOneAndUpdate(
      { user: userId, challenge: challenge._id },
      {
        submittedCode: submittedCode,
        completed: true,
        submittedAt: Date.now(),
        challengeId: challenge.id,
        pointsEarned: pointsToAward, // 💡 NEW: Set pointsEarned
      },
      {
        new: true,
        upsert: true,
        setDefaultsOnInsert: true,
      }
    );

    // 💡 NEW: Update user's total points only if this is a new submission or points changed
    if (existingSubmission && !existingSubmission.completed) {
      // If previous submission existed but wasn't completed, award points
      await User.findByIdAndUpdate(userId, {
        $inc: { totalPoints: pointsToAward },
      });
      console.log(
        `User ${userId} earned ${pointsToAward} for completing ${challengeId}.`
      );
    } else if (!existingSubmission) {
      // If no existing submission, it's a new completion, award points
      await User.findByIdAndUpdate(userId, {
        $inc: { totalPoints: pointsToAward },
      });
      console.log(
        `User ${userId} earned ${pointsToAward} for new completion of ${challengeId}.`
      );
    }
    // If it was already completed and points are the same, no change to totalPoints.
    // If you want to award points for re-submission even if already completed, modify logic here.

    res.status(200).json({
      message: "Challenge submitted and marked as completed successfully!",
      submission,
      userPoints: (await User.findById(userId).select("totalPoints"))
        ?.totalPoints, // 💡 NEW: Return updated totalPoints
    });
  } catch (err) {
    console.error("Error submitting challenge:", err.message);
    res
      .status(500)
      .json({ message: "Server error during challenge submission" });
  }
};

// @route GET /api/challenges/completed
// @desc Get all challenges completed by the logged-in user
// @access Private (requires auth)
exports.getCompletedChallenges = async (req, res) => {
  const userId = req.user._id;

  try {
    const completedSubmissions = await UserChallengeSubmission.find({
      user: userId,
      completed: true,
    }).select("challengeId pointsEarned -_id"); // 💡 MODIFIED: Select pointsEarned as well

    // Extract challengeId strings and points
    const completedChallengesInfo = completedSubmissions.map((sub) => ({
      challengeId: sub.challengeId,
      pointsEarned: sub.pointsEarned,
    }));

    res.status(200).json(completedChallengesInfo); // 💡 MODIFIED: Return object with points
  } catch (err) {
    console.error("Error fetching completed challenges:", err.message);
    res
      .status(500)
      .json({ message: "Server error fetching completed challenges" });
  }
};
