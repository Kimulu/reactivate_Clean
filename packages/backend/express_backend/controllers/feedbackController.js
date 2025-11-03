// controllers/feedbackController.js
const Feedback = require("../models/Feedback");
/**
@desc Create a new feedback entry
@route POST /api/feedback
@access Private
*/
exports.createFeedback = async (req, res) => {
  // Destructure message and rating from the request body sent by the frontend.
  const { message, rating } = req.body;
  try {
    // Create the feedback document in the database.
    // req.user._id comes from the 'protect' middleware after verifying the JWT token.
    const feedback = await Feedback.create({
      user: req.user._id,
      message,
      rating,
    });

    // Send a 201 Created status and the new feedback object back to the client.
    res
      .status(201)
      .json({ message: "Feedback submitted successfully!", feedback });
  } catch (err) {
    console.error("Feedback submission error:", err);
    res
      .status(400)
      .json({ message: "Error submitting feedback.", error: err.message });
  }
};
/**
@desc Get all feedback entries (for admin purposes)
@route GET /api/feedback
@access Private (should be restricted to admins in a real app)
*/
exports.getAllFeedback = async (req, res) => {
  try {
    // Find all feedback and populate the 'user' field with their username.
    const feedbacks = await Feedback.find().populate("user", "username email");
    res.status(200).json(feedbacks);
  } catch (err) {
    console.error("Error fetching feedback:", err);
    res.status(500).json({ message: "Failed to fetch feedback." });
  }
};
