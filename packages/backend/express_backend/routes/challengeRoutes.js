// routes/challengeRoutes.js

// Add this line at the very top of routes/challengeRoutes.js
console.log(
  "✅✅✅ --- challengeRoutes.js file loaded successfully! --- ✅✅✅"
);
const express = require("express");
const router = express.Router();
const challengeController = require("../controllers/challengeController");
const { protect } = require("../middleware/authMiddleware");

// =================== CORRECTED ROUTES ===================

// Get all challenges (public)
router.get("/", challengeController.getChallenges);

// Get all completed challenges for a logged-in user (private)
router.get("/completed", protect, challengeController.getCompletedChallenges);

// --- SPECIFIC CHALLENGE ROUTES ---

// THIS IS THE CORRECT ROUTE DEFINITION FOR RUNNING TESTS
// It correctly includes the challengeId parameter.
router.post(
  "/:challengeId/run-tests",
  protect,
  challengeController.runChallengeTests
);

// Route for submitting a challenge (private)
router.post(
  "/:challengeId/submit",
  protect,
  challengeController.submitChallenge
);

// Get a single challenge by its ID (public)
// This should be the LAST route with a parameter to avoid conflicts.
router.get("/:id", challengeController.getChallengeById);

// =======================================================

module.exports = router;
