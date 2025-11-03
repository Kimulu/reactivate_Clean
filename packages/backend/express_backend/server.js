const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const authRouter = require("./routes/auth");
const userRoutes = require("./routes/userRoutes");
const challengeRoutes = require("./routes/challengeRoutes");
const communityRoutes = require("./routes/communityRoutes");
const runnerRoutes = require("./routes/runnerRoutes");
const feedbackRoutes = require("./routes/feedbackRoutes");
const testerAuthRoutes = require("./routes/testerAuthRoutes");

console.log("✅✅✅ --- server.js file loaded successfully! --- ✅✅✅");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cors());

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("MongoDB connected successfully!");
  } catch (err) {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  }
};

connectDB();

// ===============================================
// === CORRECTED ROUTE ORDER ===
// ===============================================

// 1. Specific API routes
app.use("/api/auth", authRouter); // Changed from "/api" to be more specific
app.use("/api/users", userRoutes);
app.use("/api/challenges", challengeRoutes);
app.use("/api/community", communityRoutes);
app.use("/api/runner", runnerRoutes); // Changed from "/" to "/api/runner"
app.use("/api/feedback", feedbackRoutes);
app.use("/api/auth", testerAuthRoutes);

// 2. Simple "Heartbeat" route for the homepage
app.get("/", (req, res) => {
  res.status(200).send("<h1>Server is alive and running the LATEST code!</h1>");
});

// ===============================================

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
