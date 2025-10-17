// routes/userRoutes.js

const express = require("express");
const User = require("../models/User");
const { protect } = require("../middleware/authMiddleware");
const router = express.Router();
const userController = require("../controllers/userController");

// @route GET /api/users/:id
// @desc Get user by ID (without password)
// @access Private

router.get("/leaderboard", protect, userController.getLeaderboard);

router.get("/:id", protect, async (req, res) => {
  try {
    if (req.user._id.toString() !== req.params.id) {
      return res
        .status(403)
        .json({ msg: "Not authorized to view this profile" });
    }
    const user = await User.findById(req.params.id).select("-password");
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }
    res.json(user);
  } catch (err) {
    console.error("Error fetching user:", err.message);
    res.status(500).json({ msg: "Server error" });
  }
});

module.exports = router;
