import Navbar from "@/app/navbar";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import type { Metadata, Viewport } from "next";

export const viewport: Viewport = {
  themeColor: "#6366f1",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  title: "SmartMeet AI - Meeting Intelligence",
  description:
    "AI-powered meeting intelligence for transcription, summaries, decisions, and action items.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "SmartMeet AI",
  },
  icons: {
    icon: "/icon.svg",
    apple: "/icon.svg",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
      </head>
      <body>
        <Navbar />

        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
          }}
        />

        {children}
      </body>
    </html>
  );
}