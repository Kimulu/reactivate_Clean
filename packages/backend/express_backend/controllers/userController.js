// controllers/userController.js

const User = require("../models/User");

exports.getLeaderboard = async (req, res) => {
  console.log("Backend: /api/users/leaderboard route hit."); // 💡 NEW LOG
  console.log("Backend: req.user from protect middleware:", req.user); // 💡 NEW LOG (should show logged-in user if token is valid)

  try {
    const leaderboard = await User.find({})
      .sort({ totalPoints: -1 })
      .select("username totalPoints -_id")
      .limit(100);

    console.log(
      "Backend: Leaderboard data fetched from DB:",
      leaderboard.length,
      "users."
    ); // 💡 NEW LOG
    res.status(200).json(leaderboard);
  } catch (err) {
    console.error("Backend Error fetching leaderboard:", err.message); // 💡 MODIFIED LOG
    res.status(500).json({ message: "Server error fetching leaderboard" });
  }
};
