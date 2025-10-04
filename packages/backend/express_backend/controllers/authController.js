const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("../models/User");

// Utility function to generate JWT
const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "1d",
  });
};

// @route POST /api/signup
// @desc Register a new user
exports.signup = async (req, res) => {
  // 💡 FIX 1: Destructure email from req.body as well
  const { username, email, password } = req.body;

  try {
    // 💡 FIX 3: Check if username OR email already exists
    let existingUser = await User.findOne({ $or: [{ username }, { email }] });

    if (existingUser) {
      if (existingUser.username === username) {
        return res.status(400).json({ message: "Username already exists" });
      }
      if (existingUser.email === email) {
        return res.status(400).json({ message: "Email already registered" });
      }
    }

    // 💡 FIX 2: Pass email to User.create
    const newUser = await User.create({
      username,
      email, // Now passing the email!
      password,
    });

    const token = signToken(newUser._id);

    // Send the token and new user info (including email)
    res.status(201).json({
      token,
      user: {
        id: newUser._id,
        username: newUser.username,
        email: newUser.email, // 💡 FIX 4: Include email in the signup response
      },
    });
  } catch (err) {
    console.error(err.message);
    // Mongoose validation errors often have `err.errors` property
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
    // 💡 FIX 5: Select password and email (if email has select: false in model)
    // If your User model has `email: { select: false }`, then uncomment `+email`.
    // Otherwise, just `+password` is fine.
    const user = await User.findOne({ username }).select("+password +email");

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Compare submitted password with the hashed password in the database
    // user.password is now accessible because we explicitly selected it
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = signToken(user._id);

    // Send the token and user info (including email)
    res.json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email, // 💡 FIX 4: Include email in the login response
      },
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error during login");
  }
};
