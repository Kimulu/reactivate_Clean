const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const authRouter = require("./routes/auth"); // Assuming this is for your login/signup
const userRoutes = require("./routes/userRoutes"); // 💡 Import user routes
// 💡 NEW: Import challenge routes
const challengeRoutes = require("./routes/challengeRoutes"); // Assuming your challengeRoutes.js is in the ./routes folder

// Load environment variables from .env file
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json()); // To parse JSON request bodies
app.use(cors()); // Allow cross-origin requests

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("MongoDB connected successfully!");
  } catch (err) {
    console.error("MongoDB connection error:", err);
    process.exit(1); // Exit process with failure
  }
};

connectDB();

// Use application routes
app.use("/api", authRouter); // Your authentication routes (e.g., /api/login, /api/signup)
app.use("/api/users", userRoutes); // Your protected user routes (e.g., /api/users/:id)
// 💡 NEW: Mount the challenge routes
app.use("/api/challenges", challengeRoutes); // Your challenge API routes (e.g., /api/challenges)

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
