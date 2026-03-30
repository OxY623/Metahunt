import type { Metadata, Viewport } from "next";
import { Orbitron, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { SiteChrome } from "../widgets/site/SiteChrome";

const orbitron = Orbitron({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["400", "500", "600", "700"],
});
const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

export const viewport: Viewport = {
  themeColor: "#ffffff",
};

export const metadata: Metadata = {
  title: "MetaHunt",
  description: "Городская MMO — охоться, следи, доминируй в цифровом городе",
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-96x96.png", sizes: "96x96", type: "image/png" },
      { url: "/android-icon-192x192.png", sizes: "192x192", type: "image/png" },
    ],
    apple: [
      { url: "/apple-icon-57x57.png", sizes: "57x57" },
      { url: "/apple-icon-60x60.png", sizes: "60x60" },
      { url: "/apple-icon-72x72.png", sizes: "72x72" },
      { url: "/apple-icon-76x76.png", sizes: "76x76" },
      { url: "/apple-icon-114x114.png", sizes: "114x114" },
      { url: "/apple-icon-120x120.png", sizes: "120x120" },
      { url: "/apple-icon-144x144.png", sizes: "144x144" },
      { url: "/apple-icon-152x152.png", sizes: "152x152" },
      { url: "/apple-icon-180x180.png", sizes: "180x180" },
    ],
  },
  other: {
    "msapplication-TileColor": "#ffffff",
    "msapplication-TileImage": "/ms-icon-144x144.png",
  },
};
//linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.9)),
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <body
        className={`${orbitron.variable} ${jetbrains.variable} font-sans antialiased relative min-h-screen overflow-x-hidden text-text-primary`}
      >
        <div className="fixed inset-0 -z-10">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: "var(--meta-bg-image)",
              animation: "bgFloat 25s ease-in-out infinite",
            }}
          />
          <div
            className="absolute inset-0"
            style={{ backgroundImage: "var(--hero-halo)" }}
          />
          <div className="absolute inset-0 bg-black/70" />
          <div
            className="absolute inset-0 bg-linear-to-br from-purple-600/20 via-cyan-400/10 to-pink-500/20"
            style={{ animation: "glowPulse 10s ease-in-out infinite" }}
          />
        </div>

        <div className="relative z-10">
          <SiteChrome>{children}</SiteChrome>
        </div>
      </body>
    </html>
  );
}
