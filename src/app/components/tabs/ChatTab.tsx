"use client";

import React, { useState, useRef, useEffect, FC } from "react";
import dynamic from "next/dynamic";
import { Send, Sparkles, SquarePlus, X, Route } from "lucide-react";
import ChatGreeting from "../chat/ChatGreeting";
import OceanLoadingAnimation from "../chat/OceanLoadingAnimation";
import ChatOptions from "../chat/ChatOptions";
import ChatDataOptions from "../chat/ChatDataOptions";

// Dynamically import client-side-only components
const ChatVisuals = dynamic(() => import("../chat/ChatVisuals"), { ssr: false });
const ChatDataViewer = dynamic(() => import("../chat/ChatDataViewer"), { ssr: false });

// Define the NavIcon for the bot's avatar
const NavIcon: FC = () => (
    <div className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center text-lg font-bold shadow-md">
      🌊
    </div>
);


export default function ChatTab({ messages, setMessages, theme, selectedVisual, setSelectedVisual, handleNewChat, setIsChatting, floats, mapCenter, mapZoom, onFloatSelect, selectedFloat }) {
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedDataType, setSelectedDataType] = useState<string | null>(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, selectedVisual, selectedDataType]);

  const mockApiResponse = (userMessage) => {
    setIsLoading(true);
    
    if (messages.length === 0) {
      setIsChatting(true);
    }

    setTimeout(() => {
      const lowerCaseMessage = userMessage.toLowerCase();
      
      let botResponse = { id: Date.now(), text: "I'm sorry, I can't provide that information right now. Please ask about float data or visuals.", sender: "bot", type: "text" };

      if (lowerCaseMessage.includes("hello") || lowerCaseMessage.includes("hi")) {
        botResponse = { id: Date.now(), text: "Hello there! I'm FloatChat AI. How can I assist you with ARGO float data today?", sender: "bot", type: "text" };
        setSelectedVisual(null);
        setSelectedDataType(null);
      } else if (lowerCaseMessage.includes("meaning of life")) {
        botResponse = { id: Date.now(), text: "As an AI, I don't ponder philosophical questions, but I can help you find data on ocean life!", sender: "bot", type: "text" };
        setSelectedVisual(null);
        setSelectedDataType(null);
      } else if (lowerCaseMessage.includes("graph") || lowerCaseMessage.includes("show") || lowerCaseMessage.includes("visuals")) {
        botResponse = { id: Date.now(), text: "What kind of visual would you like to see?", sender: "bot", type: "options" };
        setSelectedDataType(null);
      } else if (lowerCaseMessage.includes("data") || lowerCaseMessage.includes("raw data")) {
        botResponse = { id: Date.now(), text: "Here are some data options:", sender: "bot", type: "data-options" };
        setSelectedVisual(null);
      } else if (lowerCaseMessage.includes("trajectory") || lowerCaseMessage.includes("path")) {
          botResponse = { id: Date.now(), text: "I can show you a map of float trajectories. Would you like to see it?", sender: "bot", type: "map-options" };
          setSelectedVisual(null);
          setSelectedDataType(null);
      }
      
      setMessages((prevMessages) => [
        ...prevMessages,
        botResponse,
      ]);
      
      setIsLoading(false);
      scrollToBottom();
    }, 2000);
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (inputMessage.trim() && !isLoading) {
      setSelectedVisual(null);
      setSelectedDataType(null);
      const newUserMessage = { id: Date.now(), text: inputMessage, sender: "user" };
      setMessages((prevMessages) => [
        ...prevMessages,
        newUserMessage,
      ]);
      mockApiResponse(inputMessage);
      setInputMessage("");
    }
  };

  const handleGraphOptionSelect = (optionName) => {
    const newUserMessage = { id: Date.now(), text: `Show me the ${optionName} graph`, sender: "user" };
    setMessages((prevMessages) => [...prevMessages, newUserMessage]);
    
    setSelectedVisual(optionName);
    setSelectedDataType(null);
  };
  
  const handleMapOptionSelect = (optionName) => {
    const newUserMessage = { id: Date.now(), text: `Show me the ${optionName}`, sender: "user" };
    setMessages((prevMessages) => [...prevMessages, newUserMessage]);
    
    // Changed this to a new state to distinguish it from the static graph
    setSelectedVisual("Animated Trajectory");
    setSelectedDataType(null);
  };

  const handleDataOptionSelect = (dataType) => {
      const newUserMessage = { id: Date.now(), text: `Show me the ${dataType} data`, sender: "user" };
      setMessages((prevMessages) => [...prevMessages, newUserMessage]);
      setSelectedDataType(dataType);
      setSelectedVisual(null);
  };

  const handleClosePanel = () => {
    setSelectedVisual(null);
    setSelectedDataType(null);
  };

  // Fixed handleNewChat to also reset the selected data type
  const handleNewChatWithReset = () => {
    handleNewChat(); // Call the original new chat function
    setSelectedVisual(null);
    setSelectedDataType(null);
  };

  const isPanelOpen = selectedVisual !== null || selectedDataType !== null;

  const renderSidePanel = () => {
    if (selectedVisual) {
      return <ChatVisuals theme={theme} selectedVisual={selectedVisual} onClose={handleClosePanel} floats={floats} mapCenter={mapCenter} mapZoom={mapZoom} onFloatSelect={onFloatSelect} selectedFloat={selectedFloat} />;
    }
    if (selectedDataType) {
      return <ChatDataViewer dataType={selectedDataType} onClose={handleClosePanel} />;
    }
    return null;
  };

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
            <ChatGreeting />
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
                  {message.type === 'options' && <ChatOptions onSelect={handleGraphOptionSelect} />}
                  {message.type === 'data-options' && <ChatDataOptions onSelect={handleDataOptionSelect} />}
                  {message.type === 'map-options' && (
                    <div className="flex flex-col space-y-2 p-4 bg-muted/20 rounded-xl mt-4">
                        <h4 className="text-sm font-semibold text-muted-foreground mb-2">Map options:</h4>
                        <button onClick={() => handleMapOptionSelect("water trajectory")} className="flex items-center gap-3 px-4 py-3 bg-card rounded-lg hover:bg-primary/10 transition-colors shadow-md text-foreground text-left">
                            <Route size={20} className="text-primary" />
                            <span className="font-medium">Show water trajectory</span>
                        </button>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
          {isLoading && (
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

        <form onSubmit={handleSendMessage} className="mt-6 pt-4 border-t border-white/10 dark:border-gray-700/50 flex items-center gap-4">
          <div className="relative flex-1">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Ask about ocean data..."
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
            {renderSidePanel()}
        </div>
      )}
    </div>
  );
}