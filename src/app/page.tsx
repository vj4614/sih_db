"use client";

import React, { useState, useEffect, FC, ReactNode } from "react";
import dynamic from "next/dynamic";
import { LatLngExpression } from "leaflet";
import { Sun, Moon, MessageSquare, BarChart2, GitCompare, Zap, Info, Send, Search, User, GraduationCap, Droplet, Layers, MapPin, Globe, Hash } from 'lucide-react';
import SidePanel from "./components/SidePanel";

const Plot = dynamic(() => import("react-plotly.js"), { ssr: false });
const Map = dynamic(() => import("./components/Map"), {
  ssr: false,
  loading: () => <div className="flex items-center justify-center h-full"><p>Loading map...</p></div>,
});

type Tab = "chat" | "visualize" | "compare" | "insights" | "about";
type MapTransition = "fly" | "instant";
type Mode = "researcher" | "newbie";

const RESEARCHER_TABS: { id: Tab; label: string; icon: FC<any> }[] = [
  { id: "chat", label: "Chat", icon: MessageSquare },
  { id: "visualize", label: "Visualize", icon: BarChart2 },
  { id: "compare", label: "Compare", icon: GitCompare },
  { id: "insights", label: "Insights", icon: Zap },
  { id: "about", label: "About", icon: Info },
];

const NEWBIE_TABS: { id: Tab; label: string; icon: FC<any> }[] = [
    { id: "chat", label: "Helper", icon: MessageSquare },
    { id: "visualize", label: "Diagram", icon: BarChart2 },
    { id: "compare", label: "Distinguish", icon: GitCompare },
    { id: "insights", label: "Info", icon: Zap },
    { id: "about", label: "About", icon: Info },
];

const mockFloats = [
    { 
        id: 1, platform_number: 98765, project_name: "INCOIS", last_cycle: 15, 
        position: [-10.0, 85.0] as LatLngExpression, 
        trajectory: [
            [-14.0, 75.0], [-12.5, 76.5], [-11.0, 75.5], [-10.5, 78.0], 
            [-9.0, 79.0], [-11.0, 82.0], [-12.0, 84.0], [-10.0, 85.0]
        ] as LatLngExpression[] 
    },
    { 
        id: 2, platform_number: 12345, project_name: "NOAA", last_cycle: 22, 
        position: [-15.0, 78.0] as LatLngExpression, 
        trajectory: [
            [-8.0, 77.0], [-10.0, 79.0], [-12.0, 81.0], [-14.0, 80.0],
            [-16.0, 79.0], [-15.0, 78.0]
        ] as LatLngExpression[] 
    },
    { 
        id: 3, platform_number: 54321, project_name: "CSIRO", last_cycle: 8, 
        position: [-13.0, 83.0] as LatLngExpression,
        trajectory: [
            [-18.0, 80.0], [-16.0, 81.0], [-14.0, 79.0], [-12.0, 81.5],
            [-11.5, 83.5], [-13.0, 83.0]
        ] as LatLngExpression[]
    },
];

