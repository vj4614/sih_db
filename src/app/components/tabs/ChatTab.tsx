"use client";

import React, { useState, useRef, useEffect, FC, FormEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Sparkles, SquarePlus } from "lucide-react";
import ChatVisuals from "../chat/ChatVisuals";
import ChatGreeting from "../chat/ChatGreeting";
import OceanLoadingAnimation from "../chat/OceanLoadingAnimation";
import InsightPanel from "@/app/components/InsightPanel";
import { getInsightForQuery, Insight } from "@/app/services/insightService";

// NavIcon for bot avatar
const NavIcon: FC = () => (
  <div className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center text-lg font-bold shadow-md">
    🌊
  </div>
);

interface ChatTabProps {
  messages?: any[];
  setMessages?: (msgs: any[]) => void;
  theme?: string;
  chatHasVisuals?: boolean;
  setChatHasVisuals?: (v: boolean) => void;
  handleNewChat?: () => void;
  triggerInsight?: (insight: Insight) => void;
  setIsChatting?: (val: boolean) => void; // merged from other branch
}

export default function ChatTab({
  messages: externalMessages,
  setMessages: externalSetMessages,
  theme = "dark",
  chatHasVisuals: externalChatHasVisuals,
  setChatHasVisuals: externalSetChatHasVisuals,
  handleNewChat,
  triggerInsight,
  setIsChatting,
}: ChatTabProps) {
  // Internal state fallback
  const [internalMessages, setInternalMessages] = useState<any[]>([]);
  const messages = externalMessages ?? internalMessages;
  const setMessages = externalSetMessages ?? setInternalMessages;

  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const [internalChatHasVisuals, setInternalChatHasVisuals] = useState(false);
  const chatHasVisuals = externalChatHasVisuals ?? internalChatHasVisuals;
  const setChatHasVisuals = externalSetChatHasVisuals ?? setInternalChatHasVisuals;

  const [activeInsight, setActiveInsight] = useState<Insight | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const getChatResponse = (message: string, insightContext: Insight | null = null) =>
    new Promise<string>((resolve) => {
      setTimeout(() => {
        if (insightContext) {
          resolve(`Follow-up on "${insightContext.title}": response to "${message}".`);
        } else {
          // Simple bot fallback
          const lower = message.toLowerCase();
          if (lower.includes("hello") || lower.includes("hi")) {
            resolve("Hello there! I'm FloatChat AI. How can I assist you with ARGO float data today?");
          } else if (lower.includes("meaning of life")) {
            resolve("As an AI, I don't ponder philosophy — but I can help you explore the ocean!");
          } else {
            resolve(`This is a mock response to: "${message}".`);
          }
        }
      }, 850);
    });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const pushMessage = (msg: any) => {
    setMessages((prev: any[]) => [...(prev ?? []), msg]);
  };

  const handleSubmit = async (e?: FormEvent) => {
    e?.preventDefault();
    if (!inputMessage.trim() || isLoading) return;

    const current = inputMessage;
    const userMessage = { id: (messages?.length ?? 0) + 1, text: current, sender: "user" };
    pushMessage(userMessage);
    setIsLoading(true);
    setInputMessage("");

    // mark chat as active after first user message
    if (messages.length === 0 && setIsChatting) {
      setIsChatting(true);
    }

    if (!activeInsight) {
      try {
        const potential = getInsightForQuery(current);
        if (potential) {
          if (triggerInsight) triggerInsight(potential);
          setActiveInsight(potential);
          setIsLoading(false);
          setChatHasVisuals(false);
          return;
        }
      } catch (err) {
        console.error("Insight service error:", err);
      }
    }

    const botText = await getChatResponse(current, activeInsight);
    const botMessage = { id: (messages?.length ?? 0) + 2, text: botText, sender: "bot" };
    pushMessage(botMessage);

    const lower = current.toLowerCase();
    const wantsVisual =
      lower.includes("plot") ||
      lower.includes("visual") ||
      lower.includes("profile") ||
      lower.includes("map") ||
      lower.includes("trajectory");
    setChatHasVisuals(wantsVisual);

    setIsLoading(false);
  };

  const closeInsight = () => setActiveInsight(null);

  const onNewChat = () => {
    if (handleNewChat) handleNewChat();
    else {
      setMessages([]);
      setChatHasVisuals(false);
      setActiveInsight(null);
    }
    if (setIsChatting) setIsChatting(false); // reset chat state
  };

  return (
    <div className="h-full w-full grid grid-cols-1 lg:grid-cols-3 lg:gap-6">
      {/* CHAT PANEL */}
      <motion.div
        layout
        className={activeInsight ? "lg:col-span-1" : "lg:col-span-3"}
        transition={{ duration: 0.5, ease: "easeInOut" }}
      >
        <div className="grid grid-rows-[auto_1fr_auto] h-full bg-card/80 backdrop-blur-lg rounded-2xl shadow-2xl shadow-primary/20 border border-white/10 dark:border-gray-800/20 p-4 sm:p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-white/10 dark:border-gray-700/50">
            <div className="flex items-center gap-3 text-lg font-semibold text-foreground/90">
              <Sparkles size={20} className="text-primary" />
              FloatChat AI
            </div>
            <button
              onClick={onNewChat}
              className="p-2 rounded-lg hover:bg-muted/50 transition-colors"
              title="New Chat"
            >
              <SquarePlus size={18} />
            </button>
          </div>

          {/* Messages */}
          <div className="overflow-y-auto pr-2 custom-scrollbar space-y-4">
            {(!messages || messages.length === 0) && !isLoading ? (
              <ChatGreeting />
            ) : (
              messages.map((message) => (
                <div
                  key={message.id ?? message.text}
                  className={`flex items-start gap-3 ${
                    message.sender === "user" ? "justify-end" : "justify-start"
                  } animate-fade-in`}
                >
                  {message.sender !== "user" && (
                    <div className="flex-shrink-0">
                      <NavIcon />
                    </div>
                  )}
                  <div
                    className={`max-w-[85%] px-4 py-3 rounded-xl text-base relative break-words ${
                      message.sender === "user"
                        ? "bg-gradient-to-br from-teal-400 to-cyan-500 text-white"
                        : "bg-gradient-to-br from-blue-700 to-indigo-800 text-slate-200"
                    }`}
                  >
                    <p className={message.sender !== "user" ? "font-mono" : "font-medium"}>
                      {message.text}
                    </p>
                  </div>
                </div>
              ))
            )}
            {isLoading && (
              <div className="flex items-start gap-3 justify-start animate-fade-in">
                <div className="flex-shrink-0">
                  <NavIcon />
                </div>
                <div className="max-w-[85%] px-4 py-3 rounded-xl text-base bg-gradient-to-br from-blue-700 to-indigo-800 text-slate-200">
                  <OceanLoadingAnimation />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form
            onSubmit={handleSubmit}
            className="mt-4 pt-3 border-t border-white/10 dark:border-gray-700/50 flex items-center gap-3"
          >
            <div className="relative flex-1">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder={
                  activeInsight
                    ? "Ask a follow-up about the insight..."
                    : "Ask about ocean data..."
                }
                className="w-full pl-4 pr-12 py-2 bg-background/50 border border-white/10 dark:border-gray-700/50 rounded-full text-md focus:outline-none focus:ring-2 focus:ring-primary transition-shadow duration-150"
                disabled={isLoading}
              />
              <button
                type="submit"
                className={`absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full transition-transform duration-150 ${
                  inputMessage.trim() && !isLoading
                    ? "bg-primary text-primary-foreground hover:scale-105"
                    : "bg-muted text-muted-foreground cursor-not-allowed"
                }`}
                disabled={!inputMessage.trim() || isLoading}
              >
                <Send size={18} />
              </button>
            </div>
          </form>
        </div>
      </motion.div>

      {/* INSIGHT / VISUALS */}
      <AnimatePresence>
        {activeInsight ? (
          <motion.div
            layout
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="hidden lg:col-span-2 lg:block"
            transition={{ duration: 0.5, ease: "easeInOut" }}
          >
            <InsightPanel insight={activeInsight} onClose={closeInsight} />
          </motion.div>
        ) : (
          chatHasVisuals && (
            <motion.div
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="lg:col-span-2 hidden lg:block"
              transition={{ duration: 0.3 }}
            >
              <ChatVisuals theme={theme} />
            </motion.div>
          )
        )}
      </AnimatePresence>
    </div>
  );
}
