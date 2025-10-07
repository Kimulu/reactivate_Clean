// routes/challengeRoutes.js

const express = require("express");
const router = express.Router();
const challengeController = require("../controllers/challengeController");
// const authMiddleware = require('../middleware/authMiddleware'); // For later security

// Public route to get all challenges
router.get("/", challengeController.getChallenges);
// 💡 NEW: Route for fetching a single challenge by its custom 'id'
router.get("/:id", challengeController.getChallengeById);

// You'll add protected routes here later (e.g., router.post('/:id/submit', authMiddleware, challengeController.submitChallenge);)

module.exports = router;
