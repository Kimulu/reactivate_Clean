const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("../models/User");

// Utility function to generate JWT
const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    // 💡 FIX: Set expiration to 1 day (or your desired duration) to prevent quick logouts
    expiresIn: "1d",
  });
};

// @route POST /api/signup
// @desc Register a new user
exports.signup = async (req, res) => {
  const { username, password } = req.body;

  try {
    let user = await User.findOne({ username });
    if (user) {
      return res.status(400).json({ message: "User already exists" });
    }

    user = await User.create({
      username,
      password,
    });

    const token = signToken(user._id);

    // Send the token and user info
    res.status(201).json({
      token,
      user: {
        id: user._id,
        username: user.username,
      },
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error during signup");
  }
};

// @route POST /api/login
// @desc Authenticate user & get token
exports.login = async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ username }).select("+password");

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Compare submitted password with the hashed password in the database
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = signToken(user._id);

    // Send the token and user info
    res.json({
      token,
      user: {
        id: user._id,
        username: user.username,
      },
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error during login");
  }
};
