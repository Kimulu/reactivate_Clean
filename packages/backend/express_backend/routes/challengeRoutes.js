// routes/challengeRoutes.js
const express = require("express");
const router = express.Router();
const challengeController = require("../controllers/challengeController");
const { protect } = require("../middleware/authMiddleware");

// 🧩 Specific routes first
router.get("/completed", protect, challengeController.getCompletedChallenges);
router.post(
  "/:challengeId/submit",
  protect,
  challengeController.submitChallenge
);

// 🧠 Clean route for test running
router.post("/run-tests", protect, challengeController.runChallengeTests);

// 🧱 General routes last
router.get("/:id", challengeController.getChallengeById);
router.get("/", challengeController.getChallenges);

module.exports = router;
