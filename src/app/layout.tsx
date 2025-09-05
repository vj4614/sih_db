import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import BackgroundCanvas from "./components/BackgroundCanvas";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Chatbot",
  description: "AI-powered chatbot",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <BackgroundCanvas />
        {children}
      </body>
    </html>
  );
}