export default function Page() {
  const [theme, setTheme] = useState<"light" | "dark">("dark");
  const [mode, setMode] = useState<Mode>("researcher");
  const [showWaveAnimation, setShowWaveAnimation] = useState(false);
  const [showDrippingEffect, setShowDrippingEffect] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>("visualize");
  const [messages, setMessages] = useState([
    { id: 1, who: "system", text: "Ask about floats, e.g., 'show salinity near equator in March 2023'" },
  ]);

  const [mapCenter, setMapCenter] = useState<LatLngExpression>([0, 80]);
  const [mapZoom, setMapZoom] = useState(3);
  const [selectedFloat, setSelectedFloat] = useState(null);
  const [regionSummary, setRegionSummary] = useState(null);
  const [mapTransition, setMapTransition] = useState<MapTransition>('fly');

  const [filters, setFilters] = useState({
    startDate: "2023-03-01",
    endDate: "2023-03-31",
    region: "Indian Ocean",
    parameter: "Salinity",
    floatId: "",
  });

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  const handleModeToggle = () => {
    if (mode === "researcher") {
      setShowWaveAnimation(true);
      setShowDrippingEffect(false); 
      
      setTimeout(() => {
        setMode("newbie");
        setActiveTab("visualize");
        setShowWaveAnimation(false);
        setShowDrippingEffect(true); 
        setTimeout(() => {
            setShowDrippingEffect(false); 
        }, 1500); 
      }, 5000); 
    } else {
      setMode("researcher");
      setActiveTab("visualize"); 
      setShowWaveAnimation(false);
      setShowDrippingEffect(false);
    }
  };

  const handleFloatSelect = (float) => {
    setMapTransition('fly');
    setRegionSummary(null);
    setSelectedFloat(float);
    setMapCenter(float.position);
    setMapZoom(7);
  };
  
  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleApplyFilters = () => {
    setMapTransition('instant');
    setSelectedFloat(null);
    
    setRegionSummary({
        region: filters.region,
        floats: mockFloats,
    });
    
    const mockRegionCenters = {
        "Indian Ocean": [0, 80],
        "Equatorial Region": [0, -120],
        "North Atlantic": [40, -40],
        "Southern Ocean": [-60, 0]
    };
    setMapCenter(mockRegionCenters[filters.region] || [0, 80]);
    setMapZoom(3);
  };

  const handleDetailClose = () => {
    setSelectedFloat(null);
    setRegionSummary(null);
  };

  const renderDashboard = () => {
    if (mode === 'newbie') {
      switch (activeTab) {
        case "chat":
            return <NewbieHelper messages={messages} setMessages={setMessages} />;
        case "visualize":
            return (
                <NewbieDiagram
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
            return <NewbieDistinguish theme={theme} />;
        case "insights":
            return <NewbieInfo />;
        case "about":
            return <AboutTab />;
        default:
            return null;
      }
    }
    return (
        <div className="max-w-7xl mx-auto">
          {activeTab === "chat" && <ChatTab messages={messages} setMessages={setMessages} />}
          {activeTab === "visualize" && (
            <VisualizeTab
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
          )}
          {activeTab === "compare" && <CompareTab theme={theme} />}
          {activeTab === "insights" && <InsightsTab />}
          {activeTab === "about" && <AboutTab />}
        </div>
    );
  };

  return (
    <div className="flex flex-col h-screen bg-background text-foreground font-sans overflow-hidden">
      <Header 
        theme={theme} 
        setTheme={setTheme} 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        mode={mode} 
        onModeToggle={handleModeToggle} 
        showDrippingEffect={showDrippingEffect}
      />
      <main className="flex-1 p-4 sm:p-6 md:p-8 overflow-y-auto relative">
        {showWaveAnimation && <WaveAnimation />}
        {renderDashboard()}
      </main>
    </div>
  );
}

// --- Components ---

const Header = ({ theme, setTheme, activeTab, setActiveTab, mode, onModeToggle, showDrippingEffect }) => {
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

const ChatTab = ({ messages, setMessages }) => (
  <section className="max-w-4xl mx-auto h-[calc(100vh-150px)] flex flex-col animate-fade-in">
    <div className="bg-card rounded-xl shadow-lg p-4 sm:p-6 flex flex-col h-full">
        <h2 className="text-xl font-bold mb-4 border-b pb-3 text-primary">Chat with ARGO AI</h2>
        <div className="flex-1 space-y-4 overflow-y-auto pr-2 mb-4">
          {messages.map((m) => (
            <div key={m.id} className={`flex ${m.who === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-xs lg:max-w-xl p-3 rounded-2xl ${
                m.who === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted text-foreground'
              }`}>
                <p className="text-sm">{m.text}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-auto flex items-center gap-2 border-t pt-4">
            <input
                className="flex-1 p-3 rounded-full border bg-background dark:bg-slate-700 focus:ring-2 focus:ring-primary focus:outline-none"
                placeholder="Ask a question..."
                onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      const val = (e.target as HTMLInputElement).value.trim();
                      if (!val) return;
                      setMessages((prev) => [...prev, { id: Date.now(), who: 'user', text: val }]);
                      (e.target as HTMLInputElement).value = '';
                      setTimeout(() => {
                        setMessages((prev) => [...prev, { id: Date.now() + 1, who: 'ai', text: `This is a mock response for: "${val}"` }]);
                      }, 800);
                    }
                }}
            />
            <button className="p-3 bg-primary text-primary-foreground rounded-full hover:bg-primary/90 transition-transform transform active:scale-95">
                <Send size={20} />
            </button>
        </div>
    </div>
    <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.5s ease-out forwards;
        }
      `}</style>
  </section>
);

const VisualizeTab = ({ filters, handleFilterChange, handleApplyFilters, mapCenter, mapZoom, selectedFloat, regionSummary, onFloatSelect, onDetailClose, theme, mapTransition }) => (
    <section className="grid md:grid-cols-4 gap-6 h-[calc(100vh-120px)]">
      <aside className="col-span-1 bg-card rounded-xl shadow-lg p-6 flex flex-col space-y-6">
        <h3 className="text-xl font-bold border-b pb-3">Filters</h3>
        <FilterGroup label="Date Range"><div className="flex gap-2"><input type="date" name="startDate" value={filters.startDate} onChange={handleFilterChange} className="filter-input" /><input type="date" name="endDate" value={filters.endDate} onChange={handleFilterChange} className="filter-input" /></div></FilterGroup>
        <FilterGroup label="Region"><select name="region" value={filters.region} onChange={handleFilterChange} className="filter-input"><option>Indian Ocean</option><option>Equatorial Region</option><option>North Atlantic</option><option>Southern Ocean</option></select></FilterGroup>
        <FilterGroup label="Parameter"><select name="parameter" value={filters.parameter} onChange={handleFilterChange} className="filter-input"><option>Salinity</option><option>Temperature</option></select></FilterGroup>
        <FilterGroup label="Float ID"><div className="relative"><Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" /><input type="text" name="floatId" placeholder="Search by ID..." value={filters.floatId} onChange={handleFilterChange} className="filter-input pl-10" /></div></FilterGroup>
        <button onClick={handleApplyFilters} className="mt-auto w-full py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-all transform active:scale-95 shadow-lg">Apply Filters</button>
      </aside>
      <div className="col-span-3 bg-card rounded-xl shadow-lg overflow-hidden relative">
        <Map center={mapCenter} zoom={mapZoom} selectedFloatId={selectedFloat?.id} onFloatSelect={onFloatSelect} transition={mapTransition} floats={mockFloats} theme={theme}/>
        <SidePanel float={selectedFloat} summary={regionSummary} onClose={onDetailClose} theme={theme} />
      </div>
    </section>
);

const CompareTab = ({ theme }) => {
  const commonDepth = [0, 100, 200, 400, 600, 800, 1000];
  
  const floatA_data = {
    y: commonDepth,
    x: [25, 22, 18, 12, 8, 6, 5],
    name: 'Float #98765 (Warm Core)',
    type: 'scatter',
    mode: 'lines+markers',
    line: { color: '#3b82f6', width: 3 },
    marker: { symbol: 'circle', size: 8 }
  };

  const floatB_data = {
    y: commonDepth,
    x: [18, 17, 15, 14, 11, 7, 4],
    name: 'Float #12345 (Cold Intrusion)',
    type: 'scatter',
    mode: 'lines+markers',
    line: { color: '#ef4444', width: 3, dash: 'dash' },
    marker: { symbol: 'square', size: 8 }
  };

  const floatC_data = {
    y: commonDepth,
    x: [22, 19, 17, 10, 9, 8, 6],
    name: 'Float #54321 (Standard Profile)',
    type: 'scatter',
    mode: 'lines+markers',
    line: { color: '#10b981', width: 3 },
    marker: { symbol: 'diamond', size: 8 }
  };

  const layout = {
    title: 'Comparative Profile Analysis: Temperature vs. Depth',
    paper_bgcolor: 'transparent',
    plot_bgcolor: 'transparent',
    font: { color: theme === 'dark' ? '#e6edf3' : '#1a202c', family: 'sans-serif' },
    xaxis: { title: 'Temperature (°C)', gridcolor: theme === 'dark' ? '#374151' : '#e5e7eb', zeroline: false },
    yaxis: { title: 'Depth (m)', autorange: 'reversed', gridcolor: theme === 'dark' ? '#374151' : '#e5e7eb', zeroline: false },
    legend: { orientation: 'h', y: -0.2, x: 0.5, xanchor: 'center' },
    hovermode: 'x unified'
  };

  return (
    <section className="bg-card p-4 sm:p-6 rounded-xl shadow-lg animate-fade-in">
      <h3 className="text-xl font-bold mb-4">Float Profile Comparison</h3>
      <div className="w-full h-[65vh]">
        <Plot
          data={[floatA_data, floatB_data, floatC_data]}
          layout={layout}
          style={{ width: "100%", height: "100%" }}
          useResizeHandler
        />
      </div>
      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.5s ease-out forwards;
        }
      `}</style>
    </section>
  );
};

