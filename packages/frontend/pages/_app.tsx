// pages/_app.tsx
import type { AppProps } from "next/app";
import { Toaster } from "react-hot-toast";
import "../styles/globals.css";
import { EsbuildProvider } from "@/context/EsbuildContext";

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <EsbuildProvider>
      <Component {...pageProps} />
      <Toaster />
    </EsbuildProvider>
  );
}

export default MyApp;
