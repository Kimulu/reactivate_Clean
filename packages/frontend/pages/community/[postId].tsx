// pages/community/[postId].tsx

import { useRouter } from "next/router";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Sidebar } from "@/components/Sidebar";
import { useEffect, useState, FormEvent, useCallback } from "react";
import { apiClient, CommunityPost, CommunityComment } from "@/utils/apiClient";
import toast from "react-hot-toast";
import {
  Loader2,
  Trophy,
  MessageSquare,
  Tag,
  Send,
  Code,
  Zap,
  ThumbsUp,
  ThumbsDown,
} from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/store";
import { updateUserTotalPoints } from "@/store/userSlice";
import SyntaxHighlighter from "react-syntax-highlighter";
import { dracula } from "react-syntax-highlighter/dist/cjs/styles/hljs";

export default function PostDetailPage() {
  const router = useRouter();
  const { postId } = router.query;
  const currentUser = useSelector((state: RootState) => state.user);
  const dispatch = useDispatch();

  const [post, setPost] = useState<CommunityPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newCommentText, setNewCommentText] = useState("");
  const [commentLoading, setCommentLoading] = useState(false);
  const [isVoting, setIsVoting] = useState(false);

  const fetchPost = useCallback(async () => {
    if (!postId || typeof postId !== "string") return;
    try {
      setLoading(true);
      setError(null);
      const data: CommunityPost = await apiClient.getCommunityPostById(postId);
      setPost(data);
    } catch (err: any) {
      console.error("Error fetching post:", err);
      setError(err.message || "Failed to load post.");
      toast.error(err.message || "Failed to load post.");
    } finally {
      setLoading(false);
    }
  }, [postId]);

  useEffect(() => {
    fetchPost();
  }, [fetchPost]);

  const handleCommentSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!newCommentText.trim()) return;
    setCommentLoading(true);

    try {
      if (!post) throw new Error("Post data missing.");
      if (!currentUser.id || !currentUser.username)
        throw new Error("User not logged in.");

      const response = await apiClient.addCommunityComment(
        post._id,
        newCommentText
      );

      const newComment: CommunityComment = {
        ...response.comment,
        user: currentUser.id,
        username: currentUser.username,
        text: newCommentText,
      };

      setPost((prevPost) => {
        if (!prevPost) return null;
        return {
          ...prevPost,
          comments: [...prevPost.comments, newComment],
        };
      });

      setNewCommentText("");
      toast.success("Comment added!");
    } catch (err: any) {
      console.error("Error submitting comment:", err);
      toast.error(err.message || "Failed to add comment.");
    } finally {
      setCommentLoading(false);
    }
  };

  const handleVote = async (voteType: "upvote" | "downvote") => {
    if (!currentUser.id || !post || isVoting) return;

    setIsVoting(true);
    const originalPost = { ...post };

    // Optimistic Update
    setPost((prevPost) => {
      if (!prevPost) return null;
      const userIdString = currentUser.id as string;

      let newUpvotes = [...prevPost.upvotes];
      let newDownvotes = [...prevPost.downvotes];

      if (voteType === "upvote") {
        if (newUpvotes.includes(userIdString)) {
          newUpvotes = newUpvotes.filter((id) => id !== userIdString);
        } else {
          newUpvotes.push(userIdString);
          newDownvotes = newDownvotes.filter((id) => id !== userIdString);
        }
      } else {
        // voteType === 'downvote'
        if (newDownvotes.includes(userIdString)) {
          newDownvotes = newDownvotes.filter((id) => id !== userIdString);
        } else {
          newDownvotes.push(userIdString);
          newUpvotes = newUpvotes.filter((id) => id !== userIdString);
        }
      }

      return {
        ...prevPost,
        upvotes: newUpvotes,
        downvotes: newDownvotes,
      };
    });

    try {
      let response;
      if (voteType === "upvote") {
        response = await apiClient.upvoteCommunityPost(post._id);
      } else {
        response = await apiClient.downvoteCommunityPost(post._id);
      }
      toast.success(`Successfully ${voteType}d post!`);

      // 💡 MODIFIED: Update Redux only if the current user IS the post creator (their points changed)
      // If the backend returns `postCreatorTotalPoints`, we use it.
      if (
        response.postCreatorTotalPoints !== undefined &&
        post.user._id === currentUser.id
      ) {
        dispatch(updateUserTotalPoints(response.postCreatorTotalPoints));
        console.log(
          `Redux: Current user's (post creator) total points updated to ${response.postCreatorTotalPoints}.`
        );
      }
    } catch (err: any) {
      console.error(`Error ${voteType}ing post:`, err);
      toast.error(`Failed to ${voteType} post. Rolling back...`);
      setPost(originalPost); // Rollback to original state on error
    } finally {
      setIsVoting(false);
    }
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#0f172a] text-white">
        <Loader2 className="animate-spin text-[#06ffa5] w-6 h-6 mr-2" /> Loading
        Post...
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-[#0f172a] p-8 text-red-500">
        <Sidebar />
        <div className="ml-64">Error: {error || "Post not found."}</div>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const isUpvoted = post.upvotes.includes(currentUser.id as string);
  const isDownvoted = post.downvotes.includes(currentUser.id as string);

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-[#0f0f23] via-[#1a1a2e] to-[#0f0f23]">
        <Sidebar />

        <div className="ml-64 p-8 text-white max-w-5xl mx-auto">
          {/* Post Header and Title */}
          <div className="border-b pb-4 border-white/10 mb-6">
            <h1 className="text-4xl font-extrabold font-mono text-white mb-2">
              {post.title}
            </h1>
            <div className="flex items-center space-x-4 text-sm text-gray-400">
              <span>
                Posted by{" "}
                <span className="text-[#06ffa5] font-semibold">
                  {post.user.username}
                </span>
              </span>
              <span>•</span>
              <span>{formatDate(post.createdAt)}</span>
              {post.type === "solution" && post.challengeId && (
                <>
                  <span>•</span>
                  <span className="text-[#4cc9f0]">
                    Solution for: {post.challengeId}
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Voting Controls */}
          <div className="flex items-center space-x-4 mb-6 p-3 bg-[#1a1a2e] rounded-lg border border-white/10">
            <button
              onClick={() => handleVote("upvote")}
              disabled={isVoting || !currentUser.id}
              className={`flex items-center space-x-1 px-3 py-1 rounded-md transition-colors duration-200 ${
                isUpvoted
                  ? "bg-green-600 text-white"
                  : "bg-gray-700 hover:bg-gray-600 text-gray-300"
              } ${isVoting ? "cursor-not-allowed opacity-70" : ""}`}
            >
              <ThumbsUp size={18} />
              <span>{post.upvotes.length}</span>
            </button>
            <button
              onClick={() => handleVote("downvote")}
              disabled={isVoting || !currentUser.id}
              className={`flex items-center space-x-1 px-3 py-1 rounded-md transition-colors duration-200 ${
                isDownvoted
                  ? "bg-red-600 text-white"
                  : "bg-gray-700 hover:bg-gray-600 text-gray-300"
              } ${isVoting ? "cursor-not-allowed opacity-70" : ""}`}
            >
              <ThumbsDown size={18} />
              <span>{post.downvotes.length}</span>
            </button>
            {/* 💡 NEW: Display Calculated Vote Score */}
            <span className="text-gray-400 ml-4 font-semibold">
              Score: {post.upvotes.length - post.downvotes.length}
            </span>
            {!currentUser.id && (
              <span className="text-red-400 text-sm ml-auto">
                Log in to vote!
              </span>
            )}
          </div>

          {/* Main Content (Body/Description) */}
          {post.body && (
            <div className="mb-6 p-4 bg-[#1a1a2e] rounded-lg border border-white/10">
              <p className="text-gray-300 whitespace-pre-wrap">{post.body}</p>
            </div>
          )}

          {/* Code Content (for Solution posts) */}
          {post.type === "solution" && post.codeContent && (
            <div className="mb-6">
              <div className="flex items-center space-x-2 text-lg font-semibold text-white mb-2">
                <Code size={20} className="text-[#06ffa5]" />
                <span>Submitted Code</span>
              </div>
              <div className="rounded-lg overflow-hidden border border-white/10">
                <SyntaxHighlighter
                  language="javascript"
                  style={dracula}
                  showLineNumbers={true}
                  wrapLines={true}
                >
                  {post.codeContent["/App.js"] ||
                    Object.values(post.codeContent)[0]}{" "}
                  {/* Display /App.js or first file */}
                </SyntaxHighlighter>
              </div>
              <p className="text-sm text-gray-500 mt-2">
                Note: This is the file content as submitted by the user.
              </p>
            </div>
          )}

          {/* Comments Section */}
          <div className="mt-10">
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center space-x-2">
              <MessageSquare size={24} className="text-[#4cc9f0]" />
              <span>
                Comments ({post.comments.length}{" "}
                {post.comments.length === 1 ? "Comment" : "Comments"})
              </span>
            </h2>

            {/* Comment Form */}
            {currentUser.id ? (
              <form
                onSubmit={handleCommentSubmit}
                className="mb-8 p-4 bg-[#1a1a2e] rounded-lg border border-white/10"
              >
                <textarea
                  value={newCommentText}
                  onChange={(e) => setNewCommentText(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 bg-[#0f0f23]/60 border border-white/10 rounded-lg text-white focus:ring-2 focus:ring-[#06ffa5] focus:border-transparent transition resize-none"
                  placeholder="Write your comment here..."
                  required
                  disabled={commentLoading}
                />
                <button
                  type="submit"
                  className="mt-3 px-4 py-2 bg-[#06ffa5] text-[#0f0f23] font-semibold rounded-lg hover:bg-[#04cc83] transition-colors duration-200 shadow-md flex items-center space-x-1"
                  disabled={commentLoading || !newCommentText.trim()}
                >
                  {commentLoading ? (
                    <Loader2 size={20} className="animate-spin" />
                  ) : (
                    <Send size={20} />
                  )}
                  <span>
                    {commentLoading ? "Submitting..." : "Add Comment"}
                  </span>
                </button>
              </form>
            ) : (
              <p className="mb-8 p-4 bg-[#1a1a2e] rounded-lg border border-white/10 text-gray-400 text-center">
                Log in to add comments.
              </p>
            )}

            {/* Existing Comments */}
            <div className="space-y-4">
              {post.comments
                .slice()
                .reverse()
                .map((comment) => (
                  <div
                    key={comment._id}
                    className="p-4 bg-[#1a1a2e]/60 rounded-lg border border-white/5"
                  >
                    <div className="flex justify-between items-center text-sm mb-2">
                      <span className="font-semibold text-[#06ffa5]">
                        {comment.username}
                      </span>
                      <span className="text-gray-500">
                        {formatDate(comment.createdAt)}
                      </span>
                    </div>
                    <p className="text-gray-300 whitespace-pre-wrap">
                      {comment.text}
                    </p>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
