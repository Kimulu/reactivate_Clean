"use client";

import { motion } from "motion/react";
import {
  MessageCircle,
  BookOpen,
  Award,
  ArrowRight,
  UserCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/Button";

export function Community() {
  const communityFeatures = [
    {
      icon: MessageCircle,
      title: "Discord Server",
      description:
        "Join our active community of React developers for real-time discussions and help",
      color: "#4cc9f0",
    },
    {
      icon: BookOpen,
      title: "Learning Resources",
      description:
        "Access exclusive tutorials, documentation, and best practices guides",
      color: "#06ffa5",
    },
  ];

  return (
    <section id="community" className="py-20 px-6 relative bg-black">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl md:text-6xl font-oswald gradient-text mb-6">
            Join the Community
          </h2>
          <p className="text-xl text-white/70 max-w-2xl mx-auto font-saira">
            Connect with developers worldwide and accelerate your React journey
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-16 items-start">
          {/* Left: Community Features */}
          <div className="space-y-8">
            {communityFeatures.map((feature, index) => (
              <motion.div
                key={feature.title}
                className="group cursor-pointer"
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.2, duration: 0.8 }}
                viewport={{ once: true }}
              >
                <div className="bg-black/40 backdrop-blur-sm rounded-xl p-6 border border-white/10 hover:border-white/30 transition-all duration-300">
                  <div className="flex items-start space-x-4">
                    <div
                      className="flex-shrink-0 p-3 rounded-lg"
                      style={{
                        backgroundColor: `${feature.color}20`,
                        border: `1px solid ${feature.color}40`,
                      }}
                    >
                      <feature.icon
                        className="w-6 h-6"
                        style={{ color: feature.color }}
                      />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold font-saira text-white mb-2 group-hover:text-[#4cc9f0] transition-colors">
                        {feature.title}
                      </h3>
                      <p className="text-white/70 leading-relaxed font-saira">
                        {feature.description}
                      </p>
                    </div>
                    <ArrowRight className="w-5 h-5 text-white/40 group-hover:text-[#4cc9f0] group-hover:translate-x-1 transition-all duration-300" />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Right: Login / Signup */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="bg-black/60 backdrop-blur-sm rounded-xl p-8 border border-[#4cc9f0]/30 neon-glow text-center">
              {/* Animated user icon */}
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                transition={{
                  duration: 0.6,
                  ease: "easeOut",
                }}
                viewport={{ once: true }}
                className="flex justify-center mb-6"
              >
                <UserCircle2 className="w-20 h-20 text-[#06ffa5] drop-shadow-[0_0_12px_#06ffa5aa]" />
              </motion.div>

              <h3 className="text-2xl font-bold text-white mb-2 font-saira">
                Start Your Journey
              </h3>
              <p className="text-white/70 mb-8 font-saira">
                Sign up or log in to access challenges and connect with our
                community.
              </p>

              {/* Buttons */}
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Button
                  asChild
                  className="w-full sm:w-40 py-3 bg-gradient-to-r from-[#4cc9f0] to-[#06ffa5] hover:from-[#06ffa5] hover:to-[#4cc9f0] text-black font-semibold transition-all duration-300 rounded-xl"
                >
                  <a href="/login">Login</a>
                </Button>

                <Button
                  asChild
                  className="w-full sm:w-40 py-3 bg-gradient-to-r from-[#f72585] to-[#ff7bca] hover:from-[#ff7bca] hover:to-[#f72585] text-white font-semibold transition-all duration-300 rounded-xl"
                >
                  <a href="/signup">Sign Up</a>
                </Button>
              </div>
            </div>

            {/* Floating accent orbs */}
            <div className="absolute -top-4 -right-4 w-8 h-8 bg-[#06ffa5] rounded-full blur-md opacity-40 floating-animation"></div>
            <div
              className="absolute -bottom-6 -left-6 w-6 h-6 bg-[#f72585] rounded-full blur-md opacity-40 floating-animation"
              style={{ animationDelay: "2s" }}
            ></div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
