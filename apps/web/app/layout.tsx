import type { Metadata } from "next";
import { Orbitron, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const orbitron = Orbitron({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["400", "500", "600", "700"],
});
const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "MetaHunt",
  description: "Городская MMO — охоться, следи, доминируй в цифровом городе",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <body className={`${orbitron.variable} ${jetbrains.variable} font-sans antialiased relative min-h-screen overflow-hidden text-text-primary`}>
        {/* Фоновый слой */}
        <div className="fixed inset-0 -z-10">
          
          {/* Картинка */}
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: "url('/bg.png')", animation: "bgFloat 25s ease-in-out infinite" }}
          />

          {/* Затемнение */}
          <div className="absolute inset-0 bg-black/70" />
          
          {/* Лёгкое неоновое свечение */}
          <div className="absolute inset-0 bg-linear-to-br from-purple-600/20 via-cyan-400/10 to-pink-500/20" style={{animation: "glowPulse 10s ease-in-out infinite"}} />
        </div>

        {/* Контент поверх */}
        <div className="relative z-10">
          {children}
        </div>
      </body>
    </html>
  );
}
