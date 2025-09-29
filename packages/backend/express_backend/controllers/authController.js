// controllers/authController.js - Handles the authentication logic for user signup and login

const jwt = require("jsonwebtoken");
const User = require("../models/User");

const createToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "1d",
  });
};

exports.signup = async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await User.create({ username, password });
    const token = createToken(user._id);
    res.status(201).json({ user, token });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.login = async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await User.findOne({ username });
    if (!user) {
      throw new Error("Incorrect username");
    }

    const match = await user.comparePassword(password);
    if (!match) {
      throw new Error("Incorrect password");
    }

    const token = createToken(user._id);
    res.status(200).json({ user, token });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
