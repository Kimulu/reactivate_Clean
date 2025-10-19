// seedCommunityPosts.js

const mongoose = require("mongoose");
const dotenv = require("dotenv");
const CommunityPost = require("./models/CommunityPost"); // Adjust path to your model
const User = require("./models/User"); // Adjust path to your model
const Challenge = require("./models/Challenge"); // Adjust path to your model

dotenv.config(); // Load environment variables

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("MongoDB connected successfully for seeding community posts!");
  } catch (err) {
    console.error(
      "MongoDB connection error during community post seeding:",
      err
    );
    process.exit(1);
  }
};

const dummyPostTitles = [
  "My solution for Fragments Challenge!",
  "Help with Counter Challenge - stuck!",
  "Styled Button: A simple approach",
  "React Context API vs Redux for state management",
  "Tips for debugging Sandpack tests?",
  "Best practices for React components",
  "How to use useEffect properly?",
  "Fragment Challenge walkthrough",
];

const dummyPostBodies = [
  "This is my passing code for the challenge. Let me know what you think!",
  "I'm constantly getting an error on line 15. Any ideas what could be wrong?",
  "Just a quick thought on how to style buttons efficiently using Tailwind.",
  "What are your opinions on these two for larger applications?",
  "My Sandpack tests are sometimes freezing. Any known workarounds?",
  "Sharing some insights I've gathered over the years in React development.",
  "I always struggle with dependencies arrays. Can someone explain it simply?",
  "Detailed explanation of the Fragments Challenge solution.",
];

const dummyTags = [
  "react",
  "javascript",
  "tailwind",
  "frontend",
  "testing",
  "state",
];

const seedCommunityPosts = async () => {
  await connectDB();

  try {
    console.log("Clearing existing community posts...");
    await CommunityPost.deleteMany({});
    console.log("Existing community posts cleared from DB.");

    // Fetch existing users and challenges
    const users = await User.find({});
    const challenges = await Challenge.find({});

    if (users.length === 0) {
      console.warn("No users found. Creating a dummy user for posts...");
      const dummyUser = await User.create({
        username: "dummyuser",
        email: "dummy@example.com",
        password: "password123", // Mongoose pre-save hook will hash this
        totalPoints: 50,
      });
      users.push(dummyUser);
      console.log("Dummy user created.");
    }

    if (challenges.length === 0) {
      console.warn("No challenges found. Please run seedChallenges.js first.");
      mongoose.disconnect();
      return;
    }

    const postsToInsert = [];
    const numberOfPosts = 10; // You can adjust how many posts you want

    for (let i = 0; i < numberOfPosts; i++) {
      const randomUser = users[Math.floor(Math.random() * users.length)];
      const randomChallenge =
        challenges[Math.floor(Math.random() * challenges.length)];
      const isSolutionPost = Math.random() > 0.5; // Roughly half will be solutions

      const postType = isSolutionPost ? "solution" : "discussion";
      const postTitle =
        dummyPostTitles[Math.floor(Math.random() * dummyPostTitles.length)];
      const postBody =
        dummyPostBodies[Math.floor(Math.random() * dummyPostBodies.length)];
      const postTags = Array.from(
        { length: Math.floor(Math.random() * 3) + 1 },
        () => dummyTags[Math.floor(Math.random() * dummyTags.length)]
      ); // 1-3 random tags

      const post = {
        user: randomUser._id,
        title: postTitle,
        body: postBody,
        type: postType,
        tags: [...new Set(postTags)], // Ensure unique tags
        createdAt: new Date(Date.now() - i * 3600000), // Spread out creation times
      };

      if (isSolutionPost) {
        post.challenge = randomChallenge._id;
        post.challengeId = randomChallenge.id;
        // For actual solution content, you'd pull from `randomChallenge.files`
        // For this dummy seed, we'll just use a placeholder or part of the challenge's file structure
        post.codeContent = {
          "/App.js": `// Dummy solution for ${randomChallenge.title}\nconsole.log('User solution for ${randomUser.username}');\n// (Actual code would be here)`,
        };
      }

      // Add a few dummy comments
      const numComments = Math.floor(Math.random() * 3); // 0-2 comments
      for (let j = 0; j < numComments; j++) {
        const commentUser = users[Math.floor(Math.random() * users.length)];
        if (commentUser) {
          post.comments = post.comments || [];
          post.comments.push({
            user: commentUser._id,
            username: commentUser.username,
            text: `Great post! [Comment ${j + 1} by ${commentUser.username}]`,
            createdAt: new Date(post.createdAt.getTime() + j * 60000),
          });
        }
      }

      postsToInsert.push(post);
    }

    await CommunityPost.insertMany(postsToInsert);
    console.log(
      `${numberOfPosts} community posts successfully seeded into DB!`
    );
  } catch (error) {
    console.error("Error seeding community posts:", error);
    process.exit(1);
  } finally {
    mongoose.disconnect();
    console.log("MongoDB disconnected.");
  }
};

seedCommunityPosts();
