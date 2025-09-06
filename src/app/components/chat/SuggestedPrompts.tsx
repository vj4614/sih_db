// src/app/components/chat/SuggestedPrompts.tsx
"use client";

import { Lightbulb, GitCompare, Thermometer } from 'lucide-react';
import React from 'react';

const suggestions = [
  {
    icon: Thermometer,
    text: "Plot a temperature profile for the Arabian Sea in June 2022.",
  },
  {
    icon: GitCompare,
    text: "Compare salinity in the Bay of Bengal vs the Arabian Sea.",
  },
  {
    icon: Lightbulb,
    text: "What was the average sea surface temperature in May 2022?",
  },
];

interface SuggestedPromptsProps {
  onPromptClick: (prompt: string) => void;
}

const SuggestedPrompts: React.FC<SuggestedPromptsProps> = ({ onPromptClick }) => {
  return (
    <div className="animate-fade-in space-y-3">
      {suggestions.map((suggestion, index) => (
        <button
          key={index}
          onClick={() => onPromptClick(suggestion.text)}
          className="w-full text-left p-4 bg-card hover:bg-muted/50 rounded-lg transition-colors flex items-center gap-4 border border-white/10 dark:border-gray-800/20"
        >
          <suggestion.icon className="w-5 h-5 text-primary flex-shrink-0" />
          <span className="text-muted-foreground">{suggestion.text}</span>
        </button>
      ))}
    </div>
  );
};

export default SuggestedPrompts;