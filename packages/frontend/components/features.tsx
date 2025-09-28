"use client";

import { motion } from "motion/react";
import { Code2, TrendingUp, Users, Play } from "lucide-react";
import { useState } from "react";

export function Features() {
  const features = [
    {
      icon: Code2,
      title: "Live Code Editor",
      description:
        "Interactive coding environment with real-time feedback and syntax highlighting",
    },
    {
      icon: TrendingUp,
      title: "Progress Tracking",
      description:
        "Monitor your learning journey with detailed analytics and achievement badges",
    },
    {
      icon: Users,
      title: "Community Support",
      description:
        "Connect with fellow developers, share solutions, and learn together",
    },
  ];

  const codeExample = `function TodoApp() {
  const [todos, setTodos] = useState([]);
  const [input, setInput] = useState('');
  
  const addTodo = () => {
    if (input.trim()) {
      setTodos([...todos, {
        id: Date.now(),
        text: input,
        completed: false
      }]);
      setInput('');
    }
  };
  
  const toggleTodo = (id) => {
    setTodos(todos.map(todo => 
      todo.id === id 
        ? { ...todo, completed: !todo.completed }
        : todo
    ));
  };
  
  return (
    <div className="todo-app">
      <input 
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Add a new todo..."
      />
      <button onClick={addTodo}>Add</button>
      <ul>
        {todos.map(todo => (
          <li 
            key={todo.id}
            onClick={() => toggleTodo(todo.id)}
            className={todo.completed ? 'completed' : ''}
          >
            {todo.text}
          </li>
        ))}
      </ul>
    </div>
  );
}`;

  return (
    <section id="features" className="py-20 px-6 relative">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-16 items-stretch">
          {/* Features List */}
          <div className="flex flex-col justify-center">
            <motion.h2
              className="text-4xl md:text-5xl font-bold gradient-text mb-8"
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              Powerful Features
            </motion.h2>

            <div className="space-y-8">
              {features.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  className="flex items-start space-x-4"
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.2, duration: 0.8 }}
                  viewport={{ once: true }}
                >
                  <div className="flex-shrink-0 p-3 bg-gradient-to-br from-[#4cc9f0]/20 to-[#06ffa5]/20 rounded-lg border border-[#4cc9f0]/30">
                    <feature.icon className="w-6 h-6 text-[#4cc9f0]" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-white/70 leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Code Editor Mockup */}
          <motion.div
            className="relative flex flex-col h-full"
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <div className="bg-black/60 backdrop-blur-sm rounded-xl border border-[#4cc9f0]/30 overflow-hidden neon-glow flex flex-col h-[450px]">
              {/* Editor Header */}
              <div className="flex items-center justify-between p-4 bg-black/40 border-b border-white/10">
                <div className="flex items-center space-x-2">
                  <div className="flex space-x-2">
                    <div className="w-3 h-3 bg-[#f72585] rounded-full"></div>
                    <div className="w-3 h-3 bg-[#ffb700] rounded-full"></div>
                    <div className="w-3 h-3 bg-[#06ffa5] rounded-full"></div>
                  </div>
                  <span className="text-white/60 text-sm ml-4 font-mono">
                    TodoApp.jsx
                  </span>
                </div>
                <button className="flex items-center space-x-2 px-3 py-1 bg-[#06ffa5]/20 text-[#06ffa5] rounded-md border border-[#06ffa5]/30 hover:bg-[#06ffa5]/30 transition-colors">
                  <Play className="w-4 h-4" />
                  <span className="text-sm font-medium">Run</span>
                </button>
              </div>

              {/* Code Content */}
              <div className="p-6 font-mono text-sm leading-relaxed overflow-y-auto flex-1">
                <pre className="text-white/90">
                  <code
                    dangerouslySetInnerHTML={{
                      __html: codeExample
                        .replace(
                          /function|const|return|if|map|useState/g,
                          '<span style="color: #f72585">$&</span>'
                        )
                        .replace(
                          /TodoApp|addTodo|toggleTodo|todos|input|setTodos|setInput/g,
                          '<span style="color: #4cc9f0">$&</span>'
                        )
                        .replace(
                          /"[^"]*"/g,
                          '<span style="color: #06ffa5">$&</span>'
                        )
                        .replace(
                          /\/\/.*$/gm,
                          '<span style="color: #888">$&</span>'
                        ),
                    }}
                  />
                </pre>
              </div>
            </div>

            {/* Floating accent elements */}
            <div className="absolute -top-4 -right-4 w-8 h-8 bg-[#f72585] rounded-full blur-sm opacity-60 floating-animation"></div>
            <div
              className="absolute -bottom-4 -left-4 w-6 h-6 bg-[#06ffa5] rounded-full blur-sm opacity-60 floating-animation"
              style={{ animationDelay: "1s" }}
            ></div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
