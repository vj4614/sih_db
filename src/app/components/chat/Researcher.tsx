"use client";

import React, { useEffect, useRef, useState } from "react";
import ChatVisuals from "./ChatVisuals";
import ChatMessage from "./ChatMessage";

type Msg = {
  id: string;
  role: "assistant" | "user";
  text?: string;
  kind?: "graph-options";
};

const uid = () => Math.random().toString(36).slice(2, 9);

export default function Researcher() {
  const [started, setStarted] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([
    {
      id: uid(),
      role: "assistant",
      text: "Hi — ask me questions, or type `graph` to see options.",
    },
  ]);
  const [input, setInput] = useState("");
  const [showVisuals, setShowVisuals] = useState(false);
  const [selectedGraph, setSelectedGraph] = useState<string | null>(null);

  const messagesRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (messagesRef.current) {
      messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
    }
  }, [messages, showVisuals]);

  // Blur background when chat starts
  useEffect(() => {
    const bg = document.getElementById("bg-canvas");
    if (!bg) return;
    bg.style.filter = started ? "blur(12px) brightness(0.82)" : "";
  }, [started]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg = input.trim();
    setMessages((m) => [...m, { id: uid(), role: "user", text: userMsg }]);
    setInput("");

    if (/^graph$/i.test(userMsg)) {
      // Instead of showing visuals, add special assistant message with graph options
      setMessages((m) => [
        ...m,
        { id: uid(), role: "assistant", kind: "graph-options" },
      ]);
      return;
    }

    // Normal assistant reply
    setTimeout(() => {
      setMessages((m) => [
        ...m,
        {
          id: uid(),
          role: "assistant",
          text: `I heard: "${userMsg}". Type "graph" to see graph options.`,
        },
      ]);
    }, 400);
  }

  function handleGraphChoice(choice: string) {
    setMessages((m) => [
      ...m,
      { id: uid(), role: "assistant", text: `Opening ${choice} graph...` },
    ]);
    setSelectedGraph(choice);
    setShowVisuals(true);
  }

  return (
    <div className="p-6">
      {!started ? (
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-3">Research Chat</h2>
          <p className="text-sm text-muted-foreground mb-6">
            Start an interactive research session with the assistant.
          </p>
          <button
            onClick={() => setStarted(true)}
            className="px-6 py-3 rounded-xl bg-green-600 text-white hover:shadow-lg transition"
          >
            Start Research Chat
          </button>
        </div>
      ) : (
        <div className="flex gap-4 h-[72vh]">
          {/* Chat column */}
          <div
            className={`flex flex-col bg-card rounded-xl shadow-lg transition-all duration-300 overflow-hidden ${
              showVisuals ? "w-1/3" : "w-full md:w-1/2"
            }`}
          >
            <div className="px-4 py-3 border-b">
              <h3 className="font-semibold">Research Assistant</h3>
            </div>

            <div
              ref={messagesRef}
              className="flex-1 overflow-auto p-4 space-y-3"
            >
              {messages.map((m) =>
                m.kind === "graph-options" ? (
                  <div key={m.id} className="bg-indigo-50 p-3 rounded-lg">
                    <div className="font-medium mb-2">Choose a graph:</div>
                    <div className="flex flex-col gap-2">
                      <button
                        onClick={() => handleGraphChoice("temp")}
                        className="px-3 py-2 rounded-md bg-white border text-left"
                      >
                        Temp vs Depth
                      </button>
                      <button
                        onClick={() => handleGraphChoice("salinity")}
                        className="px-3 py-2 rounded-md bg-white border text-left"
                      >
                        Salinity vs Depth
                      </button>
                      <button
                        onClick={() => handleGraphChoice("time")}
                        className="px-3 py-2 rounded-md bg-white border text-left"
                      >
                        Time Series
                      </button>
                    </div>
                  </div>
                ) : (
                  <ChatMessage key={m.id} role={m.role} text={m.text ?? ""} />
                )
              )}
            </div>

            <form
              onSubmit={handleSubmit}
              className="px-4 py-3 border-t flex items-center gap-3"
            >
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder='Type a message or "graph" to see options'
                className="flex-1 px-3 py-2 rounded-md border bg-white/80 focus:outline-none"
              />
              <button
                type="submit"
                className="px-4 py-2 rounded-md bg-blue-600 text-white"
              >
                Send
              </button>
            </form>
          </div>

          {/* Graph visuals panel */}
          {showVisuals && (
            <div className="flex-1 bg-card rounded-xl shadow-lg p-3 flex flex-col">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold">Visuals</h4>
                <button
                  onClick={() => {
                    setShowVisuals(false);
                    setSelectedGraph(null);
                  }}
                  className="px-3 py-1 rounded-md border"
                >
                  Close
                </button>
              </div>
              <div className="flex-1 overflow-hidden">
                {/* Pass selected graph to ChatVisuals */}
                <ChatVisuals selectedGraph={selectedGraph} theme="light" />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
