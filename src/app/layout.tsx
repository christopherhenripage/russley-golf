import type { Metadata } from "next";
import "./globals.css";
import Link from "next/link";

export const metadata: Metadata = {
  title: "The Russley Senior Performance Index™",
  description: "Quantifying Greatness. Weekly.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">
        <nav className="border-b border-border bg-bg-card/80 backdrop-blur-sm sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <Link href="/" className="flex items-center gap-3 group">
                <span className="text-2xl">🏆</span>
                <div>
                  <h1 className="text-gold font-bold text-lg leading-tight group-hover:text-gold-light transition-colors">
                    The Russley Senior Performance Index™
                  </h1>
                  <p className="text-text-secondary text-xs italic">
                    Quantifying Greatness. Weekly.
                  </p>
                </div>
              </Link>
              <div className="flex items-center gap-6">
                <Link
                  href="/"
                  className="text-text-secondary hover:text-gold transition-colors text-sm font-medium"
                >
                  Dashboard
                </Link>
                <Link
                  href="/add-round"
                  className="bg-gold/10 border border-gold/30 text-gold hover:bg-gold/20 px-4 py-2 rounded-lg text-sm font-medium transition-all"
                >
                  + Add Round
                </Link>
              </div>
            </div>
          </div>
        </nav>
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>
      </body>
    </html>
  );
}
