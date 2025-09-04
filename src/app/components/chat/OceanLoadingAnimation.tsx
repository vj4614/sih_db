"use client";

import React from 'react';
import { ChevronDown } from 'lucide-react';

export default function OceanLoadingAnimation() {
  return (
    <div className="flex items-center gap-3 p-2 rounded-lg bg-primary/10 text-primary animate-fade-in-down">
      <div className="w-8 h-8 flex items-center justify-center">
        <ChevronDown size={24} className="animate-bounce" />
      </div>
      <span className="text-sm font-medium">Launching AI probe...</span>
    </div>
  );
}