import type { Metadata } from "next";
import { Poppins, Fira_Code } from "next/font/google"; // New fonts imported
import "./globals.css";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-poppins",
});

const firaCode = Fira_Code({
  subsets: ["latin"],
  variable: "--font-fira-code",
});

export const metadata: Metadata = {
  title: "FloatChat - AI-Powered Ocean Data Explorer",
  description: "An AI-powered conversational interface for ARGO ocean data discovery and visualization.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${poppins.variable} ${firaCode.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}