import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="en" className="overflow-x-hidden scroll-smooth">
      <Head>
        {/* Charset for correct text encoding */}
        <meta charSet="UTF-8" />

        {/* Viewport for mobile responsiveness */}
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0, maximum-scale=1.0"
        />

        {/* Optional: theme color for mobile browsers */}
        <meta name="theme-color" content="#000000" />

        {/* Optional: site description */}
        <meta
          name="description"
          content="Reactivate — the next generation web platform"
        />
      </Head>
      <body className="antialiased bg-black text-white overflow-x-hidden">
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
