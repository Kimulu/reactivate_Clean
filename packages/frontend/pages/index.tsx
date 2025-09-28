import { Hero } from "@/components/hero";
import { Navbar } from "../components/navbar";
import { Challenges } from "@/components/Challenges";
import { Features } from "@/components/features";
import { Stats } from "@/components/Stats";
import { Community } from "@/components/Community";
import { Zap } from "lucide-react";

export default function App() {
  return (
    <div className="min-h-screen bg-black dark">
      <Navbar />
      <Hero />
      <Challenges />
      <Features />
      <Stats />
      <Community />

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-white/10">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <Zap className="w-8 h-8 text-[#06ffa5]" />
            <span className="text-xl font-bold gradient-text font-mono">
              Reactivate
            </span>
          </div>
          <p className="text-white/60 mb-4">
            Master React through interactive challenges and build
            production-ready skills.
          </p>
          <div className="flex justify-center space-x-6 text-sm text-white/40">
            <a href="#" className="hover:text-[#4cc9f0] transition-colors">
              Privacy Policy
            </a>
            <a href="#" className="hover:text-[#4cc9f0] transition-colors">
              Terms of Service
            </a>
            <a href="#" className="hover:text-[#4cc9f0] transition-colors">
              Contact
            </a>
          </div>
          <div className="mt-6 pt-6 border-t border-white/5">
            <p className="text-xs text-white/40">
              © 2025 Reactivate. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
