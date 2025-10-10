// seedChallenges.js

const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Challenge = require("./models/Challenge"); // Adjust path to your Challenge model
const { challenges: challenges } = require("./models/seedChallenges.ts"); // Adjust path to your local challenges.ts/js file

dotenv.config(); // Load environment variables

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("MongoDB connected successfully for seeding!");
  } catch (err) {
    console.error("MongoDB connection error during seeding:", err);
    process.exit(1);
  }
};

const seedChallenges = async () => {
  await connectDB();

  try {
    // 1. Clear existing challenges (useful for re-seeding during development)
    await Challenge.deleteMany({});
    console.log("Existing challenges cleared from DB.");

    // 2. Insert new challenges from your local data file
    // Ensure the data from localChallenges matches your Mongoose model structure.
    // Mongoose will automatically handle the conversion of plain JS objects to Mongoose documents.
    await Challenge.insertMany(challenges);
    console.log("Challenges successfully seeded into DB!");
  } catch (error) {
    console.error("Error seeding challenges:", error);
    process.exit(1);
  } finally {
    // 3. Disconnect from MongoDB
    mongoose.disconnect();
    console.log("MongoDB disconnected.");
  }
};

seedChallenges();
