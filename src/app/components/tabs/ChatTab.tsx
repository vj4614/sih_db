"use client";

import React, { useState, useEffect } from "react";
import { Send } from 'lucide-react';
import ChatGreeting from "../chat/ChatGreeting";
import ChatVisuals from "../chat/ChatVisuals";

export default function ChatTab({ messages, setMessages, theme, chatHasVisuals, setChatHasVisuals }) {
    const handleSendMessage = (text: string) => {
        if (!text) return;
        if (!chatHasVisuals) setChatHasVisuals(true);
        setMessages((prev) => [...prev, { id: Date.now(), who: 'user', text }]);
        setTimeout(() => { setMessages((prev) => [...prev, { id: Date.now() + 1, who: 'ai', text: `Here are the visualizations based on your request for "${text}"` }]); }, 800);
    };
    const isInitialState = messages.length === 0;
    return (
        <section className={`grid gap-6 h-[calc(100vh-150px)] transition-all duration-500 ${chatHasVisuals ? 'grid-cols-1 md:grid-cols-3' : 'grid-cols-1'}`}>
            <div className={`bg-card rounded-xl shadow-lg p-4 sm:p-6 flex flex-col h-full ${!chatHasVisuals && 'max-w-4xl mx-auto w-full'}`}>
                <h2 className="text-xl font-bold mb-4 border-b pb-3 text-primary">FloatChat AI</h2>
                {isInitialState ? <ChatGreeting /> : (
                    <div className="flex-1 space-y-4 overflow-y-auto pr-2 mb-4">
                        {messages.map((m) => (<div key={m.id} className={`flex ${m.who === 'user' ? 'justify-end' : 'justify-start'}`}><div className={`max-w-md p-3 rounded-2xl ${m.who === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted text-foreground'}`}><p className="text-sm">{m.text}</p></div></div>))}
                    </div>
                )}
                <div className="mt-auto flex items-center gap-2 border-t pt-4">
                    <input id="chat-input" className="flex-1 p-3 rounded-full border border-muted bg-background text-foreground focus:ring-2 focus:ring-primary focus:outline-none" placeholder="Ask a question about ARGO floats..."
                        onKeyDown={(e) => { if (e.key === 'Enter') { handleSendMessage((e.target as HTMLInputElement).value); (e.target as HTMLInputElement).value = ''; } }} />
                    <button onClick={() => { const input = document.getElementById('chat-input') as HTMLInputElement; if (input) { handleSendMessage(input.value); input.value = ''; } }} className="p-3 bg-primary text-primary-foreground rounded-full hover:bg-primary/90 transition-transform transform active:scale-95"><Send size={20} /></button>
                </div>
            </div>
            {chatHasVisuals && <ChatVisuals theme={theme} />}
        </section>
    );
};