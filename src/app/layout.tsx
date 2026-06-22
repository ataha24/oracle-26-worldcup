import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Nav } from "@/components/Nav";
import { FORECAST } from "@/lib/forecast";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "ORACLE '26 — The World Cup 2026 Prediction Engine",
  description:
    "A live Monte-Carlo forecast of the 2026 FIFA World Cup. Real results, 50,000 simulated tournaments, title odds, group projections, the full bracket, and a head-to-head predictor.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Nav dataThrough={FORECAST.dataThrough} matchesPlayed={FORECAST.matchesPlayed} />
        <main className="flex-1 w-full">{children}</main>
        <footer className="border-t border-line/70 mt-20">
          <div className="max-w-6xl mx-auto px-5 py-8 text-sm text-mute flex flex-col sm:flex-row gap-3 justify-between">
            <p>
              <span className="wordmark font-bold">ORACLE ’26</span> · a probabilistic
              forecast engine. Not affiliated with FIFA.
            </p>
            <p>
              Results through {FORECAST.dataThrough} · {FORECAST.iterations.toLocaleString()}{" "}
              simulations · model: Elo → Poisson → Monte Carlo
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
