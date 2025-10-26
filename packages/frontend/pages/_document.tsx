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

        {/* Theme color for mobile browsers */}
        <meta name="theme-color" content="#000000" />

        {/* Site description */}
        <meta
          name="description"
          content="Reactivate — the next generation web platform"
        />

        {/* ✅ Google Fonts (Chicle + JetBrains Mono + Inter) */}
        <link
          href="https://fonts.googleapis.com/css2?family=Chicle&family=JetBrains+Mono:ital,wght@0,100..800;1,100..800&family=Oswald:wght@200..700&family=Saira:ital,wght@0,100..900;1,100..900&display=swap"
          rel="stylesheet"
        />
      </Head>

      <body className="antialiased bg-black text-white overflow-x-hidden">
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
