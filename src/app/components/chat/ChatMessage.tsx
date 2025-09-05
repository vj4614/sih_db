"use client";
import { useEffect, useRef } from "react";
import anime from "animejs";

export default function ChatMessage({
  text,
  isUser,
}: {
  text: string;
  isUser?: boolean;
}) {
  const msgRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (msgRef.current) {
      anime({
        targets: msgRef.current,
        translateY: [20, 0],
        opacity: [0, 1],
        easing: "easeOutQuad",
        duration: 500,
      });
    }
  }, []);

  return (
    <div
      ref={msgRef}
      className={`p-3 my-2 rounded-xl max-w-[75%] ${
        isUser ? "ml-auto bg-blue-600 text-white" : "mr-auto bg-gray-200 text-black"
      }`}
    >
      {text}
    </div>
  );
}
