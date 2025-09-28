// context/EsbuildContext.tsx
import React, { createContext, useContext, useEffect, useState } from "react";
import * as esbuild from "esbuild-wasm";

type EsbuildContextType = {
  esbuildReady: boolean;
};

const EsbuildContext = createContext<EsbuildContextType>({
  esbuildReady: false,
});

let esbuildInitialized = false; // ✅ guard across the whole app

export const EsbuildProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [esbuildReady, setEsbuildReady] = useState(false);

  useEffect(() => {
    const initEsbuild = async () => {
      if (esbuildInitialized) {
        setEsbuildReady(true);
        return;
      }
      try {
        await esbuild.initialize({
          wasmURL: "/esbuild.wasm",
          worker: true,
        });
        esbuildInitialized = true;
        setEsbuildReady(true);
        console.log("✅ Esbuild initialized globally via context");
      } catch (err: any) {
        if (err?.message?.includes("Initialize was called more than once")) {
          esbuildInitialized = true;
          setEsbuildReady(true);
          console.warn("⚠️ Esbuild already initialized, skipping.");
        } else {
          console.error("Esbuild init error:", err);
        }
      }
    };

    initEsbuild();
  }, []);

  return (
    <EsbuildContext.Provider value={{ esbuildReady }}>
      {children}
    </EsbuildContext.Provider>
  );
};

export const useEsbuild = () => useContext(EsbuildContext);
