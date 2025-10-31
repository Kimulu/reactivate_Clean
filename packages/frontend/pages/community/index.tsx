// pages/community/index.tsx

import { Sidebar } from "@/components/Sidebar";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useEffect, useState } from "react";
import { apiClient, CommunityPost } from "@/utils/apiClient";
import toast from "react-hot-toast";
import {
  Loader2,
  Trophy,
  MessageSquare,
  Tag,
  Plus,
  ThumbsUp,
  ThumbsDown,
} from "lucide-react";
import { CreatePostModal } from "@/components/CreatePostModal";
import { useSelector } from "react-redux";
import { RootState } from "@/store";

export default function CommunityPage() {
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const currentUser = useSelector((state: RootState) => state.user);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      setError(null);
      const data: CommunityPost[] = await apiClient.getCommunityPosts();
      setPosts(data);
    } catch (err: unknown) {
      console.error("Error fetching community posts:", err);
      const message =
        typeof err === "object" && err !== null && "message" in err
          ? (err as { message?: string }).message
          : undefined;
      setError(message || "Failed to load posts.");
      toast.error(message || "Failed to load posts.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [currentUser.id]);

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

        {/* ✅ CORRECTED MAIN CONTENT WRAPPER */}
        <div className="p-4 pt-24 text-white md:ml-64 md:p-8 md:pt-8">
          {/* ✅ RESPONSIVE HEADER */}
          <div className="mb-8 flex flex-col items-start gap-4 border-b border-white/10 pb-4 sm:flex-row sm:items-center sm:justify-between">
            <h1 className="text-3xl font-saira text-[#06ffa5] sm:text-4xl">
              Community Hub
            </h1>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="flex w-full items-center justify-center space-x-2 rounded-lg bg-[#06ffa5] px-4 py-2 font-saira text-[#0f0f23] shadow-md transition-colors duration-200 hover:bg-[#04cc83] sm:w-auto"
            >
              <Plus size={20} />
              {/* Text changes slightly for better fit on small screens */}
              <span className="sm:hidden">New Post</span>
              <span className="hidden sm:inline">Create New Post</span>
            </button>
          </div>

          {/* --- Loading, Error, and Empty States (No changes needed) --- */}
          {loading && (
            <div className="flex items-center justify-center py-8 text-white">
              <Loader2 className="mr-2 h-6 w-6 animate-spin text-[#06ffa5]" />{" "}
              Loading Community Posts...
            </div>
          )}
          {error && (
            <div className="py-8 text-center text-red-500">Error: {error}</div>
          )}
          {!loading && !error && posts.length === 0 && (
            <div className="py-8 text-center font-saira text-gray-400">
              No community posts yet. Be the first to share!
            </div>
          )}

          {/* --- Posts List --- */}
          {!loading && !error && posts.length > 0 && (
            <div className="space-y-6">
              {posts.map((post) => (
                <a
                  href={`/community/${post._id}`}
                  key={post._id}
                  className="block"
                >
                  <div className="rounded-xl border border-white/10 bg-[#1a1a2e]/80 p-5 shadow-2xl transition-all duration-200 hover:border-[#4cc9f0]/50 sm:p-6">
                    <h2 className="text-xl font-bold text-white transition-colors hover:text-[#4cc9f0] sm:text-2xl">
                      {post.title}
                    </h2>
                    <p className="mb-3 text-sm text-white/70">
                      Posted by{" "}
                      <span className="font-semibold text-[#06ffa5]">
                        {post.user.username}
                      </span>{" "}
                      on {formatDate(post.createdAt)}
                    </p>
                    {post.body && (
                      <p className="mb-4 font-saira text-gray-300 line-clamp-3">
                        {post.body}
                      </p>
                    )}
                    {post.type === "solution" && post.challengeId && (
                      <p className="mb-4 text-sm text-white/80">
                        Solution for:{" "}
                        <span className="font-semibold text-[#4cc9f0]">
                          {post.challengeId}
                        </span>
                      </p>
                    )}

                    {/* ✅ RESPONSIVE POST FOOTER */}
                    <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-white/5 pt-4 text-sm text-gray-400">
                      {/* Vote Counts */}
                      <div className="flex items-center space-x-1 font-saira">
                        <ThumbsUp size={16} className="text-green-500" />
                        <span>{post.upvotes.length}</span>
                      </div>
                      <div className="flex items-center space-x-1 font-saira">
                        <ThumbsDown size={16} className="text-red-500" />
                        <span>{post.downvotes.length}</span>
                      </div>
                      {/* Comment Count */}
                      <div className="flex items-center space-x-1 font-saira">
                        <MessageSquare size={16} />
                        <span>{post.comments.length}</span>
                      </div>
                      {/* User Points (pushed to the right on larger screens) */}
                      <div className="flex items-center space-x-1 font-saira font-semibold text-white/70 sm:ml-auto">
                        <Trophy size={16} className="text-yellow-400" />
                        <span>{post.user.totalPoints} Points</span>
                      </div>
                      {/* Tags (if they exist) */}
                      {post.tags && post.tags.length > 0 && (
                        <div className="flex w-full items-center space-x-1 pt-2">
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
