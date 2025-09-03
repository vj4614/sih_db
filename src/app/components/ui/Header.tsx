"use client";

import React from "react";
import type { FC } from "react";
import { Sun, Moon, MessageSquare, BarChart2, GitCompare, Zap, Info, User, GraduationCap } from 'lucide-react';
// Corrected import path for types.ts
import { RESEARCHER_TABS, NEWBIE_TABS, Tab, TabConfig, Mode } from "../../type.ts";

interface HeaderProps {
    theme: 'light' | 'dark';
    setTheme: (theme: 'light' | 'dark' | ((theme: 'light' | 'dark') => 'light' | 'dark')) => void;
    activeTab: Tab;
    setActiveTab: (tab: Tab) => void;
    mode: Mode;
    onModeToggle: () => void;
    showDrippingEffect: boolean;
}

export default function Header({ theme, setTheme, activeTab, setActiveTab, mode, onModeToggle, showDrippingEffect }: HeaderProps) {
  const tabs = mode === 'researcher' ? RESEARCHER_TABS : NEWBIE_TABS;
  return (
    <header className={`flex items-center justify-between px-4 sm:px-6 py-3 border-b border-gray-200 dark:border-gray-800 bg-card shadow-sm relative z-[100]`}>
      <div className={`flex items-center gap-3 ${showDrippingEffect ? 'dripping-container' : ''}`}>
          <div className="bg-primary text-primary-foreground rounded-full w-10 h-10 flex items-center justify-center text-lg font-bold">🌊</div>
          <h1 className="text-xl font-bold tracking-tight">ARGO Explorer</h1>
      </div>
      <nav className="hidden md:flex items-center gap-2 bg-muted p-1 rounded-lg">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors
              ${activeTab === id ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:bg-background/60 hover:text-foreground"}
              ${showDrippingEffect ? 'dripping-container' : ''}
              `}
          >
            <Icon size={16} />{label}
          </button>
        ))}
      </nav>
      <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-muted p-1 rounded-full">
              <button
                  onClick={onModeToggle}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                      mode === 'researcher' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:bg-background/60'
                  }`}
              >
                  <GraduationCap size={16} />Researcher
              </button>
              <button
                  onClick={onModeToggle}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                      mode === 'newbie' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:bg-background/60'
                  }`}
              >
                  <User size={16} />Newbie
              </button>
          </div>
          <button onClick={() => setTheme((t) => (t === "dark" ? "light" : "dark"))} className={`p-2 rounded-full hover:bg-muted transition-colors ${showDrippingEffect ? 'dripping-container' : ''}`}>
              {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
          </button>
      </div>
    </header>
  );
};