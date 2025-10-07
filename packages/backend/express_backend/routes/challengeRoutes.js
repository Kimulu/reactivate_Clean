// routes/challengeRoutes.js

const express = require("express");
const router = express.Router();
const challengeController = require("../controllers/challengeController");
// 💡 FIX: Import 'protect' specifically from the middleware module
const { protect } = require("../middleware/authMiddleware"); // <--- CHANGE THIS LINE

// 💡 FIX: Place specific routes above general routes

// 1. More Specific Routes (e.g., /completed, /:challengeId/submit)
router.get("/completed", protect, challengeController.getCompletedChallenges); // <--- MOVE THIS UP
router.post(
  "/:challengeId/submit",
  protect,
  challengeController.submitChallenge
);

// 2. General Routes (e.g., / or /:id)
router.get("/:id", challengeController.getChallengeById);
router.get("/", challengeController.getChallenges);

module.exports = router;
