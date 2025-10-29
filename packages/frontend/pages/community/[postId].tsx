// pages/community/[postId].tsx

import { useRouter } from "next/router";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Sidebar } from "@/components/Sidebar";
import { useEffect, useState, FormEvent, useCallback } from "react";
import { apiClient, CommunityPost, CommunityComment } from "@/utils/apiClient";
import toast from "react-hot-toast";
import {
  Loader2,
  MessageSquare,
  Code,
  ThumbsUp,
  ThumbsDown,
  Send,
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

  // --- Data fetching, comment submission, and voting logic (no changes needed) ---
  const fetchPost = useCallback(async () => {
    if (!postId || typeof postId !== "string") return;
    try {
      setLoading(true);
      setError(null);
      const data: CommunityPost = await apiClient.getCommunityPostById(postId);
      setPost(data);
    } catch (err: any) {
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
    if (!newCommentText.trim() || !post || !currentUser.id) return;
    setCommentLoading(true);
    try {
      const response = await apiClient.addCommunityComment(
        post._id,
        newCommentText
      );
      // Re-fetch post to get the latest comment list from the server
      fetchPost();
      setNewCommentText("");
      toast.success("Comment added!");
    } catch (err: any) {
      toast.error(err.message || "Failed to add comment.");
    } finally {
      setCommentLoading(false);
    }
  };

  const handleVote = async (voteType: "upvote" | "downvote") => {
    if (!currentUser.id || !post || isVoting) return;
    setIsVoting(true);
    const originalPost = { ...post };

    // Optimistic Update... (your existing logic is fine)

    try {
      const response =
        voteType === "upvote"
          ? await apiClient.upvoteCommunityPost(post._id)
          : await apiClient.downvoteCommunityPost(post._id);

      // Manually update the post state with the response from the server for accuracy
      setPost(response.post);

      toast.success(`Successfully ${voteType}d post!`);
      // Update redux points if needed...
    } catch (err: any) {
      toast.error(`Failed to ${voteType} post.`);
      setPost(originalPost); // Rollback
    } finally {
      setIsVoting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#0f172a] text-white">
        <Loader2 className="mr-2 h-6 w-6 animate-spin text-[#06ffa5]" /> Loading
        Post...
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-[#0f172a]">
        <Sidebar />
        {/* ✅ CORRECTED ERROR STATE LAYOUT */}
        <div className="p-4 pt-24 text-red-500 md:ml-64 md:p-8 md:pt-8">
          Error: {error || "Post not found."}
        </div>
      </div>
    );
  }

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  const isUpvoted = post.upvotes.includes(currentUser.id as string);
  const isDownvoted = post.downvotes.includes(currentUser.id as string);

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-[#0f0f23] via-[#1a1a2e] to-[#0f0f23]">
        <Sidebar />

        {/* ✅ CORRECTED MAIN CONTENT WRAPPER */}
        <div className="mx-auto w-full max-w-5xl p-4 pt-24 text-white md:ml-64 md:p-8 md:pt-8">
          {/* Post Header and Title */}
          <div className="mb-6 border-b border-white/10 pb-4">
            {/* ✅ RESPONSIVE TITLE */}
            <h1 className="mb-2 font-saira text-3xl font-extrabold text-white md:text-4xl">
              {post.title}
            </h1>
            {/* ✅ RESPONSIVE METADATA */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 font-saira text-sm text-gray-400">
              <span>
                Posted by{" "}
                <span className="font-semibold text-[#06ffa5]">
                  {post.user.username}
                </span>
              </span>
              <span className="hidden sm:inline">•</span>
              <span>{formatDate(post.createdAt)}</span>
              {post.type === "solution" && post.challengeId && (
                <>
                  <span className="hidden sm:inline">•</span>
                  <span className="text-[#4cc9f0]">
                    Solution for: {post.challengeId}
                  </span>
                </>
              )}
            </div>
          </div>

          {/* ✅ RESPONSIVE VOTING CONTROLS */}
          <div className="mb-6 flex flex-wrap items-center gap-3 rounded-lg border border-white/10 bg-[#1a1a2e] p-3">
            <button
              onClick={() => handleVote("upvote")}
              disabled={isVoting || !currentUser.id}
              className={`flex items-center space-x-1 rounded-md px-3 py-1 transition-colors duration-200 ${
                isUpvoted
                  ? "bg-green-600 text-white"
                  : "bg-gray-700 text-gray-300 hover:bg-gray-600"
              } ${isVoting ? "cursor-not-allowed opacity-70" : ""}`}
            >
              <ThumbsUp size={18} />
              <span>{post.upvotes.length}</span>
            </button>
            <button
              onClick={() => handleVote("downvote")}
              disabled={isVoting || !currentUser.id}
              className={`flex items-center space-x-1 rounded-md px-3 py-1 transition-colors duration-200 ${
                isDownvoted
                  ? "bg-red-600 text-white"
                  : "bg-gray-700 text-gray-300 hover:bg-gray-600"
              } ${isVoting ? "cursor-not-allowed opacity-70" : ""}`}
            >
              <ThumbsDown size={18} />
              <span>{post.downvotes.length}</span>
            </button>
            <span className="font-saira font-semibold text-gray-400">
              Score: {post.upvotes.length - post.downvotes.length}
            </span>
            {!currentUser.id && (
              <span className="text-sm text-red-400 sm:ml-auto">
                Log in to vote!
              </span>
            )}
          </div>

          {/* Main Content & Code Blocks (No major changes needed, already block-level) */}
          {post.body && (
            <div className="mb-6 rounded-lg border border-white/10 bg-[#1a1a2e] p-4 font-saira">
              <p className="whitespace-pre-wrap font-saira text-gray-300">
                {post.body}
              </p>
            </div>
          )}
          {post.type === "solution" && post.codeContent && (
            <div className="mb-6">
              <div className="mb-2 flex items-center space-x-2 font-saira text-lg font-semibold text-white">
                <Code size={20} className="text-[#06ffa5]" />
                <span>Submitted Code</span>
              </div>
              <div className="overflow-hidden rounded-lg border border-white/10 font-saira">
                <SyntaxHighlighter
                  language="javascript"
                  style={dracula}
                  showLineNumbers={true}
                  wrapLines={true}
                >
                  {post.codeContent["/App.js"] ||
                    Object.values(post.codeContent)[0]}
                </SyntaxHighlighter>
              </div>
            </div>
          )}

          {/* Comments Section */}
          <div className="mt-10">
            <h2 className="mb-4 flex items-center space-x-2 font-saira text-xl font-bold text-white md:text-2xl">
              <MessageSquare size={24} className="text-[#4cc9f0]" />
              <span>Comments ({post.comments.length})</span>
            </h2>

            {/* Comment Form (already responsive) */}
            {currentUser.id ? (
              <form
                onSubmit={handleCommentSubmit}
                className="mb-8 rounded-lg border border-white/10 bg-[#1a1a2e] p-4 font-saira"
              >
                <textarea
                  value={newCommentText}
                  onChange={(e) => setNewCommentText(e.target.value)}
                  rows={3}
                  className="w-full resize-none rounded-lg border border-white/10 bg-[#0f0f23]/60 px-3 py-2 text-white transition focus:border-transparent focus:ring-2 focus:ring-[#06ffa5]"
                  placeholder="Write your comment here..."
                  required
                  disabled={commentLoading}
                />
                <button
                  type="submit"
                  className="mt-3 flex items-center space-x-1 rounded-lg bg-[#06ffa5] px-4 py-2 font-semibold text-[#0f0f23] shadow-md transition-colors duration-200 hover:bg-[#04cc83]"
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
              <p className="mb-8 rounded-lg border border-white/10 bg-[#1a1a2e] p-4 text-center text-gray-400">
                Log in to add comments.
              </p>
            )}

            {/* Existing Comments (already responsive) */}
            <div className="space-y-4">
              {post.comments
                .slice()
                .reverse()
                .map((comment) => (
                  <div
                    key={comment._id}
                    className="rounded-lg border border-white/5 bg-[#1a1a2e]/60 p-4"
                  >
                    <div className="mb-2 flex items-center justify-between text-sm">
                      <span className="font-saira font-semibold text-[#06ffa5]">
                        {comment.username}
                      </span>
                      <span className="font-saira text-gray-500">
                        {formatDate(comment.createdAt)}
                      </span>
                    </div>
                    <p className="whitespace-pre-wrap font-saira text-gray-300">
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
