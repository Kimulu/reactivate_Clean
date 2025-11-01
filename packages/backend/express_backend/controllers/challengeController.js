// controllers/challengeController.js
const axios = require("axios");
const Challenge = require("../models/Challenge");
const UserChallengeSubmission = require("../models/UserChallengeSubmission");
const User = require("../models/User");

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
    console.error("❌ Error fetching challenges:", err.message);
    res.status(500).json({ message: "Server error fetching challenges" });
  }
};

// @route GET /api/challenges/:id
// @desc Get a single challenge by its custom 'id' field
// @access Public
exports.getChallengeById = async (req, res) => {
  try {
    const challenge = await Challenge.findOne({ id: req.params.id });

    if (!challenge) {
      return res.status(404).json({ message: "Challenge not found" });
    }

    res.status(200).json(challenge.toObject());
  } catch (err) {
    console.error(`❌ Error fetching challenge ${req.params.id}:`, err.message);
    res.status(500).json({ message: "Server error fetching challenge" });
  }
};

// @route POST /api/challenges/:challengeId/submit
// @desc Submit code for a challenge
// @access Private (requires auth)
exports.submitChallenge = async (req, res) => {
  const { challengeId } = req.params;
  const { submittedCode } = req.body;
  const userId = req.user._id;

  if (!submittedCode || Object.keys(submittedCode).length === 0) {
    return res.status(400).json({ message: "Submitted code is required." });
  }

  try {
    const challenge = await Challenge.findOne({ id: challengeId });
    if (!challenge) {
      return res.status(404).json({ message: "Challenge not found" });
    }

    const pointsToAward = challenge.points;
    const existingSubmission = await UserChallengeSubmission.findOne({
      user: userId,
      challenge: challenge._id,
    });

    const submission = await UserChallengeSubmission.findOneAndUpdate(
      { user: userId, challenge: challenge._id },
      {
        submittedCode,
        completed: true,
        submittedAt: Date.now(),
        challengeId: challenge.id,
        pointsEarned: pointsToAward,
      },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    // 🧩 Update total points logic
    if (existingSubmission && !existingSubmission.completed) {
      await User.findByIdAndUpdate(userId, {
        $inc: { totalPoints: pointsToAward },
      });
      console.log(
        `🏅 User ${userId} earned ${pointsToAward} pts for completing ${challengeId}`
      );
    } else if (!existingSubmission) {
      await User.findByIdAndUpdate(userId, {
        $inc: { totalPoints: pointsToAward },
      });
      console.log(
        `🎉 User ${userId} earned ${pointsToAward} pts for new completion ${challengeId}`
      );
    }

    const updatedUser = await User.findById(userId).select("totalPoints");

    res.status(200).json({
      message: "Challenge submitted and marked as completed successfully!",
      submission,
      userPoints: updatedUser?.totalPoints,
    });
  } catch (err) {
    console.error("❌ Error submitting challenge:", err.message);
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
    }).select("challengeId pointsEarned -_id");

    const completedChallengesInfo = completedSubmissions.map((sub) => ({
      challengeId: sub.challengeId,
      pointsEarned: sub.pointsEarned,
    }));

    res.status(200).json(completedChallengesInfo);
  } catch (err) {
    console.error("❌ Error fetching completed challenges:", err.message);
    res
      .status(500)
      .json({ message: "Server error fetching completed challenges" });
  }
};

// @route POST /api/challenges/run-tests
// @desc Run tests for a challenge submission by forwarding to the test runner service
// @access Private (requires auth)
exports.runChallengeTests = async (req, res) => {
  try {
    console.log(
      "⚙️ Received request body from frontend:",
      JSON.stringify(req.body, null, 2)
    );

    // =================== THIS IS THE FIX ===================

    // 1. Receive the data from the frontend. It has a 'testCode' property.
    const { userSolutionFiles, testCode } = req.body;
    const { challengeId } = req.params; // Get the ID from the URL

    // 2. Check for the runner URL
    if (!process.env.RUNNER_URL) {
      throw new Error("RUNNER_URL environment variable is not set.");
    }

    const runnerEndpoint = `${process.env.RUNNER_URL}/api/runner/run-tests`;
    console.log(`🚀 Forwarding test run request to: ${runnerEndpoint}`);

    // 3. Create the payload for the runner service.
    //    The runner expects a property named 'testFileContent'.
    const runnerPayload = {
      challengeId,
      userSolutionFiles,
      testFileContent: testCode, // <-- Translate the property name here
    };

    // 4. Send the correctly formatted payload to the runner.
    const response = await axios.post(runnerEndpoint, runnerPayload);

    // =======================================================

    console.log("✅ Runner response received:", response.data);
    res.status(200).json(response.data);
  } catch (error) {
    console.error("❌ Error forwarding test run to runner service:", {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
    });

    if (error.response) {
      return res.status(error.response.status).json(error.response.data);
    }

    res
      .status(500)
      .json({ error: "Failed to connect to the test runner service." });
  }
};
