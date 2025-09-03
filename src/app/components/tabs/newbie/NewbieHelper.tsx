"use client";

import React, { useEffect } from 'react';
import { Send } from 'lucide-react';

export default function NewbieHelper({ messages, setMessages }) {
    useEffect(() => {
        setMessages([
            { id: 1, who: "ai", text: "Hello! Welcome to the Newbie Helper. I'm here to guide you through the world of ARGO floats. How can I assist you today?" },
        ]);
    }, [setMessages]);

    const handleSendMessage = (text) => {
        if (!text) return;
        setMessages((prev) => [...prev, { id: Date.now(), who: 'user', text }]);
        setTimeout(() => {
            setMessages((prev) => [...prev, { id: Date.now() + 1, who: 'ai', text: `This is a mock response for: "${text}"` }]);
        }, 800);
    };

    return (
        <section className="max-w-4xl mx-auto h-[calc(100vh-150px)] flex flex-col animate-fade-in">
            <div className="bg-card rounded-xl shadow-lg p-4 sm:p-6 flex flex-col h-full">
                <h2 className="text-xl font-bold mb-4 border-b pb-3 text-primary">Helper</h2>
                <div className="flex-1 space-y-4 overflow-y-auto pr-2 mb-4">
                    {messages.map((m) => (
                        <div key={m.id} className={`flex ${m.who === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-xs lg:max-w-xl p-3 rounded-2xl ${
                                m.who === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted text-foreground'
                            }`}>
                                <p className="text-sm">{m.text}</p>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="mt-auto flex items-center gap-2 border-t pt-4">
                    <input
                        className="flex-1 p-3 rounded-full border bg-background dark:bg-slate-700 focus:ring-2 focus:ring-primary focus:outline-none"
                        placeholder="Ask a question..."
                        onKeyDown={(e) => { if (e.key === 'Enter') { handleSendMessage((e.target as HTMLInputElement).value); (e.target as HTMLInputElement).value = ''; } }}
                    />
                    <button onClick={() => { const input = document.getElementById('chat-input') as HTMLInputElement; if (input) { handleSendMessage(input.value); input.value = ''; } }} className="p-3 bg-primary text-primary-foreground rounded-full hover:bg-primary/90 transition-transform transform active:scale-95">
                        <Send size={20} />
                    </button>
                </div>
            </div>
        </section>
    );
};