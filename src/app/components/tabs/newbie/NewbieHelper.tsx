"use client";

import React, { useEffect } from 'react';
import { Send, User } from 'lucide-react';

export default function NewbieHelper({ messages, setMessages, theme }) {
    useEffect(() => {
        if (messages.length === 0) {
            setMessages([
                { id: 1, who: "ai", text: "Hello! I'm your AI guide to the oceans. Ask me anything about ARGO floats, and I'll help you navigate the data. What are you curious about?" },
            ]);
        }
    }, [setMessages, messages.length]);

    const handleSendMessage = (text) => {
        if (!text) return;
        const userInput = text.trim();
        setMessages((prev) => [...prev, { id: Date.now(), who: 'user', text: userInput }]);
        
        setTimeout(() => {
            setMessages((prev) => [...prev, { id: Date.now() + 1, who: 'ai', text: `This is a friendly, mocked response for: "${userInput}". In a real scenario, I would provide a helpful explanation!` }]);
        }, 800);
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            const target = e.target as HTMLInputElement;
            handleSendMessage(target.value);
            target.value = '';
        }
    };

    return (
        <section className="h-[calc(100vh-150px)] animate-fade-in">
            <div className="bg-card rounded-xl shadow-lg h-full flex flex-col chat-aurora-container">
                <div className="chat-content-wrapper p-4 sm:p-6">
                    <h2 className="text-xl font-bold mb-4 border-b pb-3 text-foreground/80 dark:text-foreground/80 border-black/10 dark:border-white/10">
                        Helper Bot
                    </h2>
                    <div className="flex-1 space-y-6 overflow-y-auto pr-2 mb-4">
                        {messages.map((m) => (
                            <div key={m.id} className={`flex items-start gap-3 ${m.who === 'user' ? 'justify-end' : 'justify-start'}`}>
                                {m.who === 'ai' && (
                                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-white/20 dark:border-slate-700 flex items-center justify-center shadow-md">
                                        <div className="text-lg">🌊</div>
                                    </div>
                                )}
                                <div className={`max-w-xs lg:max-w-xl p-3.5 rounded-2xl border shadow-lg backdrop-blur-xl text-sm
                                    ${m.who === 'user' 
                                        ? theme === 'light'
                                            ? 'bg-blue-500/10 border-blue-500/20 text-blue-900'
                                            // This is the restored dark mode style for the user message
                                            : 'bg-gradient-to-br from-primary to-blue-700 text-white border-blue-500/50'
                                        : theme === 'light'
                                            ? 'bg-white/60 border-white/30 text-slate-800'
                                            : 'bg-slate-900/60 border-slate-700 text-slate-200'
                                    }`}
                                >
                                    <p className={m.who === 'ai' ? 'font-mono' : 'font-medium'}>{m.text}</p>
                                </div>
                                {m.who === 'user' && (
                                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 backdrop-blur-sm border border-primary/20 flex items-center justify-center shadow-md">
                                        <User size={16} className="text-primary" />
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                    <div className="mt-auto flex items-center gap-3 border-t pt-4 border-black/10 dark:border-white/10">
                        <input
                            id="chat-input"
                            className={`flex-1 p-3 rounded-full border backdrop-blur-lg focus:ring-2 focus:outline-none placeholder:text-opacity-60
                                ${theme === 'light' 
                                    ? 'bg-white/60 border-slate-300/70 text-slate-800 placeholder:text-slate-500 focus:ring-blue-500' 
                                    : 'bg-slate-900/50 border-slate-700 text-slate-100 placeholder:text-slate-400 focus:ring-primary'
                                }`}
                            placeholder="Ask a simple question..."
                            onKeyDown={handleKeyDown}
                        />
                        <button 
                            onClick={() => { 
                                const input = document.getElementById('chat-input') as HTMLInputElement; 
                                if (input) { handleSendMessage(input.value); input.value = ''; } 
                            }} 
                            className="p-3 bg-primary text-primary-foreground rounded-full hover:bg-primary/90 transition-all transform active:scale-95 shadow-lg"
                        >
                            <Send size={20} />
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );
};