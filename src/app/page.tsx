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
  // Indian Ocean Floats
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
    region: "Indian Ocean"
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
    region: "Indian Ocean"
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
    region: "Indian Ocean"
  },
  // North Atlantic Floats
  {
    id: 4,
    platform_number: 67890,
    project_name: "UKHO",
    last_cycle: 10,
    position: [45.0, -30.0] as LatLngExpression,
    trajectory: [
      [40.0, -25.0],
      [42.0, -28.0],
      [44.0, -32.0],
      [45.0, -30.0],
    ] as LatLngExpression[],
    region: "North Atlantic"
  },
  {
    id: 5,
    platform_number: 11223,
    project_name: "IFREMER",
    last_cycle: 18,
    position: [50.0, -40.0] as LatLngExpression,
    trajectory: [
      [48.0, -35.0],
      [49.0, -38.0],
      [51.0, -41.0],
      [50.0, -40.0],
    ] as LatLngExpression[],
    region: "North Atlantic"
  },
  // Southern Ocean Floats
  {
    id: 6,
    platform_number: 33445,
    project_name: "BAS",
    last_cycle: 30,
    position: [-65.0, 10.0] as LatLngExpression,
    trajectory: [
      [-60.0, 5.0],
      [-62.0, 8.0],
      [-64.0, 12.0],
      [-65.0, 10.0],
    ] as LatLngExpression[],
    region: "Southern Ocean"
  },
  {
    id: 7,
    platform_number: 55667,
    project_name: "AWI",
    last_cycle: 25,
    position: [-70.0, -20.0] as LatLngExpression,
    trajectory: [
      [-68.0, -15.0],
      [-69.0, -18.0],
      [-71.0, -22.0],
      [-70.0, -20.0],
    ] as LatLngExpression[],
    region: "Southern Ocean"
  },
  // Equatorial Region Floats
  {
    id: 8,
    platform_number: 77889,
    project_name: "PMEL",
    last_cycle: 12,
    position: [0.0, -120.0] as LatLngExpression,
    trajectory: [
      [2.0, -118.0],
      [1.0, -121.0],
      [-1.0, -122.0],
      [0.0, -120.0],
    ] as LatLngExpression[],
    region: "Equatorial Region"
  },
  {
    id: 9,
    platform_number: 99001,
    project_name: "JAMSTEC",
    last_cycle: 17,
    position: [2.0, -130.0] as LatLngExpression,
    trajectory: [
      [4.0, -128.0],
      [3.0, -131.0],
      [1.0, -132.0],
      [2.0, -130.0],
    ] as LatLngExpression[],
    region: "Equatorial Region"
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
      [-10.0, 78.0],
      [-9.0, 80.0],
      [-8.0, 82.0],
      [-7.0, 84.0],
      [-6.0, 86.0],
      [-5.0, 88.0],
      [-4.0, 90.0],
      [-3.0, 92.0],
      [-2.0, 94.0],
      [-1.0, 95.0],
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
  const [mapCenter, setMapCenter] = useState<LatLngExpression>([0, 80]);
  const [mapZoom, setMapZoom] = useState(4);
  const [selectedFloat, setSelectedFloat] = useState(null);
  const [regionSummary, setRegionSummary] = useState<{ region: string, floats: any[] } | null>(null);
  const [mapTransition, setMapTransition] = useState<MapTransition>('fly');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [filters, setFilters] = useState({ 
    startDate: "", 
    endDate: "", 
    region: "", 
    parameter: "", 
    floatId: "",
    data_mode: "",
    direction: "",
    cycle_number: "",
    project_name: ""
  });
  const [isChatting, setIsChatting] = useState(false);
  const [showWaveAnimation, setShowWaveAnimation] = useState(false);

  useEffect(() => { document.documentElement.classList.toggle("dark", theme === "dark"); }, [theme]);
  
  useEffect(() => {
    const bg = document.getElementById("bg-canvas");
    if (!bg) return;
    
    const blurTabs = ["visualize", "compare", "insights"];
    if (blurTabs.includes(activeTab) || (activeTab === "chat" && (isChatting || selectedVisual !== null))) {
      bg.style.filter = "blur(12px) brightness(0.8)";
    } else {
      bg.style.filter = "none";
    }
  }, [activeTab, isChatting, selectedVisual]);

  useEffect(() => {
    if (selectedVisual !== null) {
        setIsSidebarOpen(false);
    } else {
        setIsSidebarOpen(true);
    }
  }, [selectedVisual]);
  
  useEffect(() => {
    if (showWaveAnimation) {
      const timer = setTimeout(() => {
        setShowWaveAnimation(false);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [showWaveAnimation]);


  const handleModeToggle = () => {
    setShowWaveAnimation(true);
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
  
  // Updated handler for both regular inputs and react-select
  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement> | null, actionMeta?: any) => {
    if (actionMeta && actionMeta.name) { // This is for react-select
      const { name } = actionMeta;
      const value = e ? (e as any).value : "";
      setFilters((prev) => ({ ...prev, [name]: value }));
    } else if (e) { // This is for regular inputs
      const { name, value } = e.target;
      setFilters((prev) => ({ ...prev, [name]: value }));
    }
  };
  
  const handleApplyFilters = () => {
    const targetFloat = mockFloats.find(f => f.platform_number.toString() === filters.floatId);
    if (targetFloat) {
      setMapTransition('fly');
      setSelectedFloat(targetFloat);
      setMapCenter(targetFloat.position);
      setMapZoom(8);
      setRegionSummary(null);
    } else {
      setMapTransition('fly');
      setSelectedFloat(null);
      
      const regionCenters: { [key: string]: { center: LatLngExpression, zoom: number } } = {
        "Indian Ocean": { center: [0, 80], zoom: 3 },
        "Equatorial Region": { center: [0, -120], zoom: 4 },
        "North Atlantic": { center: [40, -40], zoom: 4 },
        "Southern Ocean": { center: [-60, 0], zoom: 3 }
      };

      const selectedRegionData = regionCenters[filters.region];
      if (selectedRegionData) {
        setMapCenter(selectedRegionData.center);
        setMapZoom(selectedRegionData.zoom);
      } else {
        setMapCenter([0, 80]);
        setMapZoom(3);
      }
      
      setRegionSummary({ region: filters.region, floats: mockFloats });
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
            <NewbieDiagram
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
            floats={mockFloats}
            filters={filters}
            handleFilterChange={handleFilterChange} handleApplyFilters={handleApplyFilters}
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
      {showWaveAnimation && <WaveAnimation />}

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