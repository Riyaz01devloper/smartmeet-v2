import Navbar from "@/app/navbar";
import "./globals.css";
import { Toaster } from "react-hot-toast";
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Navbar />
        <Toaster position="top-right"/>

        {children}
      </body>
    </html>
  );
}