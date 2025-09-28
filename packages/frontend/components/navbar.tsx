"use client";

import React from "react";
import Link from "next/link";
import { Zap } from "lucide-react";

export function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-black/20 backdrop-blur-md border-b border-white/10">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center space-x-3">
          <Zap className="w-8 h-8 text-[#06ffa5]" />
          <h1 className="text-2xl font-bold gradient-text font-mono">
            Reactivate
          </h1>
        </div>

        {/* Navigation Links */}
        <div className="hidden md:flex items-center space-x-8">
          <a
            href="#home"
            className="text-white/90 hover:text-[#4cc9f0] transition-colors duration-300 font-medium"
          >
            Home
          </a>
          <a
            href="#features"
            className="text-white/90 hover:text-[#4cc9f0] transition-colors duration-300 font-medium"
          >
            Features
          </a>
          <a
            href="#about"
            className="text-white/90 hover:text-[#4cc9f0] transition-colors duration-300 font-medium"
          >
            About
          </a>
          <a
            href="#contact"
            className="text-white/90 hover:text-[#4cc9f0] transition-colors duration-300 font-medium"
          >
            Contact
          </a>
        </div>

        {/* Auth Buttons */}
        <div className="hidden md:flex items-center space-x-4">
          <Link href="/login">
            <button className="px-4 py-2 border border-[#4cc9f0] text-white/90 font-medium rounded-lg hover:bg-[#4cc9f0] hover:text-black transition-colors duration-300">
              Login
            </button>
          </Link>
          <Link href="/signup">
            <button className="px-4 py-2 border border-[#06ffa5] text-white/90 font-medium rounded-lg hover:bg-[#06ffa5] hover:text-black transition-colors duration-300">
              Join
            </button>
          </Link>
        </div>

        {/* Mobile menu button */}
        <div className="md:hidden">
          <button className="text-white/90 hover:text-[#4cc9f0] transition-colors">
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
        </div>
      </div>
    </nav>
  );
}
