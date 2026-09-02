import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Signal-to-Noise",
  description: "AI-curated RSS research digest",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-black text-zinc-300 antialiased">{children}</body>
    </html>
  );
}
