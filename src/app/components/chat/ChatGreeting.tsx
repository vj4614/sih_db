"use client";

import React, { useState, useEffect } from 'react';

export default function ChatGreeting() {
    const poeticLines = [
        "I am your Sailor to help you sail in the ocean.",
        "Let me navigate the complex data for you."
    ];
    const eraseSpeed = 30;
    const typeSpeed = 50;
    const pauseTime = 1500;
    const [typedMessage, setTypedMessage] = useState("");
    const [erasing, setErasing] = useState(false);
    const [messageIndex, setMessageIndex] = useState(0);

    useEffect(() => {
        let timer;
        if (!erasing) {
            if (typedMessage.length < poeticLines[messageIndex].length) {
                timer = setTimeout(() => {
                    setTypedMessage(poeticLines[messageIndex].slice(0, typedMessage.length + 1));
                }, typeSpeed);
            } else {
                timer = setTimeout(() => {
                    setErasing(true);
                }, pauseTime);
            }
        } else {
            if (typedMessage.length > 0) {
                timer = setTimeout(() => {
                    setTypedMessage(typedMessage.slice(0, typedMessage.length - 1));
                }, eraseSpeed);
            } else {
                setErasing(false);
                setMessageIndex((prevIndex) => (prevIndex + 1) % poeticLines.length);
            }
        }
        
        return () => clearTimeout(timer);
    }, [typedMessage, erasing, messageIndex]);

    return (
        <div className="flex-1 flex flex-col items-center justify-center text-center p-4 animate-fade-in">
            <h1 className="text-5xl md:text-6xl font-bold">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-cyan-400">
                    Hello!
                </span>
            </h1>
            <p className="mt-4 text-lg font-semibold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400 max-w-md">
                {typedMessage}
                <span className="blinking-cursor">|</span>
            </p>
        </div>
    );
};