// controllers/testerAuthController.js

const User = require("../models/User");
const jwt = require("jsonwebtoken");

exports.signupTesterController = async (req, res) => {
  try {
    const {
      username,
      email,
      password, // 👈 We receive the plain-text password
      experienceLevel,
      favoriteStack,
      challengesSolved,
      portfolio,
      github,
      linkedin,
      learningGoals,
    } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already exists" });
    }

    // ✅ FIX: Pass the plain-text password directly.
    // The pre-save hook in your User model will handle the hashing.
    const user = await User.create({
      username,
      email,
      password, // Pass the plain text password here
      isTester: true,
      experienceLevel,
      favoriteStack,
      challengesSolved,
      portfolio,
      github,
      linkedin,
      learningGoals,
    });

    const token = jwt.sign(
      { id: user._id, isTester: user.isTester },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(201).json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        totalPoints: user.totalPoints || 0,
        isTester: user.isTester,
      },
    });
  } catch (err) {
    console.error("Tester signup error:", err);
    // Provide a more informative error message if it's a validation error
    if (err.name === "ValidationError") {
      return res.status(400).json({ message: err.message });
    }
    res.status(500).json({ message: "Server error during tester signup" });
  }
};
