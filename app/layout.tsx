import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Budget Tracker",
  description: "PH Semi-monthly budget tracker",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#2563eb" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Budget PH" />
        <link rel="apple-touch-icon" href="/icon.png" />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  );
}
