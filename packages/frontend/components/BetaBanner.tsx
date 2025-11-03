"use client";
import { X } from "lucide-react";
import { useRouter } from "next/router";

// ✅ Define a type for the component's props to fix the TypeScript error
interface BetaBannerProps {
  onClose: () => void;
}

export default function BetaBanner({ onClose }: BetaBannerProps) {
  const router = useRouter();

  const handleJoin = () => router.push("/BetaSignup");

  return (
    <div className="fixed top-0 left-0 right-0 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 flex items-center justify-center z-[60]">
      <p className="text-[12px] md:text-base font-medium text-center">
        🚀 Reactivate is now LIVE! Be among the first to test and shape the
        experience.{" "}
        <button
          onClick={handleJoin}
          className="underline font-semibold hover:text-yellow-300 ml-2"
        >
          Join as a Beta Tester
        </button>
      </p>
      <button
        onClick={onClose}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-white/80 hover:text-yellow-300 transition"
      >
        <X className="w-5 h-5" />
      </button>
    </div>
  );
}
