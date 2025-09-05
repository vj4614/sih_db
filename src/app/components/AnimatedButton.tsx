"use client";
import { useEffect, useRef } from "react";
import anime from "animejs";

export default function AnimatedButton({
  children,
  onClick,
}: {
  children: React.ReactNode;
  onClick?: () => void;
}) {
  const btnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (btnRef.current) {
      btnRef.current.addEventListener("mouseenter", () => {
        anime({
          targets: btnRef.current,
          scale: 1.1,
          duration: 300,
          easing: "easeOutQuad",
        });
      });
      btnRef.current.addEventListener("mouseleave", () => {
        anime({
          targets: btnRef.current,
          scale: 1,
          duration: 300,
          easing: "easeOutQuad",
        });
      });
    }
  }, []);

  return (
    <button
      ref={btnRef}
      onClick={onClick}
      className="px-4 py-2 rounded-xl bg-blue-500 text-white hover:shadow-lg"
    >
      {children}
    </button>
  );
}
