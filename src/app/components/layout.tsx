"use client";
import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import BackgroundCanvas from "./components/BackgroundCanvas";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

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
  const pathname = usePathname();
  const [chatting, setChatting] = useState(false);

  // Sections where blur is always on
  const alwaysBlur = ["/compare", "/insight", "/visual"];

  useEffect(() => {
    const bg = document.getElementById("bg-canvas");
    if (!bg) return;

    if (alwaysBlur.some((p) => pathname.startsWith(p))) {
      bg.style.filter = "blur(12px) brightness(0.8)";
    } else if (pathname.startsWith("/newbie") || pathname.startsWith("/researcher")) {
      bg.style.filter = chatting ? "blur(12px) brightness(0.8)" : "none";
    } else {
      bg.style.filter = "none";
    }
  }, [pathname, chatting]);

  return (
    <html lang="en">
      <body className={inter.className}>
        <BackgroundCanvas />
        {/* Provide chatting state to children */}
        {children}
      </body>
    </html>
  );
}
