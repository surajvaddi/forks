import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Forks",
  description: "Project-based AI chat for forkable learning."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
