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
    console.log("📦 Does body have files?", !!req.body.userSolutionFiles);

    const { userSolutionFiles, testFileContent } = req.body;
    const { challengeId } = req.params; // Get the ID from the URL parameters

    if (!process.env.RUNNER_URL) {
      throw new Error("RUNNER_URL environment variable is not set.");
    }

    const runnerEndpoint = `${process.env.RUNNER_URL}/api/run-tests`;
    console.log(`🚀 Forwarding test run request to: ${runnerEndpoint}`);

    // 🔥 Send the request to the runner
    const response = await axios.post(runnerEndpoint, {
      challengeId,
      userSolutionFiles,
      testFileContent,
    });

    console.log("✅ Runner response received:", response.data);

    res.status(200).json(response.data);
  } catch (error) {
    console.error("❌ Error forwarding test run to runner service:", {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
    });

    // 🧠 Handle different cases
    if (error.response) {
      const status = error.response.status;
      const data = error.response.data || {};
      const message =
        status === 404
          ? "Runner service not found — check RUNNER_URL or route path."
          : status === 400
          ? "Bad request sent to runner service."
          : "Runner service error.";

      return res.status(status).json({ error: message, details: data });
    }

    res
      .status(500)
      .json({ error: "Failed to connect to the test runner service." });
  }
};
