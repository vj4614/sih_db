// src/app/page.tsx

"use client";

import React, { useState, useEffect } from "react";
import { LatLngExpression } from "leaflet";
import {
  Compass,
  FileText,
  GitCompare,
  MessageCircle,
  Zap,
} from "lucide-react";

import Header from "./components/ui/Header";
import SidePanel from "./components/ui/SidePanel";
import WaveAnimation from "./components/ui/WaveAnimation";
import ChatTab from "./components/tabs/ChatTab";
import VisualizeTab from "./components/tabs/VisualizeTab";
import CompareTab from "./components/tabs/CompareTab";
import InsightsTab from "./components/tabs/InsightsTab";
import AboutTab from "./components/tabs/AboutTab";
import NewbieHelper from "./components/tabs/newbie/NewbieHelper";
import NewbieDiagram from "./components/tabs/newbie/NewbieDiagram";
import { Tab, MapTransition, Mode } from "./types";

const TABS = [
  { id: "chat", label: "Chat", icon: MessageCircle },
  { id: "visualize", label: "Visualize", icon: Compass },
  { id: "insights", label: "Insights", icon: Zap },
  { id: "compare", label: "Compare", icon: GitCompare },
  { id: "about", label: "About", icon: FileText },
];


export const mockFloats = [
  {
    id: 1,
    platform_number: 98765,
    project_name: "INCOIS",
    last_cycle: 15,
    position: [-10.0, 85.0] as LatLngExpression,
    trajectory: [
      [-14.0, 75.0],
      [-12.5, 76.5],
      [-11.0, 75.5],
      [-10.5, 78.0],
      [-9.0, 79.0],
      [-11.0, 82.0],
      [-12.0, 84.0],
      [-10.0, 85.0],
    ] as LatLngExpression[],
  },
  {
    id: 2,
    platform_number: 12345,
    project_name: "NOAA",
    last_cycle: 22,
    position: [-15.0, 78.0] as LatLngExpression,
    trajectory: [
      [-8.0, 77.0],
      [-10.0, 79.0],
      [-12.0, 81.0],
      [-14.0, 80.0],
      [-16.0, 79.0],
      [-15.0, 78.0],
    ] as LatLngExpression[],
  },
  {
    id: 3,
    platform_number: 54321,
    project_name: "CSIRO",
    last_cycle: 8,
    position: [-13.0, 83.0] as LatLngExpression,
    trajectory: [
      [-18.0, 80.0],
      [-16.0, 81.0],
      [-14.0, 79.0],
      [-12.0, 81.5],
      [-11.5, 83.5],
      [-13.0, 83.0],
    ] as LatLngExpression[],
  },
];

// New floats with more random, zig-zag trajectories for the chat visualization
const chatFloats = [
  {
    id: 1,
    platform_number: 98765,
    project_name: "INCOIS",
    last_cycle: 15,
    position: [0.0, 80.0] as LatLngExpression,
    trajectory: [
      [10.0, 65.0],
      [9.5, 67.0],
      [9.0, 69.0],
      [8.5, 71.0],
      [7.5, 74.0],
      [6.0, 76.0],
      [4.5, 78.0],
      [3.0, 80.0],
      [1.5, 81.5],
      [0.0, 80.0],
      [1.0, 77.0],
    ] as LatLngExpression[],
    color: "#FF5733", // Orange-Red
  },
  {
    id: 2,
    platform_number: 12345,
    project_name: "NOAA",
    last_cycle: 22,
    position: [-5.0, 75.0] as LatLngExpression,
    trajectory: [
      [-10.0, 90.0],
      [-9.0, 88.0],
      [-8.0, 85.0],
      [-7.0, 82.0],
      [-6.0, 79.0],
      [-5.0, 77.0],
      [-4.0, 75.0],
      [-5.0, 73.0],
      [-6.5, 72.0],
      [-5.0, 75.0],
    ] as LatLngExpression[],
    color: "#33FF57", // Green
  },
  {
    id: 3,
    platform_number: 54321,
    project_name: "CSIRO",
    last_cycle: 8,
    position: [-2.0, 86.0] as LatLngExpression,
    trajectory: [
      [-15.0, 80.0],
      [-14.0, 82.0],
      [-13.0, 84.0],
      [-11.5, 85.5],
      [-10.0, 87.0],
      [-8.5, 88.0],
      [-7.0, 87.0],
      [-5.5, 85.0],
      [-4.0, 84.0],
      [-2.0, 86.0],
    ] as LatLngExpression[],
    color: "#FFBD33", // Yellow
  },
  {
    id: 4,
    platform_number: 78901,
    project_name: "U-GO",
    last_cycle: 10,
    position: [-10.0, 78.0] as LatLngExpression,
    trajectory: [
      [5.0, 95.0],
      [4.0, 93.0],
      [3.0, 91.0],
      [1.0, 88.0],
      [-1.0, 85.0],
      [-3.0, 83.0],
      [-5.0, 81.0],
      [-7.0, 79.0],
      [-8.5, 77.0],
      [-10.0, 78.0],
    ] as LatLngExpression[],
    color: "#6D33FF", // Purple
  },
  {
    id: 5,
    platform_number: 34567,
    project_name: "INDIGO",
    last_cycle: 18,
    position: [0.0, 90.0] as LatLngExpression,
    trajectory: [
      [0.0, 90.0],
      [1.0, 88.0],
      [2.0, 86.0],
      [1.5, 85.0],
      [0.5, 86.0],
      [0.0, 88.0],
      [0.5, 90.0],
      [1.0, 92.0],
      [0.5, 91.0],
      [0.0, 90.0],
    ] as LatLngExpression[],
    color: "#FF33F0", // Pink
  },
];


