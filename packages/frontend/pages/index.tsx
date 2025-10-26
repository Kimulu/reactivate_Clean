import { Hero } from "@/components/hero";
import { Navbar } from "../components/navbar";
import { Challenges } from "@/components/Challenges";
import { Features } from "@/components/features";
import { Stats } from "@/components/Stats";
import { Community } from "@/components/Community";
import { Zap, Heart } from "lucide-react";

export default function App() {
  return (
    <>
      <Navbar />
      <main className="bg-black text-white min-h-[70vh]">
        <Hero />
      </main>

      <Challenges />
      <Features />
      <Stats />
      <Community />

      {/* Footer */}
      <footer className="py-12 px-6 border-t bg-black border-white/10 z-10 relative">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <Zap className="w-8 h-8 text-[#06ffa5]" />
            <span className="text-2xl font-chicle gradient-text font-mono">
              Reactivate
            </span>
          </div>
          <p className="text-white/60 mb-4 font-saira">
            Master React through interactive challenges and build
            production-ready skills.
          </p>
          <div className="flex justify-center space-x-6 text-sm text-white/40 font-saira">
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

          <div className="mt-6 pt-6 border-t border-white/5 font-saira">
            <p className="text-xs text-white/40 mb-2">
              © 2025 Reactivate. All rights reserved.
            </p>

            <p className="text-xs text-white/50 flex items-center justify-center gap-2 font-saira">
              Built with{" "}
              <Heart className="w-4 h-4 text-[#f72585] animate-pulse" /> by{" "}
              <a
                href="https://www.linkedin.com/in/michael-kimulu/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#4cc9f0] hover:text-[#06ffa5] transition-colors font-medium"
              >
                Michael Kimulu
              </a>
            </p>
          </div>
        </div>
      </footer>
    </>
  );
}