const InsightsTab = () => (
  <section className="grid md:grid-cols-3 gap-6">
    {[
        { title: 'Unusual Salinity Drop', text: 'Detected a significant drop in salinity in the Bay of Bengal, potentially linked to increased freshwater influx.' },
        { title: 'Oxygen Minimum Zone', text: 'Analysis shows an expansion of the Oxygen Minimum Zone in the Arabian Sea over the last quarter.' },
        { title: 'Heatwave Anomaly', text: 'An underwater heatwave anomaly was observed in the Southern Indian Ocean, with temperatures 2°C above average.' }
    ].map((insight, i) => (
      <div key={i} className="bg-card p-6 rounded-xl shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all transform">
        <h4 className="font-bold text-lg">{insight.title}</h4>
        <p className="text-sm mt-2 text-muted-foreground">{insight.text}</p>
        <div className="mt-4">
          <button className="px-4 py-2 bg-primary text-primary-foreground text-sm font-semibold rounded-lg hover:bg-primary/90 transition-colors">
            View Details
          </button>
        </div>
      </div>
    ))}
  </section>
);

const AboutTab = () => (
    <section className="mt-4">
      <div className="bg-card p-8 rounded-xl shadow-lg max-w-4xl mx-auto">
        <h2 className="text-3xl font-bold text-primary">About ARGO Explorer</h2>
        <p className="mt-4 text-muted-foreground">
          This is a demonstration of a modern, AI-powered interface for exploring ARGO float data. The current frontend is a showcase of what's possible with interactive maps and charts, built with Next.js, Plotly, and Leaflet.
        </p>
        <p className="mt-2 text-muted-foreground">
          The next phase of development will involve connecting this interface to a robust backend, replacing the mock data with live queries to a Postgres database and leveraging a Retrieval-Augmented Generation (RAG) pipeline for the conversational AI.
        </p>
      </div>
    </section>
);

