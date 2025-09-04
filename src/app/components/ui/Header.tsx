"use client";

import React, { useState } from "react";
import type { FC } from "react";
import { Sun, Moon, MessageSquare, BarChart2, GitCompare, Zap, Info, User, GraduationCap, Menu, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { RESEARCHER_TABS, NEWBIE_TABS, Tab, TabConfig, Mode } from "../../types.ts";

interface HeaderProps {
    theme: 'light' | 'dark';
    setTheme: (theme: 'light' | 'dark' | ((theme: 'light' | 'dark') => 'light' | 'dark')) => void;
    activeTab: Tab;
    setActiveTab: (tab: Tab) => void;
    mode: Mode;
    onModeToggle: () => void;
    showDrippingEffect: boolean;
    isSidebarOpen: boolean;
    setIsSidebarOpen: (isOpen: boolean) => void;
}

export default function Header({ theme, setTheme, activeTab, setActiveTab, mode, onModeToggle, showDrippingEffect, isSidebarOpen, setIsSidebarOpen }: HeaderProps) {
  const tabs = mode === 'researcher' ? RESEARCHER_TABS : NEWBIE_TABS;

  const handleTabClick = (tabId: Tab) => {
    setActiveTab(tabId);
  };

  return (
    <>
      {/* Sidebar - Desktop and Mobile */}
      <aside className={`fixed inset-y-0 left-0 z-50 flex flex-col transition-all duration-300 ease-in-out bg-card shadow-lg border-r border-gray-200 dark:border-gray-800 ${isSidebarOpen ? 'w-64' : 'w-20'}`}>
        <div className="flex items-center justify-between p-4 h-16">
          <div className={`flex items-center gap-3 transition-opacity duration-200 ${isSidebarOpen ? 'opacity-100' : 'opacity-0 hidden'}`}>
            <div className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center text-lg font-bold">🌊</div>
            <h1 className="text-xl font-bold tracking-tight">FloatChat</h1>
          </div>
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 rounded-full hover:bg-muted">
            {isSidebarOpen ? <ChevronLeft size={24} /> : <ChevronRight size={24} />}
          </button>
        </div>
        
        <nav className="flex-1 overflow-y-auto p-2 space-y-2">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
                key={id}
                onClick={() => handleTabClick(id)}
                className={`w-full text-left flex items-center gap-4 px-4 py-3 rounded-lg text-sm font-medium transition-colors
                ${activeTab === id ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:bg-background/60 hover:text-foreground"}
                `}
            >
              <div className="relative flex items-center justify-center">
                {activeTab === id && (
                  <span className="absolute h-2.5 w-2.5 rounded-full bg-primary animate-pulse"></span>
                )}
                <Icon size={20} />
              </div>
              <span className={`transition-opacity duration-200 ${isSidebarOpen ? 'opacity-100' : 'opacity-0 hidden'}`}>{label}</span>
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-200 dark:border-gray-800 space-y-2">
            <div className={`flex items-center gap-2 rounded-full overflow-hidden transition-all duration-200 ${isSidebarOpen ? 'p-1 bg-muted' : 'p-0 h-0'}`}>
                <button
                    onClick={onModeToggle}
                    className={`flex-1 text-center py-2 rounded-full text-sm font-medium transition-colors ${
                        mode === 'researcher' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:bg-background/60'
                    }`}
                >
                    <GraduationCap size={20} />
                    <span className="ml-2">Researcher</span>
                </button>
                <button
                    onClick={onModeToggle}
                    className={`flex-1 text-center py-2 rounded-full text-sm font-medium transition-colors ${
                        mode === 'newbie' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:bg-background/60'
                    }`}
                >
                    <User size={20} />
                    <span className="ml-2">Newbie</span>
                </button>
            </div>
            <button onClick={() => setTheme((t) => (t === "dark" ? "light" : "dark"))} className={`w-full flex items-center gap-4 p-2 rounded-lg hover:bg-muted transition-colors`}>
                {theme === "dark" ? <Sun size={24} /> : <Moon size={24} />}
                <span className={`transition-opacity duration-200 ${isSidebarOpen ? 'opacity-100' : 'opacity-0 hidden'}`}>{theme === "dark" ? "Dark Mode" : "Light Mode"}</span>
            </button>
        </div>
      </aside>
    </>
  );
}