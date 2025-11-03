// pages/feedback/index.tsx

import { Sidebar } from "@/components/Sidebar";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useState, FormEvent } from "react";
import toast from "react-hot-toast";
import { Loader2, Send } from "lucide-react";
import { apiClient } from "@/utils/apiClient"; // ✅ Import the apiClient

export default function FeedbackPage() {
  // Form states
  const [message, setMessage] = useState("");
  const [rating, setRating] = useState(5);

  // Loading and submission status
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);

  // ✅ Updated handleSubmit function to use apiClient
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!message.trim()) {
      toast.error("Please enter your feedback before submitting.");
      return;
    }
    setIsSubmitting(true);
    try {
      // Call the apiClient method. The token is handled automatically.
      await apiClient.postFeedback(message, rating);
      toast.success("Feedback submitted successfully!");
      setHasSubmitted(true); // Show success message
    } catch (err: unknown) {
      // Safely extract a message from the caught value and show it
      const message =
        typeof err === "object" &&
        err !== null &&
        "message" in err &&
        typeof (err as { message?: unknown }).message === "string"
          ? (err as { message: string }).message
          : "Failed to send feedback. Please try again.";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-[#0f0f23] via-[#1a1a2e] to-[#0f0f23]">
        <Sidebar />

        <div className="mx-auto max-w-4xl p-4 pt-24 font-saira text-white md:ml-64 md:p-8 md:pt-8">
          {/* Page Header */}
          <h1 className="mb-8 border-b border-white/10 pb-4 text-center text-3xl font-bold text-[#06ffa5] sm:text-4xl">
            Submit Feedback
          </h1>

          {/* Feedback Card */}
          <div className="rounded-xl border border-white/10 bg-[#1a1a2e]/80 p-6 shadow-2xl sm:p-8">
            {hasSubmitted ? (
              <div className="text-center">
                <h2 className="text-2xl font-bold text-white sm:text-3xl mb-4">
                  ✅ Thank You!
                </h2>
                <p className="text-white/70">
                  Your feedback has been received. We appreciate you taking the
                  time to help us improve.
                </p>
              </div>
            ) : (
              <>
                <h2 className="mb-4 border-b border-white/5 pb-2 text-xl font-bold text-white sm:text-2xl">
                  We’d love to hear from you
                </h2>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Feedback Message */}
                  <div>
                    <label
                      htmlFor="feedbackMessage"
                      className="mb-2 block text-sm font-semibold text-white/70"
                    >
                      Your thoughts on the challenge
                    </label>
                    <textarea
                      id="feedbackMessage"
                      rows={5}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="What went well? What could be improved?"
                      className="w-full rounded-lg border border-white/10 bg-[#0f0f23]/60 px-4 py-2 text-white transition focus:border-transparent focus:ring-2 focus:ring-[#06ffa5]"
                      required
                    />
                  </div>

                  {/* Rating */}
                  <div>
                    <label
                      htmlFor="rating"
                      className="mb-2 block text-sm font-semibold text-white/70"
                    >
                      Overall Rating
                    </label>
                    <select
                      id="rating"
                      value={rating}
                      onChange={(e) => setRating(Number(e.target.value))}
                      className="w-full rounded-lg border border-white/10 bg-[#0f0f23]/60 px-4 py-2 text-white transition focus:border-transparent focus:ring-2 focus:ring-[#06ffa5]"
                    >
                      <option value={5}>5 - Excellent</option>
                      <option value={4}>4 - Good</option>
                      <option value={3}>3 - Average</option>
                      <option value={2}>2 - Fair</option>
                      <option value={1}>1 - Poor</option>
                    </select>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    className="flex w-full items-center justify-center rounded-lg bg-[#06ffa5] px-4 py-2 font-semibold text-[#0f0f23] transition-colors duration-200 hover:bg-[#04cc83] disabled:opacity-60"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    ) : (
                      <Send className="mr-2 h-5 w-5" />
                    )}
                    {isSubmitting ? "Submitting..." : "Send Feedback"}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
