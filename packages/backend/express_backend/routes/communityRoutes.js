const express = require("express");
const router = express.Router();
const communityController = require("../controllers/communityController");
const { protect } = require("../middleware/authMiddleware"); // ✅ FIX HERE

router.use(protect); // Apply middleware to all routes below

router.get("/posts", communityController.getPosts);
router.get("/posts/:postId", communityController.getPostById);
router.post("/posts", communityController.createPost);
router.post("/posts/:postId/comments", communityController.addComment);
router.post("/posts/:postId/upvote", communityController.upvotePost);
router.post("/posts/:postId/downvote", communityController.downvotePost);

module.exports = router;
