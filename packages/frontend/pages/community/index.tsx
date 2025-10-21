// pages/community/index.tsx

import { Sidebar } from "@/components/Sidebar";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useEffect, useState } from "react";
import {
  apiClient,
  CommunityPost,
  Challenge,
  CompletedChallengeInfo,
} from "@/utils/apiClient";
import toast from "react-hot-toast";
import {
  Loader2,
  Trophy,
  MessageSquare,
  Tag,
  Plus,
  ThumbsUp,
  ThumbsDown,
} from "lucide-react"; // 💡 NEW: ThumbsUp/Down icons
import { CreatePostModal } from "@/components/CreatePostModal";
import { useSelector } from "react-redux";
import { RootState } from "@/store";

export default function CommunityPage() {
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // 💡 NEW: Access current user to highlight their posts (optional) or check vote status
  const currentUser = useSelector((state: RootState) => state.user);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      setError(null);
      const data: CommunityPost[] = await apiClient.getCommunityPosts();
      setPosts(data); // Data is already sorted by voteScore from backend
    } catch (err: any) {
      console.error("Error fetching community posts:", err);
      setError(err.message || "Failed to load community posts.");
      toast.error(err.message || "Failed to load community posts.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [currentUser.id]); // 💡 MODIFIED: Re-fetch if currentUser.id changes (e.g., login/logout)

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-[#0f0f23] via-[#1a1a2e] to-[#0f0f23]">
        <Sidebar />

        <div className="ml-64 p-8 text-white">
          <div className="flex justify-between items-center mb-8 border-b pb-4 border-white/10">
            <h1 className="text-4xl font-extrabold font-mono text-[#06ffa5]">
              Community Hub
            </h1>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-[#06ffa5] text-[#0f0f23] font-semibold rounded-lg hover:bg-[#04cc83] transition-colors duration-200 shadow-md"
            >
              <Plus size={20} />
              <span>Create New Post</span>
            </button>
          </div>

          {loading && (
            <div className="text-center text-white py-8 flex justify-center items-center">
              <Loader2 className="animate-spin text-[#06ffa5] w-6 h-6 mr-2" />{" "}
              Loading Community Posts...
            </div>
          )}

          {error && (
            <div className="text-center text-red-500 py-8">Error: {error}</div>
          )}

          {!loading && !error && posts.length === 0 && (
            <div className="text-center text-gray-400 py-8">
              No community posts yet. Be the first to share!
            </div>
          )}

          {!loading && !error && posts.length > 0 && (
            <div className="space-y-6">
              {posts.map((post) => (
                <a
                  href={`/community/${post._id}`}
                  key={post._id}
                  className="block"
                >
                  <div className="bg-[#1a1a2e]/80 p-6 rounded-xl shadow-2xl border border-white/10 hover:border-[#4cc9f0]/50 transition-all duration-200 cursor-pointer">
                    <h2 className="text-2xl font-bold text-white mb-2 hover:text-[#4cc9f0] transition-colors">
                      {post.title}
                    </h2>
                    <p className="text-white/70 text-sm mb-3">
                      Posted by{" "}
                      <span className="text-[#06ffa5] font-semibold">
                        {post.user.username}
                      </span>{" "}
                      on {formatDate(post.createdAt)}
                    </p>

                    {post.body && (
                      <p className="text-gray-300 mb-4 line-clamp-3">
                        {post.body}
                      </p>
                    )}

                    {post.type === "solution" && post.challengeId && (
                      <p className="text-white/80 text-sm mb-4">
                        Solution for Challenge:{" "}
                        <span className="text-[#4cc9f0] font-semibold">
                          {post.challengeId}
                        </span>
                      </p>
                    )}

                    <div className="flex items-center space-x-4 text-gray-400 text-sm mt-4 border-t border-white/5 pt-4">
                      {/* 💡 NEW: Display Upvote/Downvote counts and total score */}
                      <div className="flex items-center space-x-1">
                        <ThumbsUp size={16} className="text-green-500" />
                        <span>{post.upvotes.length}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <ThumbsDown size={16} className="text-red-500" />
                        <span>{post.downvotes.length}</span>
                      </div>
                      <div className="flex items-center space-x-1 ml-auto font-semibold text-white/70">
                        <Trophy size={16} className="text-yellow-400" />
                        <span>{post.user.totalPoints} Points</span>{" "}
                        {/* Display poster's total points */}
                      </div>
                      <div className="flex items-center space-x-1">
                        <MessageSquare size={16} />
                        <span>
                          {post.comments.length}{" "}
                          {post.comments.length === 1 ? "Comment" : "Comments"}
                        </span>
                      </div>
                      {post.tags && post.tags.length > 0 && (
                        <div className="flex items-center space-x-1">
                          <Tag size={16} />
                          <span className="italic">{post.tags.join(", ")}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </a>
              ))}
            </div>
          )}
        </div>
      </div>

      <CreatePostModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onPostCreated={fetchPosts}
      />
    </ProtectedRoute>
  );
}
