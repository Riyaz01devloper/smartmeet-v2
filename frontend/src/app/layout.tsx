import Navbar from "@/app/navbar";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "SmartMeet AI",
  description:
    "AI-powered meeting intelligence for transcription, summaries, decisions, and action items.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
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