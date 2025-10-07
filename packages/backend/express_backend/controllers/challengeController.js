// controllers/challengeController.js

const Challenge = require("../models/Challenge");

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
