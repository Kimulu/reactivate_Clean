// pages/_app.tsx

import dynamic from "next/dynamic";
import type { AppProps } from "next/app";
import { Provider } from "react-redux";
import Head from "next/head"; // ✅ 1. Import the Head component
import { AuthLoader } from "@/components/AuthLoader";
import { store } from "../store";
import "../styles/globals.css";
import { EsbuildProvider } from "@/context/EsbuildContext";

const DynamicToaster = dynamic(
  () => import("react-hot-toast").then((mod) => mod.Toaster),
  { ssr: false }
);

function MyApp({ Component, pageProps }: AppProps) {
  // ✅ 2. Define your site's absolute URL
  const siteUrl = "https://reactivate-two.vercel.app"; // 👈 IMPORTANT: Replace with your actual domain

  return (
    <Provider store={store}>
      {/* ✅ 3. Add the Head component here */}
      <Head>
        {/* --- Primary Meta Tags --- */}
        <title>Reactivate - The Ultimate React Challenge Platform</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta
          name="description"
          content="Test your React skills, solve challenges, and climb the leaderboard. Join our community of developers today!"
        />

        {/* --- Open Graph / Facebook Meta Tags --- */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content={siteUrl} />
        <meta
          property="og:title"
          content="Reactivate - The Ultimate React Challenge Platform"
        />
        <meta
          property="og:description"
          content="Test your React skills, solve challenges, and climb the leaderboard."
        />
        <meta
          property="og:image"
          content={`${siteUrl}/social-share-image.PNG`}
        />
        <meta property="og:site_name" content="Reactivate" />

        {/* --- Twitter Meta Tags --- */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:url" content={siteUrl} />
        <meta
          name="twitter:title"
          content="Reactivate - The Ultimate React Challenge Platform"
        />
        <meta
          name="twitter:description"
          content="Test your React skills, solve challenges, and climb the leaderboard."
        />
        <meta
          name="twitter:image"
          content={`${siteUrl}/social-share-image.PNG`}
        />
      </Head>

      <EsbuildProvider>
        <AuthLoader>
          <Component {...pageProps} />
          <DynamicToaster />
        </AuthLoader>
      </EsbuildProvider>
    </Provider>
  );
}

export default MyApp;
