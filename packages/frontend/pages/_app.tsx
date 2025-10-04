// pages/_app.tsx
import dynamic from "next/dynamic";
import type { AppProps } from "next/app";
import { Provider } from "react-redux";
import { AuthLoader } from "@/components/AuthLoader";
import { store } from "../store";
import "../styles/globals.css";
import { EsbuildProvider } from "@/context/EsbuildContext";

const Toaster = dynamic(
  () => import("react-hot-toast").then((mod) => mod.Toaster),
  { ssr: false }
);

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <Provider store={store}>
      <EsbuildProvider>
        <AuthLoader>
          <Component {...pageProps} />
          <Toaster />
        </AuthLoader>
      </EsbuildProvider>
    </Provider>
  );
}

export default MyApp;
