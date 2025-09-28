import { motion } from "motion/react";
import {
  MessageCircle,
  BookOpen,
  Award,
  Mail,
  User,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

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
    {
      icon: Award,
      title: "Certification",
      description:
        "Earn verified certificates upon completing challenge tracks and skill assessments",
      color: "#f72585",
    },
  ];

  return (
    <section id="community" className="py-20 px-6 relative">
      <div className="max-w-7xl mx-auto">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl md:text-6xl font-bold gradient-text mb-6">
            Join the Community
          </h2>
          <p className="text-xl text-white/70 max-w-2xl mx-auto">
            Connect with developers worldwide and accelerate your React journey
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-16 items-start">
          {/* Community Features */}
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
                      <h3 className="text-xl font-bold text-white mb-2 group-hover:text-[#4cc9f0] transition-colors">
                        {feature.title}
                      </h3>
                      <p className="text-white/70 leading-relaxed">
                        {feature.description}
                      </p>
                    </div>
                    <ArrowRight className="w-5 h-5 text-white/40 group-hover:text-[#4cc9f0] group-hover:translate-x-1 transition-all duration-300" />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Signup Form */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <div className="bg-black/60 backdrop-blur-sm rounded-xl p-8 border border-[#4cc9f0]/30 neon-glow">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-white mb-2">
                  Start Your Journey
                </h3>
                <p className="text-white/70">
                  Sign up to access challenges and join our community
                </p>
              </div>

              <form className="space-y-6">
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/40" />
                  <Input
                    type="text"
                    placeholder="Username"
                    className="pl-12 bg-white/5 border-white/20 text-white placeholder:text-white/40 focus:border-[#4cc9f0] focus:ring-[#4cc9f0]/20"
                  />
                </div>

                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/40" />
                  <Input
                    type="email"
                    placeholder="Email address"
                    className="pl-12 bg-white/5 border-white/20 text-white placeholder:text-white/40 focus:border-[#4cc9f0] focus:ring-[#4cc9f0]/20"
                  />
                </div>

                <Button
                  className="w-full py-3 bg-gradient-to-r from-[#06ffa5] to-[#4cc9f0] hover:from-[#4cc9f0] hover:to-[#06ffa5] text-black font-semibold transition-all duration-300 neon-glow"
                  size="lg"
                >
                  Join ReactChallenges
                </Button>
              </form>

              <div className="mt-6 pt-6 border-t border-white/10 text-center">
                <p className="text-sm text-white/60">
                  Already have an account?{" "}
                  <a
                    href="#"
                    className="text-[#4cc9f0] hover:text-[#06ffa5] transition-colors font-medium"
                  >
                    Sign in here
                  </a>
                </p>
              </div>
            </div>

            {/* Floating accent elements */}
            <div className="absolute -top-4 -right-4 w-8 h-8 bg-[#06ffa5] rounded-full blur-sm opacity-40 floating-animation"></div>
            <div
              className="absolute -bottom-6 -left-6 w-6 h-6 bg-[#f72585] rounded-full blur-sm opacity-40 floating-animation"
              style={{ animationDelay: "2s" }}
            ></div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
