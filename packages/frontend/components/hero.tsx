"use client";

import { motion } from "framer-motion"; // Using standard framer-motion
import { Zap, Code } from "lucide-react";

// Fix 2: Changed path alias to a relative import for ConnectParticles
import ConnectParticles from "./ConnectParticles";

export function Hero() {
  return (
    <>
      {/* 1. PARTICLES: Positioned absolutely to cover the viewport, set to Z-index 0. */}
      <ConnectParticles
        id="hero-connect-particles"
        style={{
          position: "absolute",
          width: "100%",
          height: "100%",
          top: 0,
          left: 0,
          zIndex: -1,
        }}
      />

      {/* 2. MAIN CONTENT SECTION: Set to min-h-screen and z-index 10 (high enough to be above the particles). */}
      <section className="relative min-h-screen flex items-center justify-center z-10 overflow-hidden px-4 sm:px-6">
        {/* 🎨 Layer 1: Gradient Overlay (Sits on top of particles, but below foreground content) */}
        <div className="absolute inset-0  opacity-90 z-[1]"></div>

        {/* 🎨 Layer 2: Circuit Pattern Overlay (Below the interactive elements) */}
        <div className="absolute inset-0 circuit-pattern z-[2]"></div>

        {/* ⚡ Layer 3: Floating Icons & Code Snippets (Z-index 3 or 4) */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-[3]">
          <motion.div
            className="absolute top-24 right-6 sm:right-16 text-[#06ffa5]/30 floating-animation"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
          >
            <Zap className="w-10 h-10 sm:w-16 sm:h-16" />
          </motion.div>

          <motion.div
            className="absolute bottom-24 left-6 sm:left-16 text-[#f72585]/25 floating-animation"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.8 }}
          >
            <Code className="w-8 h-8 sm:w-12 sm:h-12" />
          </motion.div>
        </div>

        {/* 💻 Layer 4: Floating Code Snippets (Z-index 4) */}
        <motion.div
          className="absolute top-40 left-8 bg-black/20 backdrop-blur-sm border border-[#4cc9f0]/20 rounded-lg p-3 font-mono text-xs text-[#4cc9f0]/40 floating-animation hidden lg:block z-[4]"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 2.5, duration: 0.8 }}
        >
          const [state, setState] = useState()
        </motion.div>

        <motion.div
          className="absolute bottom-40 right-8 bg-black/20 backdrop-blur-sm border border-[#06ffa5]/20 rounded-lg p-3 font-mono text-xs text-[#06ffa5]/40 floating-animation hidden lg:block z-[4]"
          style={{ animationDelay: "4s" }}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 3, duration: 0.8 }}
        >
          useEffect(() =&gt; {`{}`}, [])
        </motion.div>

        {/* 🧠 Layer 5: Main Content (Highest Z-index: 5) */}
        <div className="relative z-[5] text-center max-w-4xl mx-auto">
          {/* Title */}
          <motion.h1
            className="text-4xl sm:text-5xl md:text-6xl font-bold mb-4 gradient-text font-mono leading-tight"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
          >
            CODING CHALLENGES
          </motion.h1>

          <motion.h2
            className="text-xl sm:text-2xl md:text-3xl font-bold mb-6 gradient-text"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 1 }}
          >
            For React Developers
          </motion.h2>

          {/* Paragraph */}

          {/* Buttons */}
          <motion.div
            className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9, duration: 1 }}
          >
            {/* Fix 1: Replaced Link component with standard <a> tag */}
            <a href="/Signup">
              <button className="px-8 py-3 sm:py-4 sm:px-10 text-base sm:text-lg font-semibold border border-[#06ffa5] text-white/90 rounded-lg hover:bg-[#06ffa5] hover:text-black transition-colors duration-300 w-48 sm:w-auto">
                Join Now
              </button>
            </a>

            {/* Fix 1: Replaced Link component with standard <a> tag */}
            <a href="/Login">
              <button className="px-8 py-3 sm:py-4 sm:px-10 text-base sm:text-lg font-semibold border border-[#4cc9f0] text-white/90 rounded-lg hover:bg-[#4cc9f0] hover:text-black transition-colors duration-300 w-48 sm:w-auto">
                Explore Challenges
              </button>
            </a>
          </motion.div>
        </div>
      </section>
    </>
  );
}
