import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "JobMatch Demo",
  description: "Match candidates to jobs with a transparent score. A demo of AI-driven development.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <header className="site-header">
          <Link href="/" className="brand">
            <span className="brand-mark">◆</span> JobMatch
          </Link>
          <span className="tag">demo</span>
        </header>
        <main className="container">{children}</main>
        <footer className="site-footer">
          Built with Next.js · tested with Vitest · shipped by GitHub Actions
        </footer>
      </body>
    </html>
  );
}
