import type { Metadata } from "next";
import "./globals.css";
import Link from "next/link";

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
        <div className="bg-gold h-[2px]" />
        <nav className="broadcast-bar sticky top-0 z-50">
          <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-14">
              <Link href="/" className="flex items-center gap-3 group">
                <div className="relative">
                  <span className="text-2xl">🏆</span>
                </div>
                <div className="leading-none">
                  <div className="flex items-center gap-2">
                    <h1 className="text-gold font-black text-sm tracking-tight group-hover:text-gold-light transition-colors">
                      RSPI
                    </h1>
                    <span className="text-[9px] font-bold tracking-[0.2em] text-text-muted uppercase">
                      Senior Performance Index
                    </span>
                  </div>
                  <p className="text-[9px] text-text-muted tracking-[0.15em] uppercase mt-0.5">
                    Quantifying Greatness &mdash; Weekly
                  </p>
                </div>
              </Link>
              <div className="flex items-center gap-1">
                <div className="flex items-center gap-1.5 mr-4">
                  <div className="w-1.5 h-1.5 rounded-full bg-accent-green live-dot" />
                  <span className="text-[9px] font-bold tracking-[0.15em] text-accent-green uppercase">Live</span>
                </div>
                <Link
                  href="/"
                  className="text-text-secondary hover:text-text-primary transition-colors text-xs font-semibold tracking-wide uppercase px-3 py-1.5"
                >
                  Dashboard
                </Link>
                <Link
                  href="/add-round"
                  className="bg-gold/10 border border-gold/30 text-gold hover:bg-gold/20 hover:border-gold/50 px-3 py-1.5 text-xs font-bold tracking-wide uppercase transition-all"
                >
                  Submit Intel
                </Link>
              </div>
            </div>
          </div>
        </nav>
        <main className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {children}
        </main>
        {/* Bottom broadcast strip */}
        <div className="bg-gold/20 h-[1px] mt-12" />
        <footer className="text-center py-6">
          <p className="text-[10px] text-text-muted tracking-[0.2em] uppercase">
            The Russley Senior Performance Index™ &mdash; A Division of Absolutely Unnecessary Analytics Inc.
          </p>
        </footer>
      </body>
    </html>
  );
}