const NewbieHelper = ({ messages, setMessages }) => {
    useEffect(() => {
        setMessages([
            { id: 1, who: "ai", text: "Hello! Welcome to the Newbie Helper. I'm here to guide you through the world of ARGO floats. How can I assist you today?" },
        ]);
    }, [setMessages]);

    return (
        <section className="max-w-4xl mx-auto h-[calc(100vh-150px)] flex flex-col animate-fade-in">
            <div className="bg-card rounded-xl shadow-lg p-4 sm:p-6 flex flex-col h-full">
                <h2 className="text-xl font-bold mb-4 border-b pb-3 text-primary">Helper</h2>
                <div className="flex-1 space-y-4 overflow-y-auto pr-2 mb-4">
                  {messages.map((m) => (
                    <div key={m.id} className={`flex ${m.who === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-xs lg:max-w-xl p-3 rounded-2xl ${
                        m.who === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted text-foreground'
                      }`}>
                        <p className="text-sm">{m.text}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-auto flex items-center gap-2 border-t pt-4">
                    <input
                        className="flex-1 p-3 rounded-full border bg-background dark:bg-slate-700 focus:ring-2 focus:ring-primary focus:outline-none"
                        placeholder="Ask a question..."
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                const val = (e.target as HTMLInputElement).value.trim();
                                if (!val) return;
                                setMessages((prev) => [...prev, { id: Date.now(), who: 'user', text: val }]);
                                (e.target as HTMLInputElement).value = '';
                                setTimeout(() => {
                                  setMessages((prev) => [...prev, { id: Date.now() + 1, who: 'ai', text: `This is a mock response for: "${val}"` }]);
                                }, 800);
                            }
                        }}
                    />
                    <button className="p-3 bg-primary text-primary-foreground rounded-full hover:bg-primary/90 transition-transform transform active:scale-95">
                        <Send size={20} />
                    </button>
                </div>
            </div>
            <style jsx>{`
                @keyframes fade-in {
                  from { opacity: 0; transform: translateY(10px); }
                  to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in {
                  animation: fade-in 0.5s ease-out forwards;
                }
              `}</style>
        </section>
    );
};

