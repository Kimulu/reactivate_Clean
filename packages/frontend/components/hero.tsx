import { motion } from "motion/react";
import { Zap, Code } from "lucide-react";
import { Button } from "@/components/ui/Button";

export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
      {/* Circuit Background Pattern */}
      <div className="absolute inset-0 circuit-pattern"></div>

      {/* Animated Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0f0f23] via-[#1a1a2e] to-[#0f0f23] opacity-90"></div>

      {/* Subtle Floating Elements - positioned to not interfere with text */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Top right accent */}
        <motion.div
          className="absolute top-32 right-16 text-[#06ffa5]/30 floating-animation"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
        >
          <Zap className="w-16 h-16" />
        </motion.div>

        {/* Bottom left accent */}
        <motion.div
          className="absolute bottom-32 left-16 text-[#f72585]/20 floating-animation"
          style={{ animationDelay: "3s" }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2 }}
        >
          <Code className="w-12 h-12" />
        </motion.div>

        {/* Subtle code snippet in corners */}
        <motion.div
          className="absolute top-40 left-8 bg-black/20 backdrop-blur-sm border border-[#4cc9f0]/20 rounded-lg p-3 font-mono text-xs text-[#4cc9f0]/40 floating-animation hidden lg:block"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 2.5, duration: 0.8 }}
        >
          const [state, setState] = useState()
        </motion.div>

        <motion.div
          className="absolute bottom-40 right-8 bg-black/20 backdrop-blur-sm border border-[#06ffa5]/20 rounded-lg p-3 font-mono text-xs text-[#06ffa5]/40 floating-animation hidden lg:block"
          style={{ animationDelay: "4s" }}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 3, duration: 0.8 }}
        >
          useEffect(() =&gt; {}, [])
        </motion.div>
      </div>

      {/* Main Content */}
      <div className="relative z-20 text-center max-w-6xl mx-auto px-6">
        {/* Title with better backdrop */}
        <div className="relative">
          <motion.h1
            className="text-6xl md:text-6xl lg:text-6xl font-bold mb-6 gradient-text relative z-10"
            style={{ fontFamily: "JetBrains Mono, monospace" }}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
          >
            CODING CHALLENGES
          </motion.h1>

          {/* Subtle glow backdrop for title */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#4cc9f0]/10 via-transparent to-[#06ffa5]/10 blur-3xl -z-10"></div>
        </div>

        <motion.h2
          className="text-2xl md:text-4xl lg:text-4xl font-bold mb-8 gradient-text"
          style={{ fontFamily: "JetBrains Mono, monospace" }}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 1 }}
        >
          For React Developers
        </motion.h2>

        <motion.p
          className="text-[16px] md:text-xl lg:text-[16px] text-white/90 mb-12 max-w-xl mx-auto leading-relaxed bg-black/10 backdrop-blur-sm rounded-lg p-6 border border-white/5"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 1 }}
        >
          Learn React by doing{" "}
          <span className="text-[#4cc9f0] font-semibold">
            interactive challenges
          </span>
          , master{" "}
          <span className="text-[#06ffa5] font-semibold">modern patterns</span>,
          and build
          <span className="text-[#f72585] font-semibold">
            {" "}
            production-ready skills
          </span>{" "}
          with our hands-on coding platform.
        </motion.p>

        <motion.div
          className="flex flex-col sm:flex-row gap-6 justify-center items-center"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9, duration: 1 }}
        >
          <Button
            size="lg"
            className="px-8 py-4 text-lg font-semibold bg-gradient-to-r from-[#06ffa5] to-[#4cc9f0] hover:from-[#4cc9f0] hover:to-[#06ffa5] text-black transition-all duration-300 neon-glow"
          >
            Start Coding Now
          </Button>

          <Button
            variant="outline"
            size="lg"
            className="px-8 py-4 text-lg font-semibold border-2 border-[#f72585] text-[#f72585] hover:bg-[#f72585] hover:text-white transition-all duration-300 neon-border bg-black/20 backdrop-blur-sm"
          >
            View Challenges
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
