// context/EsbuildContext.tsx
import React, { createContext, useContext, useEffect, useState } from "react";
import * as esbuild from "esbuild-wasm";

type EsbuildContextType = {
  esbuildReady: boolean;
  // You might want to add a build function or similar here later
  // buildCode: (rawCode: string) => Promise<string>;
};

const EsbuildContext = createContext<EsbuildContextType>({
  esbuildReady: false,
});

// 💡 FIX 1: Use a module-level variable to guard across the entire app instance.
// This variable will retain its state across renders and component lifecycles.
let esbuildInitialized = false;

export const EsbuildProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [esbuildReady, setEsbuildReady] = useState(false);

  useEffect(() => {
    const initEsbuild = async () => {
      // 💡 FIX 2: Ensure this only runs on the client-side
      if (typeof window === "undefined") {
        return;
      }

      // 💡 FIX 3: If already initialized (either by this component or another instance),
      // just set the ready state and return. No need to attempt re-initialization.
      if (esbuildInitialized) {
        setEsbuildReady(true);
        return;
      }

      try {
        await esbuild.initialize({
          wasmURL: "/esbuild.wasm",
          worker: true,
        });
        esbuildInitialized = true; // Mark as initialized upon successful call
        setEsbuildReady(true);
        console.log("✅ Esbuild initialized successfully.");
      } catch (err: any) {
        // 💡 FIX 4: Handle the "already initialized" error more robustly if it still occurs
        // This catch block is primarily for *initialization failures*, not for "already initialized"
        // since we guard against that with `esbuildInitialized` flag.
        // However, if some other part of the app somehow initializes it, this catches it.
        if (err?.message?.includes("Initialize was called more than once")) {
          // This specific error means it WAS initialized, just not by this specific call.
          // So, we can safely set the flag and ready state.
          esbuildInitialized = true;
          setEsbuildReady(true);
          console.warn(
            "⚠️ Esbuild was already initialized by another part of the app or previous render, skipping."
          );
        } else {
          console.error("❌ Esbuild initialization error:", err);
          // You might want to set `esbuildReady(false)` here or handle the error
          // to display a message to the user that Esbuild features won't work.
        }
      }
    };

    initEsbuild();
  }, []); // 💡 FIX 5: Empty dependency array ensures this runs only once on mount

  return (
    <EsbuildContext.Provider value={{ esbuildReady }}>
      {children}
    </EsbuildContext.Provider>
  );
};

export const useEsbuild = () => {
  const context = useContext(EsbuildContext);
  // 💡 FIX 6: Add a check for undefined context, which is good practice
  if (context === undefined) {
    throw new Error("useEsbuild must be used within an EsbuildProvider");
  }
  return context;
};
