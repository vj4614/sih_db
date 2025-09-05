"use client";
import { useState } from "react";

export default function Researcher() {
  const [chatStarted, setChatStarted] = useState(false);

  const handleStartChat = () => {
    setChatStarted(true);
    const bg = document.getElementById("bg-canvas");
    if (bg) bg.style.filter = "blur(12px) brightness(0.8)";
  };

  return (
    <div className="p-6">
      {!chatStarted ? (
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Hello Researcher 🧑‍🔬</h1>
          <p className="mb-6">Your insights await. Start a conversation below.</p>
          <button
            onClick={handleStartChat}
            className="px-6 py-2 rounded-xl bg-green-600 text-white hover:shadow-lg"
          >
            Start Research Chat
          </button>
        </div>
      ) : (
        <div className="mt-6">
          {/* Replace with your actual Chat component */}
          <p className="text-gray-700">[Research chat window loads here...]</p>
        </div>
      )}
    </div>
  );
}
