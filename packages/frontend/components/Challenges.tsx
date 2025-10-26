"use client";
import { motion } from "motion/react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Anchor, Component, Database, Cpu } from "lucide-react";

export function Challenges() {
  const challenges = [
    {
      title: "Hooks Mastery",
      icon: Anchor,
      code: `const [data, setData] = useState(null);
const fetchData = useCallback(() => {
  // Async data fetching
}, [dependency]);`,
      description: "Master useState, useEffect, and custom hooks.",
      color: "#06ffa5",
    },
    {
      title: "Component Architecture",
      icon: Component,
      code: `function UserCard({ user }) {
  return (
    <div className="card">
      <h3>{user.name}</h3>
    </div>
  );
}`,
      description: "Build reusable, scalable components for large apps.",
      color: "#4cc9f0",
    },
    {
      title: "State Management",
      icon: Database,
      code: `const reducer = (state, action) => {
  switch (action.type) {
    case 'INCREMENT':
      return { count: state.count + 1 };
  }
};`,
      description: "Master Context API, Redux Toolkit, and state logic.",
      color: "#f72585",
    },
    {
      title: "Performance Optimization",
      icon: Cpu,
      code: `const MemoizedList = memo(({ items }) => {
  return items.map(item => <Item key={item.id} {...item} />);
});`,
      description: "Optimize rendering and app speed with memoization.",
      color: "#ffb703",
    },
  ];

  return (
    <section
      id="challenges"
      className="py-24 px-6 bg-black relative overflow-hidden"
    >
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          className="text-center mb-20"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl md:text-6xl font-oswald gradient-text mb-4 py-4">
            Challenge Categories
          </h2>
          <p className="text-lg text-white/70 max-w-2xl mx-auto font-saira">
            Choose a React challenge and test your front-end mastery
          </p>
        </motion.div>

        {/* Cards Grid */}
        <div className="grid gap-12 md:grid-cols-2">
          {challenges.map((challenge, index) => (
            <motion.div
              key={challenge.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.15, duration: 0.8 }}
              viewport={{ once: true }}
              whileHover={{
                rotateY: 12,
                rotateX: -6,
                scale: 1.08,
                boxShadow: `0px 0px 60px ${challenge.color}60`,
                transition: { type: "spring", stiffness: 200, damping: 12 },
              }}
              className="relative"
            >
              {/* Glow Reflection Overlay */}
              <div
                className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-30 transition-opacity duration-500"
                style={{
                  background: `radial-gradient(circle at 30% 20%, ${challenge.color}99 0%, transparent 70%)`,
                }}
              ></div>

              <Card className="group relative bg-black/40 border border-white/10 hover:border-white/30 backdrop-blur-sm overflow-hidden rounded-2xl flex flex-col justify-between p-8 h-[480px] transition-all duration-500 hover:shadow-[0_0_60px_rgba(255,255,255,0.15)]">
                {/* Header */}
                <div className="flex items-center gap-4 mb-6">
                  <div
                    className="p-4 rounded-xl shrink-0"
                    style={{
                      backgroundColor: `${challenge.color}20`,
                      border: `1px solid ${challenge.color}50`,
                    }}
                  >
                    <challenge.icon
                      className="w-8 h-8"
                      style={{ color: challenge.color }}
                    />
                  </div>
                  <h3 className="text-2xl font-semibold text-white font-saira leading-snug">
                    {challenge.title}
                  </h3>
                </div>

                {/* Code Preview */}
                <div className="flex-1 mb-6 bg-black/60 border border-white/10 rounded-xl p-4 overflow-hidden">
                  <pre className="text-sm font-mono text-white/80 overflow-x-auto leading-relaxed whitespace-pre-wrap break-words">
                    {challenge.code}
                  </pre>
                </div>

                {/* Description + Button */}
                <div className="flex flex-col">
                  <p className="text-white/70 font-saira mb-6 text-base leading-relaxed">
                    {challenge.description}
                  </p>
                  <Link href="/Login">
                    <motion.button
                      whileHover={{
                        scale: 1.1,
                        boxShadow: `0 0 25px ${challenge.color}`,
                      }}
                      whileTap={{ scale: 0.96 }}
                      className="w-full px-5 py-3 rounded-lg font-semibold font-saira transition-all duration-300 text-center"
                      style={{
                        background: `linear-gradient(45deg, ${challenge.color}30, ${challenge.color}60)`,
                        border: `1px solid ${challenge.color}80`,
                        color: challenge.color,
                      }}
                    >
                      Start Challenge
                    </motion.button>
                  </Link>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