export default function Page() {
  const [theme, setTheme] = useState<"light" | "dark">("dark");
  const [mode, setMode] = useState<Mode>("newbie");
  const [activeTab, setActiveTab] = useState<Tab>("chat");
  const [messages, setMessages] = useState([]);
  const [selectedVisual, setSelectedVisual] = useState<string | null>(null);
  // Adjusted map center and zoom for the new trajectories
  const [mapCenter, setMapCenter] = useState<LatLngExpression>([0, 80]);
  const [mapZoom, setMapZoom] = useState(4);
  const [selectedFloat, setSelectedFloat] = useState(null);
  const [regionSummary, setRegionSummary] = useState(null);
  const [mapTransition, setMapTransition] = useState<MapTransition>('fly');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [filters, setFilters] = useState({ startDate: "2023-03-01", endDate: "2023-03-31", region: "Indian Ocean", parameter: "Salinity", floatId: "" });
  const [isChatting, setIsChatting] = useState(false);

  useEffect(() => { document.documentElement.classList.toggle("dark", theme === "dark"); }, [theme]);
  
  useEffect(() => {
    const bg = document.getElementById("bg-canvas");
    if (!bg) return;
    
    // Logic for blur based on tab and chat state
    const blurTabs = ["visualize", "compare", "insights"];
    if (blurTabs.includes(activeTab) || (activeTab === "chat" && (isChatting || selectedVisual !== null))) {
      bg.style.filter = "blur(12px) brightness(0.8)";
    } else {
      bg.style.filter = "none";
    }
  }, [activeTab, isChatting, selectedVisual]);

  // Effect to control sidebar state based on selectedVisual
  useEffect(() => {
    if (selectedVisual !== null) {
        setIsSidebarOpen(false);
    } else {
        setIsSidebarOpen(true);
    }
  }, [selectedVisual]);


  const handleModeToggle = () => {
    const isSwitchingToNewbie = mode === "researcher";
    setMode(isSwitchingToNewbie ? "newbie" : "researcher");
    setActiveTab("chat");
    setMessages([]);
    setSelectedVisual(null);
    setIsChatting(false);
  };

  const handleNewChat = () => {
    setMessages([]);
    setSelectedVisual(null);
    setIsChatting(false);
  };

  const handleFloatSelect = (float) => { setMapTransition('fly'); setRegionSummary(null); setSelectedFloat(float); setMapCenter(float.position); setMapZoom(7); };
  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => { const { name, value } = e.target; setFilters((prev) => ({ ...prev, [name]: value })); };
  const handleApplyFilters = () => {
    const targetFloat = mockFloats.find(f => f.platform_number.toString() === filters.floatId);
    if (targetFloat) {
      setMapTransition('fly');
      setSelectedFloat(targetFloat);
      setMapCenter(targetFloat.position);
      setMapZoom(8);
      setRegionSummary(null);
    } else {
      setMapTransition('instant');
      setSelectedFloat(null);
      setRegionSummary({ region: filters.region, floats: mockFloats });
      const mockRegionCenters = { "Indian Ocean": [0, 80], "Equatorial Region": [0, -120], "North Atlantic": [40, -40], "Southern Ocean": [-60, 0] };
      setMapCenter(mockRegionCenters[filters.region] || [0, 80]);
      setMapZoom(3);
    }
  };
  const handleDetailClose = () => { setSelectedFloat(null); setRegionSummary(null); };

  const renderDashboard = () => {
    if (mode === "newbie") {
      switch (activeTab) {
        case "chat":
          return (
            <NewbieHelper
              messages={messages}
              setMessages={setMessages}
              theme={theme}
              handleNewChat={handleNewChat}
              setIsChatting={setIsChatting}
            />
          );
        case "visualize":
          return (
            <VisualizeTab
              floats={mockFloats}
              filters={filters}
              handleFilterChange={handleFilterChange}
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
        case "compare":
          return <CompareTab theme={theme} />;
        case "insights":
          return <InsightsTab theme={theme} />;
        case "about":
          return <AboutTab />;
        default:
          return null;
      }
    }
    return (
      <div className="max-w-7xl mx-auto h-full">
        {activeTab === "chat" && <ChatTab messages={messages} setMessages={setMessages} theme={theme} selectedVisual={selectedVisual} setSelectedVisual={setSelectedVisual} handleNewChat={handleNewChat} setIsChatting={setIsChatting} floats={chatFloats} mapCenter={mapCenter} mapZoom={mapZoom} onFloatSelect={handleFloatSelect} selectedFloat={selectedFloat}/>}
        {activeTab === "visualize" && (
          <VisualizeTab
            floats={mockFloats} filters={filters} handleFilterChange={handleFilterChange} handleApplyFilters={handleApplyFilters}
            mapCenter={mapCenter} mapZoom={mapZoom} selectedFloat={selectedFloat} regionSummary={regionSummary}
            onFloatSelect={handleFloatSelect} onDetailClose={handleDetailClose} theme={theme} mapTransition={mapTransition}
          />
        )}
        {activeTab === "compare" && <CompareTab theme={theme} />}
        {activeTab === "insights" && <InsightsTab theme={theme} />}
        {activeTab === "about" && <AboutTab />}
      </div>
    );
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

      <main
        className={`flex-1 p-4 sm:p-6 md:p-8 relative transition-all duration-300 ${
          isSidebarOpen ? "md:ml-64" : "md:ml-20"
        }`}
      >
        <div className="flex h-full">
          <section className="flex-1 h-full">{renderDashboard()}</section>
        </div>
      </main>
    </div>
  );
}