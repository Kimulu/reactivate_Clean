import { motion } from "motion/react";
import { Code, Users, Trophy, Clock } from "lucide-react";

export function Stats() {
  const stats = [
    {
      icon: Code,
      number: "50+",
      label: "React Challenges",
      description: "Comprehensive coding exercises",
      color: "#06ffa5",
    },
    {
      icon: Users,
      number: "10K+",
      label: "Developers Learning",
      description: "Active community members",
      color: "#4cc9f0",
    },
    {
      icon: Trophy,
      number: "95%",
      label: "Success Rate",
      description: "Students complete challenges",
      color: "#f72585",
    },
    {
      icon: Clock,
      number: "24/7",
      label: "Platform Access",
      description: "Learn at your own pace",
      color: "#7209b7",
    },
  ];

  return (
    <section className="py-20 px-6 relative">
      <div className="max-w-7xl mx-auto">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl md:text-5xl font-bold gradient-text mb-6">
            Trusted by Developers
          </h2>
          <p className="text-xl text-white/70 max-w-2xl mx-auto">
            Join thousands of developers who are advancing their React skills
          </p>
        </motion.div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              className="relative group"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.8 }}
              viewport={{ once: true }}
            >
              <div
                className="bg-black/40 backdrop-blur-sm rounded-xl p-8 text-center border border-white/10 hover:border-white/30 transition-all duration-300 h-full"
                style={{
                  boxShadow: `0 0 0 1px ${stat.color}20`,
                }}
              >
                {/* Glow effect on hover */}
                <div
                  className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{
                    boxShadow: `0 0 30px ${stat.color}30`,
                  }}
                ></div>

                <div className="relative z-10">
                  <div
                    className="inline-flex p-4 rounded-lg mb-4"
                    style={{
                      backgroundColor: `${stat.color}20`,
                      border: `1px solid ${stat.color}40`,
                    }}
                  >
                    <stat.icon
                      className="w-8 h-8"
                      style={{ color: stat.color }}
                    />
                  </div>

                  <div
                    className="text-3xl md:text-4xl font-bold mb-2 font-mono"
                    style={{ color: stat.color }}
                  >
                    {stat.number}
                  </div>

                  <h3 className="text-lg font-semibold text-white mb-2">
                    {stat.label}
                  </h3>

                  <p className="text-sm text-white/60">{stat.description}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom accent line */}
        <div className="mt-16 h-px bg-gradient-to-r from-transparent via-[#4cc9f0]/50 to-transparent"></div>
      </div>
    </section>
  );
}
