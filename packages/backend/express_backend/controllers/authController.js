const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("../models/User"); // 💡 Import User model (already there)

// Utility function to generate JWT
const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "1d",
  });
};

// @route POST /api/signup
// @desc Register a new user
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

    const newUser = await User.create({
      username,
      email,
      password,
      totalPoints: 0, // 💡 NEW: Explicitly set initial points (default is 0 anyway)
    });

    const token = signToken(newUser._id);

    res.status(201).json({
      token,
      user: {
        id: newUser._id,
        username: newUser.username,
        email: newUser.email,
        totalPoints: newUser.totalPoints, // 💡 NEW: Include totalPoints in response
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
  const { username, password } = req.body;

  try {
    // 💡 MODIFIED: Select +totalPoints in addition to +password
    const user = await User.findOne({ username }).select(
      "+password +email +totalPoints"
    );

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

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
        totalPoints: user.totalPoints, // 💡 NEW: Include totalPoints in response
      },
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error during login");
  }
};
