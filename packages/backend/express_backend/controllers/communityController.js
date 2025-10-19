// controllers/communityController.js

const CommunityPost = require("../models/CommunityPost");
const User = require("../models/User"); // For populating user info

// @route POST /api/community/posts
// @desc Create a new community post (solution or discussion)
// @access Private
exports.createPost = async (req, res) => {
  const { challenge, challengeId, title, codeContent, body, type, tags } =
    req.body;
  const userId = req.user._id; // From auth middleware

  if (!title || !type) {
    return res
      .status(400)
      .json({ message: "Title and type are required for a post." });
  }
  if (type === "solution" && (!challenge || !challengeId || !codeContent)) {
    return res
      .status(400)
      .json({
        message:
          "Solution posts require challenge, challengeId, and codeContent.",
      });
  }

  try {
    const newPost = await CommunityPost.create({
      user: userId,
      challenge: challenge,
      challengeId: challengeId,
      title,
      codeContent,
      body,
      type,
      tags: tags || [],
    });

    // Populate user details for the response
    const populatedPost = await newPost.populate(
      "user",
      "username totalPoints"
    ); // Select username and totalPoints from User

    res
      .status(201)
      .json({ message: "Post created successfully!", post: populatedPost });
  } catch (err) {
    console.error("Error creating post:", err.message);
    res.status(500).json({ message: "Server error creating post." });
  }
};

// @route GET /api/community/posts
// @desc Get all community posts (with pagination/filtering later)
// @access Public (or Private if desired)
exports.getPosts = async (req, res) => {
  try {
    const posts = await CommunityPost.find({})
      .populate("user", "username totalPoints") // Populate user details
      .sort({ createdAt: -1 }); // Latest posts first

    res.status(200).json(posts);
  } catch (err) {
    console.error("Error fetching community posts:", err.message);
    res.status(500).json({ message: "Server error fetching posts." });
  }
};

// @route GET /api/community/posts/:postId
// @desc Get a single community post by ID
// @access Public (or Private if desired)
exports.getPostById = async (req, res) => {
  try {
    const post = await CommunityPost.findById(req.params.postId)
      .populate("user", "username totalPoints") // Populate original poster's details
      .populate("comments.user", "username totalPoints"); // Populate comment authors' details

    if (!post) {
      return res.status(404).json({ message: "Post not found." });
    }

    res.status(200).json(post);
  } catch (err) {
    console.error("Error fetching post by ID:", err.message);
    res.status(500).json({ message: "Server error fetching post." });
  }
};

// @route POST /api/community/posts/:postId/comments
// @desc Add a comment to a post
// @access Private
exports.addComment = async (req, res) => {
  const { text } = req.body;
  const postId = req.params.postId;
  const userId = req.user._id;
  const username = req.user.username; // Get username from req.user (from auth middleware)

  if (!text) {
    return res.status(400).json({ message: "Comment text is required." });
  }

  try {
    const post = await CommunityPost.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found." });
    }

    const newComment = { user: userId, username, text, createdAt: Date.now() };
    post.comments.push(newComment);
    await post.save();

    // To return the newly added comment with its _id
    const addedComment = post.comments[post.comments.length - 1];

    res
      .status(201)
      .json({ message: "Comment added successfully!", comment: addedComment });
  } catch (err) {
    console.error("Error adding comment:", err.message);
    res.status(500).json({ message: "Server error adding comment." });
  }
};

// 💡 (Optional) @route POST /api/community/posts/:postId/upvote
// @desc Upvote a post
// @access Private
exports.upvotePost = async (req, res) => {
  const postId = req.params.postId;
  const userId = req.user._id;

  try {
    const post = await CommunityPost.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found." });
    }

    // Remove from downvotes if present
    post.downvotes = post.downvotes.filter(
      (downvoteUserId) => downvoteUserId.toString() !== userId.toString()
    );

    // Add to upvotes if not already present
    if (!post.upvotes.includes(userId)) {
      post.upvotes.push(userId);
    } else {
      // Allow un-upvoting
      post.upvotes = post.upvotes.filter(
        (upvoteUserId) => upvoteUserId.toString() !== userId.toString()
      );
    }
    await post.save();
    res
      .status(200)
      .json({
        message: "Post upvoted/unupvoted successfully!",
        upvotes: post.upvotes.length,
        downvotes: post.downvotes.length,
      });
  } catch (err) {
    console.error("Error upvoting post:", err.message);
    res.status(500).json({ message: "Server error upvoting post." });
  }
};

// 💡 (Optional) @route POST /api/community/posts/:postId/downvote
// @desc Downvote a post
// @access Private
exports.downvotePost = async (req, res) => {
  const postId = req.params.postId;
  const userId = req.user._id;

  try {
    const post = await CommunityPost.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found." });
    }

    // Remove from upvotes if present
    post.upvotes = post.upvotes.filter(
      (upvoteUserId) => upvoteUserId.toString() !== userId.toString()
    );

    // Add to downvotes if not already present
    if (!post.downvotes.includes(userId)) {
      post.downvotes.push(userId);
    } else {
      // Allow un-downvoting
      post.downvotes = post.downvotes.filter(
        (downvoteUserId) => downvoteUserId.toString() !== userId.toString()
      );
    }
    await post.save();
    res
      .status(200)
      .json({
        message: "Post downvoted/undownvoted successfully!",
        upvotes: post.upvotes.length,
        downvotes: post.downvotes.length,
      });
  } catch (err) {
    console.error("Error downvoting post:", err.message);
    res.status(500).json({ message: "Server error downvoting post." });
  }
};
