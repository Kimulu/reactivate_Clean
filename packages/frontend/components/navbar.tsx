"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Zap, X, Menu } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-black/40 backdrop-blur-md border-b border-white/10">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center space-x-3">
          <Zap className="w-7 h-7 text-[#06ffa5]" />
          <h1 className="text-xl font-bold gradient-text font-mono">
            Reactivate
          </h1>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-8">
          {["Home", "Features", "About", "Contact"].map((item) => (
            <a
              key={item}
              href={`#${item.toLowerCase()}`}
              className="text-white/90 hover:text-[#4cc9f0] transition-colors duration-300 font-medium"
            >
              {item}
            </a>
          ))}
        </div>

        {/* Desktop Auth Buttons */}
        <div className="hidden md:flex items-center space-x-4">
          <Link href="/Login">
            <button className="px-4 py-2 border border-[#4cc9f0] text-white/90 font-medium rounded-lg hover:bg-[#4cc9f0] hover:text-black transition-colors duration-300">
              Login
            </button>
          </Link>
          <Link href="/Signup">
            <button className="px-4 py-2 border border-[#06ffa5] text-white/90 font-medium rounded-lg hover:bg-[#06ffa5] hover:text-black transition-colors duration-300">
              Join
            </button>
          </Link>
        </div>

        {/* Mobile menu button */}
        <div className="md:hidden">
          <button
            onClick={() => setIsOpen(true)}
            className="text-white/90 hover:text-[#4cc9f0] transition-colors"
          >
            <Menu className="w-7 h-7" />
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Optional backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 bg-black z-40"
              onClick={() => setIsOpen(false)}
            />

            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 70, damping: 15 }}
              className="fixed top-0 right-0 h-screen w-2/3 sm:w-1/3 bg-black/95 backdrop-blur-xl z-50 flex flex-col items-center justify-center space-y-8 border-l border-white/10"
            >
              {/* Close button */}
              <button
                onClick={() => setIsOpen(false)}
                className="absolute top-5 right-5 text-white/70 hover:text-[#4cc9f0] transition-colors"
              >
                <X className="w-7 h-7" />
              </button>

              <Link href="/Login" onClick={() => setIsOpen(false)}>
                <button className="w-40 py-3 border border-[#4cc9f0] text-white/90 font-medium rounded-lg hover:bg-[#4cc9f0] hover:text-black transition-colors duration-300">
                  Login
                </button>
              </Link>
              <Link href="/Signup" onClick={() => setIsOpen(false)}>
                <button className="w-40 py-3 border border-[#06ffa5] text-white/90 font-medium rounded-lg hover:bg-[#06ffa5] hover:text-black transition-colors duration-300">
                  Join
                </button>
              </Link>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </nav>
  );
}
