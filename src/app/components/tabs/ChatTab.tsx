// src/app/components/tabs/ChatTab.tsx

"use client";

import React, { useState, useRef, useEffect, FC } from "react";
import dynamic from "next/dynamic";
import { Send, Sparkles, SquarePlus } from "lucide-react";
import ChatGreeting from "../chat/ChatGreeting";
import OceanLoadingAnimation from "../chat/OceanLoadingAnimation";
import { AIMessage, HistoryItem } from "@/app/types";
import SuggestedPrompts from "../chat/SuggestedPrompts"; // Import the new component

const ChatVisuals = dynamic(() => import("../chat/ChatVisuals"), { ssr: false });

const NavIcon: FC = () => (
    <div className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center text-lg font-bold shadow-md">
      🌊
    </div>
);

export default function ChatTab({ messages, setMessages, theme, handleNewChat, setIsChatting }) {
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [activeGraphData, setActiveGraphData] = useState(null);
  const messagesEndRef = useRef(null);
  const formRef = useRef<HTMLFormElement>(null); // Ref for the form

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, activeGraphData]);

  const getGeminiResponse = async (userMessage: string) => {
    setIsLoading(true);
    setActiveGraphData(null); 

    if (messages.length === 0) {
      setIsChatting(true);
    }

    const botMessageId = crypto.randomUUID();
    setMessages((prevMessages) => [
      ...prevMessages,
      { id: botMessageId, text: "", sender: "bot", graphData: null },
    ]);
    
    const history: HistoryItem[] = messages
      .slice(-6) 
      .map(msg => ({
        role: msg.sender === 'user' ? 'user' : 'model',
        parts: [{ text: msg.text }]
      }));

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: userMessage, history }),
      });

      if (!response.ok || !response.body) {
        throw new Error(`Error: ${response.statusText}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullResponse = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        fullResponse += decoder.decode(value, { stream: true });

        setMessages((prevMessages) =>
          prevMessages.map((msg) =>
            msg.id === botMessageId ? { ...msg, text: fullResponse } : msg
          )
        );
      }
      
      const data: AIMessage = JSON.parse(fullResponse);
      
      setMessages((prevMessages) =>
        prevMessages.map((msg) =>
          msg.id === botMessageId ? { ...msg, text: data.text, graphData: data.graphData || null } : msg
        )
      );

      if (data.graphData) {
        setActiveGraphData(data.graphData);
      }

    } catch (error) {
      console.error("Failed to get Gemini response:", error);
      const errorResponse = { id: botMessageId, text: "I'm sorry, an error occurred. Please try again.", sender: "bot" };
      setMessages((prevMessages) => 
        prevMessages.map(msg => msg.id === botMessageId ? errorResponse : msg)
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const messageToSend = inputMessage.trim();
    if (messageToSend && !isLoading) {
      const newUserMessage = { id: crypto.randomUUID(), text: messageToSend, sender: "user" };
      setMessages((prevMessages) => [...prevMessages, newUserMessage]);
      getGeminiResponse(messageToSend);
      setInputMessage("");
    }
  };
  
  // New handler for suggested prompts
  const handleSuggestionClick = (prompt: string) => {
    setInputMessage(prompt);
    // Use a timeout to allow the input state to update before submitting
    setTimeout(() => {
      formRef.current?.requestSubmit();
    }, 0);
  };
  
  const handleNewChatWithReset = () => {
    handleNewChat();
    setActiveGraphData(null);
  }

  const handleClosePanel = () => {
    setActiveGraphData(null);
  };

  const isPanelOpen = activeGraphData !== null;

  return (
    <div className="grid md:grid-cols-5 gap-6 h-full">
      <div className={`flex flex-col h-full bg-card/80 backdrop-blur-lg rounded-2xl shadow-lg shadow-cyan-400/15 p-6 sm:p-8 relative transition-all duration-500 ${isPanelOpen ? 'md:col-span-3' : 'md:col-span-5'}`}>
        <div className="flex items-center justify-between text-xl font-semibold text-foreground/80 mb-6 pb-4 border-b border-white/10 dark:border-gray-700/50">
          <div className="flex items-center">
            <Sparkles size={24} className="mr-3 text-primary" />
            FloatChat AI
          </div>
          <button onClick={handleNewChatWithReset} className="p-2 rounded-lg hover:bg-muted/50 transition-colors" title="New Chat">
            <SquarePlus size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-6">
          {messages.length === 0 && !isLoading ? (
            <>
              <ChatGreeting />
              <SuggestedPrompts onPromptClick={handleSuggestionClick} />
            </>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={`flex items-start gap-3 ${message.sender === "user" ? "justify-end" : "justify-start"} animate-fade-in`}
              >
                {message.sender === 'bot' && (
                    <div className="flex-shrink-0">
                        <NavIcon />
                    </div>
                )}
                <div
                  className={`max-w-[85%] px-5 py-3 rounded-xl text-base relative group
                    ${
                      message.sender === "user"
                        ? 'bg-gradient-to-br from-teal-400 to-cyan-500 text-white'
                        : 'bg-gradient-to-br from-blue-700 to-indigo-800 text-slate-200'
                    }`}
                >
                  <p className={message.sender === 'bot' ? 'font-mono' : 'font-medium'}>{message.text}</p>
                </div>
              </div>
            ))
          )}
          {isLoading && messages.length > 0 && messages[messages.length - 1].sender !== 'bot' && (
             <div className="flex items-start gap-3 justify-start animate-fade-in">
                <div className="flex-shrink-0">
                    <NavIcon />
                </div>
                <div className={`max-w-[85%] px-5 py-3 rounded-xl text-base relative group bg-gradient-to-br from-blue-700 to-indigo-800 text-slate-200`}>
                    <OceanLoadingAnimation />
                </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <form ref={formRef} onSubmit={handleSendMessage} className="mt-6 pt-4 border-t border-white/10 dark:border-gray-700/50 flex items-center gap-4">
          <div className="relative flex-1">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Ask for data or a graph..."
              className="w-full pl-5 pr-12 py-3 bg-background/50 border border-white/10 dark:border-gray-700/50 rounded-full text-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 shadow-md placeholder-muted-foreground"
              disabled={isLoading}
            />
            <button
              type="submit"
              className={`absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full transition-all duration-200 transform ${
                inputMessage.trim() && !isLoading
                  ? "bg-primary text-primary-foreground hover:scale-110"
                  : "bg-muted text-muted-foreground cursor-not-allowed"
              }`}
              disabled={!inputMessage.trim() || isLoading}
            >
              <Send size={20} />
            </button>
          </div>
        </form>
      </div>
      {isPanelOpen && (
        <div className="md:col-span-2 h-full">
          <ChatVisuals
            theme={theme}
            graphData={activeGraphData}
            onClose={handleClosePanel}
          />
        </div>
      )}
    </div>
  );
}