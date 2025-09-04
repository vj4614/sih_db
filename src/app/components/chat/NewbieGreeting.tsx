"use client";

import React, { useState, useEffect } from 'react';

export default function NewbieGreeting() {
    const greetingLines = [
        "Welcome, Ocean Explorer!",
        "Ready to discover secrets of the deep?",
        "Ask me anything to begin our journey."
    ];
    const typeSpeed = 60;
    const eraseSpeed = 40;
    const pauseTime = 2000;
    const [typedMessage, setTypedMessage] = useState("");
    const [lineIndex, setLineIndex] = useState(0);
    const [isErasing, setIsErasing] = useState(false);

    useEffect(() => {
        const handleTyping = () => {
            const currentLine = greetingLines[lineIndex];
            if (isErasing) {
                if (typedMessage.length > 0) {
                    setTypedMessage(currentLine.substring(0, typedMessage.length - 1));
                } else {
                    setIsErasing(false);
                    setLineIndex((prevIndex) => (prevIndex + 1) % greetingLines.length);
                }
            } else {
                if (typedMessage.length < currentLine.length) {
                    setTypedMessage(currentLine.substring(0, typedMessage.length + 1));
                } else {
                    // Pause before erasing
                    setTimeout(() => setIsErasing(true), pauseTime);
                }
            }
        };

        const typingSpeed = isErasing ? eraseSpeed : typeSpeed;
        const timer = setTimeout(handleTyping, typingSpeed);

        return () => clearTimeout(timer);
    }, [typedMessage, isErasing, lineIndex, greetingLines, pauseTime, eraseSpeed, typeSpeed]);

    return (
        <div className="flex-1 flex flex-col items-center justify-center text-center p-4 animate-fade-in h-full">
            <h1 className="text-5xl md:text-6xl font-bold">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-cyan-500">
                    FloatChat Helper
                </span>
            </h1>
            <p className="mt-4 text-lg font-mono bg-clip-text text-transparent bg-gradient-to-r from-sky-500 to-teal-400 max-w-md h-6">
                {typedMessage}
                <span className="blinking-cursor text-cyan-400">|</span>
            </p>
        </div>
    );
};