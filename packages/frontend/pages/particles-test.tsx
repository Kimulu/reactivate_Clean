// src/app/ParticlesTest.jsx (or equivalent file)

"use client";

// 1. Import the new self-contained component
import ConnectParticles from "@/components/ConnectParticles";

// 2. We no longer need to import the options object
// import connectPattern from "@/particles/connectPattern";
// import ParticlesBackground from "@/components/ParticlesBackground"; // We use ConnectParticles directly

export default function ParticlesTest() {
  return (
    // The container provides the bounds for the particles
    <div className="relative h-screen w-screen bg-[#0f0f23] overflow-hidden">
      {/* 🚀 Render the new ConnectParticles component */}
      {/* It now contains its own options and initialization logic */}
      <ConnectParticles
        id="test-connect-particles"
        style={{
          position: "absolute",
          width: "100%",
          height: "100%",
          top: 0,
          left: 0,
          zIndex: 0, // Keeps it behind the content
        }}
      />

      {/* Overlay some text to confirm layering */}
      <div className="absolute inset-0 flex items-center justify-center z-10">
        <h1 className="text-3xl sm:text-5xl font-bold text-[#06ffa5]">
          Connect Particle Test Page 🔗
        </h1>
      </div>
    </div>
  );
}
