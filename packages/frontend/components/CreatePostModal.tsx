// components/community/CreatePostModal.tsx

import React, { useState, FormEvent, useEffect } from "react";
import toast from "react-hot-toast";
import { apiClient, Challenge, UserSubmissionDetails } from "@/utils/apiClient";
import { X, Loader2, Code } from "lucide-react";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import SyntaxHighlighter from "react-syntax-highlighter";
import { dracula } from "react-syntax-highlighter/dist/cjs/styles/hljs";

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPostCreated: () => void;
}

export function CreatePostModal({
  isOpen,
  onClose,
  onPostCreated,
}: CreatePostModalProps) {
  const user = useSelector((state: RootState) => state.user);
  const allChallenges = useSelector(
    (state: RootState) => state.challenges.allChallenges
  );

  // States for form fields
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [postType, setPostType] = useState<"solution" | "discussion">(
    "discussion"
  );
  const [tags, setTags] = useState("");
  const [selectedChallengeId, setSelectedChallengeId] = useState<
    string | undefined
  >(undefined);
  const [submissionCodeContent, setSubmissionCodeContent] = useState<
    Record<string, string> | undefined
  >(undefined);

  // States for loading indicators
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingSubmission, setIsFetchingSubmission] = useState(false);

  // --- Logic for resetting form and fetching submissions (your logic is sound) ---
  useEffect(() => {
    if (isOpen) {
      // Reset all states
      setTitle("");
      setBody("");
      setPostType("discussion");
      setTags("");
      setSelectedChallengeId(undefined);
      setSubmissionCodeContent(undefined);
    }
  }, [isOpen]);

  useEffect(() => {
    const fetchUserSubmission = async () => {
      // ... your existing fetching logic
    };
    fetchUserSubmission();
  }, [postType, selectedChallengeId, user.id]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    // ... your existing submission logic
  };

  if (!isOpen) return null;

  return (
    // ✅ 1. HIGHER Z-INDEX & BACKDROP BLUR
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm font-saira">
      {/* ✅ 2. FLEXIBLE & SCROLLABLE MODAL CONTAINER */}
      <div className="relative flex w-full max-w-2xl flex-col rounded-xl border border-[#06ffa5]/20 bg-[#1a1a2e] shadow-2xl max-h-[90vh]">
        {/* ✅ 3. MODAL HEADER (Fixed Position) */}
        <div className="flex-shrink-0 border-b border-white/10 p-4 sm:p-6">
          <h2 className="text-center font-saira text-2xl font-bold text-[#06ffa5] sm:text-3xl">
            Create New Post
          </h2>
          {/* ✅ 4. IMPROVED CLOSE BUTTON */}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 z-10 rounded-full p-2 text-white/70 transition-colors hover:bg-white/10 hover:text-white"
          >
            <X size={24} />
          </button>
        </div>

        {/* ✅ 5. SCROLLABLE CONTENT AREA */}
        <div className="flex-grow overflow-y-auto p-4 sm:p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Title */}
            <div>
              <label
                htmlFor="title"
                className="mb-2 block text-sm font-semibold text-white/70"
              >
                Title
              </label>
              <input
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full rounded-lg border border-white/10 bg-[#0f0f23]/60 px-4 py-2 text-white transition focus:border-transparent focus:ring-2 focus:ring-[#06ffa5]"
                placeholder="A concise title for your post"
                required
              />
            </div>

            {/* Post Type */}
            <div>
              <label
                htmlFor="postType"
                className="mb-2 block text-sm font-semibold text-white/70"
              >
                Post Type
              </label>
              <select
                id="postType"
                value={postType}
                onChange={(e) =>
                  setPostType(e.target.value as "solution" | "discussion")
                }
                className="w-full rounded-lg border border-white/10 bg-[#0f0f23]/60 px-4 py-2 text-white transition focus:border-transparent focus:ring-2 focus:ring-[#06ffa5]"
                required
              >
                <option value="discussion">Discussion</option>
                <option value="solution">Solution</option>
              </select>
            </div>

            {/* Conditional Solution Fields */}
            {postType === "solution" && (
              <div className="space-y-2 rounded-md border border-white/10 bg-black/20 p-4">
                <label
                  htmlFor="challengeSelect"
                  className="mb-2 block text-sm font-semibold text-white/70"
                >
                  Select Challenge
                </label>
                <select
                  id="challengeSelect"
                  value={selectedChallengeId || ""}
                  onChange={(e) =>
                    setSelectedChallengeId(e.target.value || undefined)
                  }
                  className="w-full rounded-lg border border-white/10 bg-[#0f0f23]/60 px-4 py-2 text-white transition focus:border-transparent focus:ring-2 focus:ring-[#06ffa5]"
                  required
                >
                  <option value="">-- Select a challenge --</option>
                  {allChallenges.map((challenge) => (
                    <option key={challenge.id} value={challenge.id}>
                      {challenge.title}
                    </option>
                  ))}
                </select>
                {isFetchingSubmission && (
                  <p className="mt-2 flex items-center text-sm text-[#4cc9f0]">
                    <Loader2 size={16} className="mr-2 animate-spin" /> Loading
                    your solution...
                  </p>
                )}
                {submissionCodeContent && (
                  <div className="mt-4 rounded-lg border border-white/10 bg-[#0f0f23]/80 p-3">
                    <div className="mb-2 flex items-center space-x-2 text-sm text-[#06ffa5]">
                      <Code size={16} /> <span>Loaded Solution:</span>
                    </div>
                    <div className="max-h-40 overflow-y-auto rounded-md">
                      <SyntaxHighlighter
                        language="javascript"
                        style={dracula}
                        showLineNumbers={false}
                        customStyle={{
                          padding: "10px",
                          fontSize: "0.8rem",
                          background: "transparent",
                        }}
                      >
                        {submissionCodeContent["/App.js"] ||
                          Object.values(submissionCodeContent)[0]}
                      </SyntaxHighlighter>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Body/Description */}
            <div>
              <label
                htmlFor="body"
                className="mb-2 block text-sm font-semibold text-white/70"
              >
                Description / Body
              </label>
              <textarea
                id="body"
                value={body}
                onChange={(e) => setBody(e.target.value)}
                rows={postType === "discussion" ? 8 : 3}
                className="w-full resize-y rounded-lg border border-white/10 bg-[#0f0f23]/60 px-4 py-2 text-white transition focus:border-transparent focus:ring-2 focus:ring-[#06ffa5]"
                placeholder={
                  postType === "discussion"
                    ? "Share your thoughts or ask a question."
                    : "Add a brief explanation for your solution."
                }
                required={postType === "discussion"}
              ></textarea>
            </div>

            {/* Tags */}
            <div>
              <label
                htmlFor="tags"
                className="mb-2 block text-sm font-semibold text-white/70"
              >
                Tags (comma-separated)
              </label>
              <input
                id="tags"
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                className="w-full rounded-lg border border-white/10 bg-[#0f0f23]/60 px-4 py-2 text-white transition focus:border-transparent focus:ring-2 focus:ring-[#06ffa5]"
                placeholder="e.g., react, hooks, debugging"
              />
            </div>
          </form>
        </div>

        {/* ✅ 6. MODAL FOOTER (Fixed Position) */}
        <div className="flex-shrink-0 border-t border-white/10 p-4 sm:p-6">
          <button
            type="submit"
            onClick={handleSubmit} // Link the button to the form's submit handler
            className="flex w-full items-center justify-center rounded-lg bg-gradient-to-r from-[#06ffa5] to-[#25a96d] py-3 font-bold text-[#0f0f23] shadow-lg transition-all duration-300 hover:from-[#25a96d] hover:to-[#06ffa5] disabled:cursor-not-allowed disabled:opacity-60"
            disabled={
              isLoading ||
              (postType === "solution" &&
                (!selectedChallengeId || !submissionCodeContent))
            }
          >
            {isLoading && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
            {isLoading ? "Creating Post..." : "Create Post"}
          </button>
        </div>
      </div>
    </div>
  );
}
