// routes/feedbackRoutes.js
const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const {
  createFeedback,
  getAllFeedback,
} = require("../controllers/feedbackController");

// When a POST request is made to /api/feedback, it will first run the 'protect'
// middleware. If the user is authenticated, it will then run 'createFeedback'.
router.route("/").post(protect, createFeedback).get(protect, getAllFeedback);

module.exports = router;
