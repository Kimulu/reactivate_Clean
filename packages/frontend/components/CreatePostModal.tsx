// components/community/CreatePostModal.tsx

import React, { useState, FormEvent, useEffect, useCallback } from "react";
import toast from "react-hot-toast";
import { apiClient, Challenge, UserSubmissionDetails } from "@/utils/apiClient"; // 💡 MODIFIED: Import Challenge, UserSubmissionDetails
import { X, Loader2, Code } from "lucide-react"; // 💡 NEW: Code icon
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import SyntaxHighlighter from "react-syntax-highlighter";
import { dracula } from "react-syntax-highlighter/dist/cjs/styles/hljs";

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPostCreated: () => void; // Callback to refresh posts list after creation
}

export function CreatePostModal({
  isOpen,
  onClose,
  onPostCreated,
}: CreatePostModalProps) {
  const user = useSelector((state: RootState) => state.user); // Current logged-in user
  const allChallenges = useSelector(
    (state: RootState) => state.challenges.allChallenges
  ); // 💡 NEW: Get all challenges from Redux

  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [postType, setPostType] = useState<"solution" | "discussion">(
    "discussion"
  ); // Default to discussion
  const [tags, setTags] = useState(""); // Comma-separated tags
  const [isLoading, setIsLoading] = useState(false);

  // 💡 NEW STATE: For challenge selection when type is 'solution'
  const [selectedChallengeId, setSelectedChallengeId] = useState<
    string | undefined
  >(undefined);
  // 💡 NEW STATE: To store the fetched user's last submission code
  const [submissionCodeContent, setSubmissionCodeContent] = useState<
    Record<string, string> | undefined
  >(undefined);
  const [isFetchingSubmission, setIsFetchingSubmission] = useState(false);

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setTitle("");
      setBody("");
      setPostType("discussion");
      setTags("");
      setSelectedChallengeId(undefined);
      setSubmissionCodeContent(undefined);
      setIsFetchingSubmission(false);
    }
  }, [isOpen]);

  // 💡 NEW useEffect: Fetch user's last submission when challenge is selected for solution post
  useEffect(() => {
    const fetchUserSubmission = async () => {
      if (postType === "solution" && selectedChallengeId && user.id) {
        setIsFetchingSubmission(true);
        try {
          // Fetch the submission using the challenge's custom ID
          const submission: UserSubmissionDetails =
            await apiClient.getUserChallengeSubmission(
              user.id,
              selectedChallengeId
            );
          setSubmissionCodeContent(submission.submittedCode);
          toast.success(
            `Loaded your last passing solution for ${selectedChallengeId}!`
          );
        } catch (error: any) {
          console.error("Error fetching user submission:", error);
          setSubmissionCodeContent(undefined); // Clear if not found
          toast.error(
            error.message ||
              `No passing solution found for ${selectedChallengeId}.`
          );
        } finally {
          setIsFetchingSubmission(false);
        }
      } else {
        setSubmissionCodeContent(undefined); // Clear if not a solution post or no challenge selected
        setIsFetchingSubmission(false);
      }
    };
    fetchUserSubmission();
  }, [postType, selectedChallengeId, user.id]);

  if (!isOpen) return null;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (!user.id) {
      toast.error("You must be logged in to create a post.");
      setIsLoading(false);
      return;
    }

    try {
      const parsedTags = tags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean);

      const postData: {
        challenge?: string; // MongoDB _id of the challenge
        challengeId?: string; // Custom ID of the challenge
        title: string;
        codeContent?: { [path: string]: string };
        body?: string;
        type: "solution" | "discussion";
        tags?: string[];
      } = {
        title,
        body: body || undefined,
        type: postType,
        tags: parsedTags.length > 0 ? parsedTags : undefined,
      };

      if (postType === "solution") {
        if (!selectedChallengeId || !submissionCodeContent) {
          toast.error(
            "Please select a challenge and ensure a solution is loaded."
          );
          setIsLoading(false);
          return;
        }
        // Need to get the MongoDB _id of the challenge
        const challengeMongoId = allChallenges.find(
          (c) => c.id === selectedChallengeId
        )?._id;
        if (!challengeMongoId) {
          toast.error(
            "Could not find internal challenge ID for the selected challenge."
          );
          setIsLoading(false);
          return;
        }

        postData.challenge = challengeMongoId;
        postData.challengeId = selectedChallengeId;
        postData.codeContent = submissionCodeContent;
      }

      await apiClient.createCommunityPost(postData);
      toast.success("Post created successfully!");
      onPostCreated(); // Refresh parent's post list
      onClose(); // Close the modal
    } catch (error: any) {
      console.error("Error creating post:", error);
      toast.error(error.message || "Failed to create post.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-[#1a1a2e] rounded-xl shadow-2xl border border-[#06ffa5]/20 max-w-2xl w-full p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors"
        >
          <X size={24} />
        </button>

        <h2 className="text-3xl font-bold text-[#06ffa5] text-center mb-6">
          Create New Post
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="title"
              className="block text-white/70 text-sm font-semibold mb-2"
            >
              Title
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2 bg-[#0f0f23]/60 border border-white/10 rounded-lg text-white focus:ring-2 focus:ring-[#06ffa5] focus:border-transparent transition"
              placeholder="A concise title for your post"
              required
            />
          </div>

          <div>
            <label
              htmlFor="postType"
              className="block text-white/70 text-sm font-semibold mb-2"
            >
              Post Type
            </label>
            <select
              id="postType"
              value={postType}
              onChange={(e) => {
                setPostType(e.target.value as "solution" | "discussion");
                setSelectedChallengeId(undefined); // Reset challenge selection
                setSubmissionCodeContent(undefined); // Clear code
              }}
              className="w-full px-4 py-2 bg-[#0f0f23]/60 border border-white/10 rounded-lg text-white focus:ring-2 focus:ring-[#06ffa5] focus:border-transparent transition"
              required
            >
              <option value="discussion">Discussion</option>
              <option value="solution">Solution</option>
            </select>
          </div>

          {postType === "solution" && (
            <div>
              <label
                htmlFor="challengeSelect"
                className="block text-white/70 text-sm font-semibold mb-2"
              >
                Select Challenge
              </label>
              <select
                id="challengeSelect"
                value={selectedChallengeId || ""}
                onChange={(e) =>
                  setSelectedChallengeId(e.target.value || undefined)
                }
                className="w-full px-4 py-2 bg-[#0f0f23]/60 border border-white/10 rounded-lg text-white focus:ring-2 focus:ring-[#06ffa5] focus:border-transparent transition"
                required
              >
                <option value="">-- Select a challenge --</option>
                {allChallenges.map((challenge) => (
                  <option key={challenge.id} value={challenge.id}>
                    {challenge.title} ({challenge.difficulty})
                  </option>
                ))}
              </select>

              {isFetchingSubmission && (
                <p className="flex items-center text-[#4cc9f0] text-sm mt-2">
                  <Loader2 size={16} className="animate-spin mr-2" /> Loading
                  your solution...
                </p>
              )}
              {submissionCodeContent && (
                <div className="mt-4 p-3 bg-[#0f0f23]/80 rounded-lg border border-white/10">
                  <div className="flex items-center text-[#06ffa5] text-sm mb-2 space-x-2">
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

          <div>
            <label
              htmlFor="body"
              className="block text-white/70 text-sm font-semibold mb-2"
            >
              Description / Body
            </label>
            <textarea
              id="body"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={postType === "discussion" ? 8 : 3} // More rows for discussion, less for solution description
              className="w-full px-4 py-2 bg-[#0f0f23]/60 border border-white/10 rounded-lg text-white focus:ring-2 focus:ring-[#06ffa5] focus:border-transparent transition resize-y"
              placeholder={
                postType === "discussion"
                  ? "Share your thoughts or ask a question."
                  : "Add a brief description or explanation for your solution."
              }
              required={postType === "discussion"}
            ></textarea>
          </div>

          <div>
            <label
              htmlFor="tags"
              className="block text-white/70 text-sm font-semibold mb-2"
            >
              Tags (comma-separated)
            </label>
            <input
              id="tags"
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              className="w-full px-4 py-2 bg-[#0f0f23]/60 border border-white/10 rounded-lg text-white focus:ring-2 focus:ring-[#06ffa5] focus:border-transparent transition"
              placeholder="e.g., react, hooks, debugging, CSS"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-[#06ffa5] to-[#25a96d] text-[#0f0f23] font-bold py-3 rounded-lg hover:from-[#25a96d] hover:to-[#06ffa5] transition-all duration-300 shadow-lg"
            disabled={
              isLoading ||
              (postType === "solution" &&
                (!selectedChallengeId || !submissionCodeContent))
            }
          >
            {isLoading ? "Creating Post..." : "Create Post"}
          </button>
        </form>
      </div>
    </div>
  );
}
