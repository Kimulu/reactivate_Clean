// pages/_app.tsx
import type { AppProps } from "next/app";
import { Provider } from "react-redux";
import { AuthLoader } from "@/components/AuthLoader";
import { store } from "../store";
import { Toaster } from "react-hot-toast";
import "../styles/globals.css";
import { EsbuildProvider } from "@/context/EsbuildContext";

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <Provider store={store}>
      <AuthLoader>
        <EsbuildProvider>
          <Component {...pageProps} />
          <Toaster />
        </EsbuildProvider>
      </AuthLoader>
    </Provider>
  );
}

export default MyApp;
