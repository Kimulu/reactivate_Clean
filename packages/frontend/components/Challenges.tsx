import { motion } from "motion/react";
import { Card } from "@/components/ui/Card";
import { Anchor, Component, Database } from "lucide-react";

export function Challenges() {
  const challenges = [
    {
      title: "Hooks Mastery",
      icon: Anchor,
      code: "const [data, setData] = useState(null);\nconst fetchData = useCallback(() => {\n  // Async data fetching\n}, [dependency]);",
      description: "Master useState, useEffect, and custom hooks",
      color: "#06ffa5",
    },
    {
      title: "Component Architecture",
      icon: Component,
      code: 'function UserCard({ user, onEdit }) {\n  return (\n    <div className="card">\n      <h3>{user.name}</h3>\n    </div>\n  );\n}',
      description: "Build reusable, scalable components",
      color: "#4cc9f0",
    },
    {
      title: "State Management",
      icon: Database,
      code: "const reducer = (state, action) => {\n  switch (action.type) {\n    case 'INCREMENT':\n      return { count: state.count + 1 };\n  }\n};",
      description: "Context API, Redux, and state patterns",
      color: "#f72585",
    },
  ];

  return (
    <section id="challenges" className="py-20 px-6 relative">
      <div className="max-w-7xl mx-auto">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl md:text-6xl font-bold gradient-text mb-6">
            Challenge Categories
          </h2>
          <p className="text-xl text-white/70 max-w-2xl mx-auto">
            Dive into hands-on challenges designed to level up your React skills
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {challenges.map((challenge, index) => (
            <motion.div
              key={challenge.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.2, duration: 0.8 }}
              viewport={{ once: true }}
            >
              <Card className="relative bg-black/40 backdrop-blur-sm border border-white/10 hover:border-white/30 transition-all duration-300 p-6 h-full group overflow-hidden">
                {/* Neon glow effect on hover */}
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{
                    boxShadow: `0 0 20px ${challenge.color}40`,
                  }}
                ></div>

                <div className="relative z-10">
                  <div className="flex items-center mb-4">
                    <div
                      className="p-3 rounded-lg mr-4"
                      style={{
                        backgroundColor: `${challenge.color}20`,
                        border: `1px solid ${challenge.color}40`,
                      }}
                    >
                      <challenge.icon
                        className="w-6 h-6"
                        style={{ color: challenge.color }}
                      />
                    </div>
                    <h3 className="text-xl font-bold text-white">
                      {challenge.title}
                    </h3>
                  </div>

                  <div className="bg-black/60 rounded-lg p-4 mb-6 border border-white/10">
                    <pre className="text-sm font-mono text-white/80 overflow-x-auto">
                      {challenge.code}
                    </pre>
                  </div>

                  <p className="text-white/70 leading-relaxed">
                    {challenge.description}
                  </p>

                  <button
                    className="mt-6 px-6 py-3 rounded-lg font-semibold transition-all duration-300 w-full"
                    style={{
                      background: `linear-gradient(45deg, ${challenge.color}20, ${challenge.color}40)`,
                      border: `1px solid ${challenge.color}60`,
                      color: challenge.color,
                    }}
                  >
                    Start Challenge
                  </button>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
