// routes/auth.js - Defines the API routes for user authentication

const express = require("express");
const router = express.Router();
const { signup, login } = require("../controllers/authController");

// @route POST /api/signup
// @desc Register a new user
// @access Public
router.post("/signup", signup);

// @route POST /api/login
// @desc Authenticate a user and get a token
// @access Public
router.post("/login", login);

module.exports = router;
