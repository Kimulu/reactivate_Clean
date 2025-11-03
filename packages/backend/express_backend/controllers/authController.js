// controllers/authController.js

const jwt = require("jsonwebtoken");
const bcrypt = "bcryptjs";
const User = require("../models/User");

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "1d",
  });
};

// @route POST /api/signup
// @desc Register a new user
// ✅ This function is already correct, no changes needed.
exports.signup = async (req, res) => {
  const { username, email, password } = req.body;
  try {
    let existingUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existingUser) {
      if (existingUser.username === username) {
        return res.status(400).json({ message: "Username already exists" });
      }
      if (existingUser.email === email) {
        return res.status(400).json({ message: "Email already registered" });
      }
    }
    const newUser = await User.create({ username, email, password });
    const token = signToken(newUser._id);
    res.status(201).json({
      token,
      user: {
        id: newUser._id,
        username: newUser.username,
        email: newUser.email,
        totalPoints: newUser.totalPoints,
      },
    });
  } catch (err) {
    console.error(err.message);
    if (err.name === "ValidationError") {
      const messages = Object.values(err.errors).map((val) => val.message);
      return res.status(400).json({ message: messages.join(", ") });
    }
    res.status(500).send("Server error during signup");
  }
};

// @route POST /api/login
// @desc Authenticate user & get token
exports.login = async (req, res) => {
  // The frontend might send a username or an email in the 'username' field
  const { username: identifier, password } = req.body;

  try {
    // ✅ FIX: Allow login with either username or email.
    // The 'identifier' can be matched against either field.
    const user = await User.findOne({
      $or: [{ email: identifier }, { username: identifier }],
    }).select("+password"); // Select the password which is normally hidden

    if (!user) {
      // Use a generic error message for security
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // The comparePassword method is defined on your UserSchema
    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = signToken(user._id);

    res.json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        totalPoints: user.totalPoints,
        isTester: user.isTester, // Good to include this
      },
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error during login");
  }
};
