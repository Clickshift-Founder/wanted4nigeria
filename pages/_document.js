import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        {/* Museo Sans: add your font files to /public/fonts/ and uncomment below */}
        {/* <style>{`
          @font-face { font-family:'MuseoSans'; font-weight:300; font-style:normal;
            src: url('/fonts/MuseoSans-300.woff2') format('woff2'), url('/fonts/MuseoSans-300.woff') format('woff'); }
          @font-face { font-family:'MuseoSans'; font-weight:900; font-style:normal;
            src: url('/fonts/MuseoSans-900.woff2') format('woff2'), url('/fonts/MuseoSans-900.woff') format('woff'); }
        `}</style> */}

        {/* Interim web font (Nunito) — close to Museo Sans in feel */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Nunito:wght@300;400;700;900&family=Bebas+Neue&display=swap"
          rel="stylesheet"
        />
        <meta name="theme-color" content="#0D0D0D" />
        <link rel="icon" type="image/jpeg" href="/sppg-logo.jpg" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