const NewbieDiagram = ({ filters, handleFilterChange, handleApplyFilters, mapCenter, mapZoom, selectedFloat, regionSummary, onFloatSelect, onDetailClose, theme, mapTransition }) => (
    <section className="grid md:grid-cols-4 gap-6 h-[calc(100vh-120px)]">
      <aside className="col-span-1 bg-card rounded-xl shadow-lg p-6 flex flex-col space-y-6">
        <h3 className="text-xl font-bold border-b pb-3">Simple Filters</h3>
        <FilterGroup label="Parameter">
            <select name="parameter" value={filters.parameter} onChange={handleFilterChange} className="filter-input">
                <option>Salinity</option>
                <option>Temperature</option>
            </select>
        </FilterGroup>
        <FilterGroup label="Float ID">
            <div className="relative">
                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input type="text" name="floatId" placeholder="Search by ID..." value={filters.floatId} onChange={handleFilterChange} className="filter-input pl-10" />
            </div>
        </FilterGroup>
        <button onClick={handleApplyFilters} className="mt-auto w-full py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-all transform active:scale-95 shadow-lg">Apply Filters</button>
      </aside>
      <div className="col-span-3 bg-card rounded-xl shadow-lg overflow-hidden relative">
        <Map center={mapCenter} zoom={mapZoom} selectedFloatId={selectedFloat?.id} onFloatSelect={onFloatSelect} transition={mapTransition} floats={mockFloats} theme={theme}/>
        <SidePanel float={selectedFloat} summary={regionSummary} onClose={onDetailClose} theme={theme} />
      </div>
    </section>
);

const NewbieDistinguish = ({ theme }) => {
    const floatData = [
        { id: 98765, project: "INCOIS", lastCycle: 15, position: "[-10.0, 85.0]", temp: "25°C" },
        { id: 12345, project: "NOAA", lastCycle: 22, position: "[-15.0, 78.0]", temp: "18°C" },
        { id: 54321, project: "CSIRO", lastCycle: 8, position: "[-13.0, 83.0]", temp: "22°C" },
    ];

    const isDark = theme === 'dark';

    return (
        <section className="bg-card p-4 sm:p-6 rounded-xl shadow-lg animate-fade-in">
            <h3 className="text-xl font-bold mb-4">Float Comparison Table</h3>
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-800">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Float ID</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Project</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Last Cycle</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Last Temperature</th>
                        </tr>
                    </thead>
                    <tbody className="bg-card divide-y divide-gray-200 dark:divide-gray-700">
                        {floatData.map((float) => (
                            <tr key={float.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{float.id}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">{float.project}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">{float.lastCycle}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">{float.temp}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <style jsx>{`
                @keyframes fade-in {
                  from { opacity: 0; transform: translateY(10px); }
                  to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in {
                  animation: fade-in 0.5s ease-out forwards;
                }
            `}</style>
        </section>
    );
};

const NewbieInfo = () => <InsightsTab />;

const FilterGroup = ({ label, children }) => (
  <div className="flex flex-col gap-2">
    <label className="text-sm font-medium text-muted-foreground">{label}</label>
    {children}
  </div>
);

const WaveAnimation = () => (
  <div className="wave-animation-overlay">
    <div className="wave wave-back"></div>
    <div className="wave wave-mid"></div>
    <div className="wave wave-front"></div>
  </div>
);