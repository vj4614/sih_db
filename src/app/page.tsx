// src/app/page.tsx
"use client";

import React, { useState, useEffect, useMemo } from "react";
import { LatLngExpression } from "leaflet";
import { Compass, GitCompare, MessageCircle, Zap, Info } from "lucide-react";

import Header from "./components/ui/Header";
import WaveAnimation from "./components/ui/WaveAnimation";
import ChatTab from "./components/tabs/ChatTab";
import VisualizeTab from "./components/tabs/VisualizeTab";
import CompareTab from "./components/tabs/CompareTab";
import InsightsTab from "./components/tabs/InsightsTab";
import AboutTab from "./components/tabs/AboutTab";
import NewbieHelper from "./components/tabs/newbie/NewbieHelper";
import { Tab, MapTransition, Mode } from "./types";
import { generateMockFloats } from "./services/mockDataService";

export default function Page() {
  const [theme, setTheme] = useState<"light" | "dark">("dark");
  const [mode, setMode] = useState<Mode>("researcher");
  const [activeTab, setActiveTab] = useState<Tab>("visualize");
  const [messages, setMessages] = useState([]);
  
  // State for map and float data
  const allFloats = useMemo(() => generateMockFloats(75), []); // Memoized
  const [filteredFloats, setFilteredFloats] = useState(allFloats);
  const [mapCenter, setMapCenter] = useState<LatLngExpression>([5, 80]);
  const [mapZoom, setMapZoom] = useState(4);
  const [selectedFloat, setSelectedFloat] = useState(null);
  const [regionSummary, setRegionSummary] = useState<{ region: string, floats: any[] } | null>(null);
  const [mapTransition, setMapTransition] = useState<MapTransition>('fly');
  
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [filters, setFilters] = useState({ 
    startDate: "", 
    endDate: "", 
    region: "", 
    project_name: "",
    floatId: ""
  });
  const [isChatting, setIsChatting] = useState(false);
  const [showWaveAnimation, setShowWaveAnimation] = useState(false);

  useEffect(() => { document.documentElement.classList.toggle("dark", theme === "dark"); }, [theme]);
  
  useEffect(() => {
    const bg = document.getElementById("bg-canvas");
    if (!bg) return;
    
    const blurTabs = ["visualize", "compare", "insights"];
    if (blurTabs.includes(activeTab) || (activeTab === "chat" && isChatting)) {
      bg.style.filter = "blur(12px) brightness(0.8)";
    } else {
      bg.style.filter = "none";
    }
  }, [activeTab, isChatting]);

  const handleModeToggle = () => {
    setShowWaveAnimation(true);
    setMode(prev => prev === "researcher" ? "newbie" : "researcher");
    setActiveTab("chat");
    setMessages([]);
    setIsChatting(false);
  };

  const handleNewChat = () => {
    setMessages([]);
    setIsChatting(false);
  };

  const handleFloatSelect = (float) => { 
    setMapTransition('fly'); 
    setRegionSummary(null); 
    setSelectedFloat(float); 
    setMapCenter(float.position); 
    setMapZoom(7); 
  };
  
  const handleApplyFilters = () => {
    let newFilteredFloats = [...allFloats];

    // Filter by Float ID
    if (filters.floatId) {
        const targetFloat = allFloats.find(f => f.platform_number.toString() === filters.floatId);
        newFilteredFloats = targetFloat ? [targetFloat] : [];
    } else {
        // Filter by Project Name
        if (filters.project_name) {
            newFilteredFloats = newFilteredFloats.filter(f => f.project_name === filters.project_name);
        }
        // Filter by Date Range
        if (filters.startDate) {
            newFilteredFloats = newFilteredFloats.filter(f => f.date >= filters.startDate);
        }
        if (filters.endDate) {
            newFilteredFloats = newFilteredFloats.filter(f => f.date <= filters.endDate);
        }
    }
    
    setFilteredFloats(newFilteredFloats);

    if (newFilteredFloats.length === 1) {
        handleFloatSelect(newFilteredFloats[0]);
    } else {
        setSelectedFloat(null);
        setMapCenter([5, 80]);
        setMapZoom(4);
        setRegionSummary({ 
            region: "Filtered Results", 
            floats: newFilteredFloats 
        });
    }
    setMapTransition('fly');
  };
  
  const handleDetailClose = () => { 
    setSelectedFloat(null); 
  };

  const renderDashboard = () => {
    if (mode === "researcher") {
        switch (activeTab) {
            case "chat":
              return <ChatTab messages={messages} setMessages={setMessages} theme={theme} handleNewChat={handleNewChat} setIsChatting={setIsChatting} />;
            case "visualize":
              return (
                <VisualizeTab
                  floats={filteredFloats}
                  filters={filters}
                  setFilters={setFilters}
                  handleApplyFilters={handleApplyFilters}
                  mapCenter={mapCenter}
                  mapZoom={mapZoom}
                  selectedFloat={selectedFloat}
                  regionSummary={regionSummary}
                  onFloatSelect={handleFloatSelect}
                  onDetailClose={handleDetailClose}
                  theme={theme}
                  mapTransition={mapTransition}
                />
              );
            case "compare": return <CompareTab theme={theme} />;
            case "insights": return <InsightsTab theme={theme} />;
            case "about": return <AboutTab />;
            default: return null;
        }
    }
    switch (activeTab) {
      case "chat": return <NewbieHelper messages={messages} setMessages={setMessages} theme={theme} handleNewChat={handleNewChat} setIsChatting={setIsChatting} />;
      default: return null;
    }
  };

  return (
    <div className="flex h-screen bg-background text-foreground font-sans">
      <Header
        theme={theme}
        setTheme={setTheme}
        activeTab={activeTab}
        setActiveTab={(tab: Tab) => setActiveTab(tab)}
        mode={mode}
        onModeToggle={handleModeToggle}
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
      />
      {showWaveAnimation && <WaveAnimation />}

      <main className={`flex-1 p-4 sm:p-6 md:p-8 relative transition-all duration-300 ${isSidebarOpen ? "md:ml-64" : "md:ml-20"}`}>
        <div className="flex h-full">
          <section className="flex-1 h-full">{renderDashboard()}</section>
        </div>
      </main>
    </div>
  );
}