import type { Metadata } from "next";
import "./globals.css";
import Link from "next/link";
import BottomNav from "@/components/BottomNav";

export const metadata: Metadata = {
  title: "RSPI | The Russley Senior Performance Index™",
  description: "Quantifying Greatness. Weekly. | Christchurch, NZ",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">
        {/* Top broadcast strip */}
        <div className="bg-gold h-[4px]" />
        <nav className="broadcast-bar sticky top-0 z-50">
          <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-14 md:h-16">
              <Link href="/" className="flex items-center gap-2.5 group">
                <span className="text-2xl md:text-3xl">🏆</span>
                <div className="leading-none">
                  <h1 className="text-gold font-black text-base md:text-lg tracking-tight group-hover:text-gold-light transition-colors">
                    RSPI
                  </h1>
                  <p className="text-[8px] md:text-[9px] text-text-muted tracking-[0.12em] uppercase mt-0.5 hidden sm:block">
                    Quantifying Greatness — Weekly
                  </p>
                </div>
              </Link>
              <div className="flex items-center gap-2">
                {/* LIVE badge */}
                <div className="flex items-center gap-1.5 mr-2 bg-accent-green/10 border border-accent-green/30 px-2.5 py-1 rounded-sm">
                  <div className="w-2 h-2 rounded-full bg-accent-green live-dot" />
                  <span className="text-[10px] font-black tracking-[0.12em] text-accent-green uppercase">Live</span>
                </div>
                {/* Desktop nav links */}
                <Link
                  href="/dashboard"
                  className="hidden md:block text-text-secondary hover:text-gold transition-colors text-xs font-bold tracking-wider uppercase px-3 py-2"
                >
                  Dashboard
                </Link>
                <Link
                  href="/add-round"
                  className="hidden md:block bg-gold/15 border-2 border-gold/40 text-gold hover:bg-gold/25 hover:border-gold/60 px-4 py-2 text-xs font-black tracking-wider uppercase transition-all"
                >
                  Submit Intel
                </Link>
              </div>
            </div>
          </div>
        </nav>
        <main className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-6 pb-24 md:pb-6">
          {children}
        </main>
        {/* Bottom broadcast strip — desktop only */}
        <div className="hidden md:block">
          <div className="gold-divider mt-12" />
          <footer className="text-center py-8">
            <p className="text-[11px] text-text-muted tracking-[0.2em] uppercase font-bold">
              The Russley Senior Performance Index™ &mdash; A Division of Absolutely Unnecessary Analytics Inc.
            </p>
            <p className="text-[9px] text-text-muted/60 tracking-[0.15em] uppercase mt-2">
              Christchurch, New Zealand &mdash; Est. 2026
            </p>
          </footer>
        </div>
        {/* Mobile bottom nav */}
        <BottomNav />
      </body>
    </html>
  );
}
