"use client";

import React, { useState, useEffect, FC, ReactNode, useRef } from "react";
import dynamic from "next/dynamic";
import { LatLngExpression } from "leaflet";
import { Sun, Moon, MessageSquare, BarChart2, GitCompare, Zap, Info, Send, Search, User, GraduationCap, Droplet, Layers, MapPin, Globe, Hash, X } from 'lucide-react';
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
    }
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
            return <InsightsTab />;
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
      <main className="flex-1 p-4 sm:p-6 md:p-8 relative">
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

const ChatTab = ({ messages, setMessages }) => {
  const [typedMessage, setTypedMessage] = useState("");
  const [erasing, setErasing] = useState(false);
  const [messageIndex, setMessageIndex] = useState(0);

  const poeticLines = [
    "I am your Sailor to help you sail in the ocean.",
    "Let me navigate the complex data for you."
  ];

  const eraseSpeed = 30; // ms per character
  const typeSpeed = 50;  // ms per character
  const pauseTime = 1500; // ms pause between phases

  useEffect(() => {
    let timer: NodeJS.Timeout;

    if (!erasing) {
      // Typing phase
      if (typedMessage.length < poeticLines[messageIndex].length) {
        timer = setTimeout(() => {
          setTypedMessage(poeticLines[messageIndex].slice(0, typedMessage.length + 1));
        }, typeSpeed);
      } else {
        // Pause before erasing
        timer = setTimeout(() => {
          setErasing(true);
        }, pauseTime);
      }
    } else {
      // Erasing phase
      if (typedMessage.length > 0) {
        timer = setTimeout(() => {
          setTypedMessage(typedMessage.slice(0, typedMessage.length - 1));
        }, eraseSpeed);
      } else {
        // Move to the next message and loop
        setErasing(false);
        setMessageIndex((prevIndex) => (prevIndex + 1) % poeticLines.length);
      }
    }
    
    return () => clearTimeout(timer);
  }, [typedMessage, erasing, messageIndex]);

  return (
    <section className="max-w-4xl mx-auto h-[calc(100vh-150px)] flex flex-col animate-fade-in">
      <div className="bg-card rounded-xl shadow-lg p-4 sm:p-6 flex flex-col h-full border border-gray-200 dark:border-gray-800">
        <h2 className="text-xl font-bold mb-4 pb-3 text-primary border-b border-gray-200 dark:border-gray-800">Chat with ARGO AI</h2>
        <div className="flex-1 space-y-4 overflow-y-auto pr-2 mb-4">
          <div className="flex justify-start">
            <div className="max-w-xs lg:max-w-xl p-4 rounded-b-xl rounded-tr-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-primary-foreground shadow-md">
              <p className="text-sm font-light leading-relaxed">
                {typedMessage}
                <span className="blinking-cursor">|</span>
              </p>
            </div>
          </div>
          {messages.slice(1).map((m) => (
            <div key={m.id} className={`flex ${m.who === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-xs lg:max-w-xl p-3 rounded-2xl ${
                m.who === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted text-foreground'
              }`}>
                <p className="text-sm">{m.text}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-auto flex items-center gap-2 border-t pt-4 border-gray-200 dark:border-gray-800">
            <input
                className="flex-1 p-3 rounded-full border bg-background dark:bg-slate-700 focus:ring-2 focus:ring-primary focus:outline-none placeholder:italic placeholder:text-muted-foreground"
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
            <button className="p-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-primary-foreground rounded-full shadow-lg hover:scale-105 transition-all transform active:scale-95">
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
        @keyframes blink {
          50% { opacity: 0; }
        }
        .blinking-cursor {
          animation: blink 1s step-end infinite;
          font-weight: bold;
        }
      `}</style>
    </section>
  );
};

const FilterGroup = ({ label, children }) => (
  <div className="flex flex-col gap-2">
    <label className="text-sm font-medium text-muted-foreground">{label}</label>
    {children}
  </div>
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
    x: [20, 19, 16, 11, 9, 8, 6], // Adjusted temperature profile for better separation
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
    xaxis: { title: 'Temperature (°C)', gridcolor: theme === 'dark' ? '#374151' : '#e5e7eb', zeroline: false, scaleanchor: "y", scaleratio: 1 },
    yaxis: { 
      title: 'Depth (m)', 
      autorange: 'reversed', 
      gridcolor: theme === 'dark' ? '#374151' : '#e5e7eb', 
      zeroline: false,
    },
    legend: { orientation: 'h', y: -0.2, x: 0.5, xanchor: 'center' },
    hovermode: 'x unified'
  };

  const floatData = [
    { id: 'Float #98765 (Warm Core)', last_temp: floatA_data.x[0], min_temp: Math.min(...floatA_data.x) },
    { id: 'Float #12345 (Cold Intrusion)', last_temp: floatB_data.x[0], min_temp: Math.min(...floatB_data.x) },
    { id: 'Float #54321 (Standard Profile)', last_temp: floatC_data.x[0], min_temp: Math.min(...floatC_data.x) },
  ];

  const handleExportPDF = () => {
    alert("Exporting to PDF... (Functionality to be implemented)");
  };

  return (
    <div className="w-full h-screen overflow-y-scroll snap-y snap-mandatory bg-background text-foreground font-sans">
      <div className="max-w-7xl mx-auto h-screen snap-center flex-shrink-0 bg-card p-4 sm:p-6 rounded-xl shadow-lg flex flex-col justify-center animate-fade-in">
        <h3 className="text-xl font-bold mb-4">Float Profile Comparison</h3>
        <div className="w-full h-[65vh]">
          <Plot
            data={[floatA_data, floatB_data, floatC_data]}
            layout={layout}
            style={{ width: "100%", height: "100%" }}
            useResizeHandler
          />
        </div>
      </div>

      <div className="max-w-7xl mx-auto h-screen snap-center flex-shrink-0 bg-card p-4 sm:p-6 rounded-xl shadow-lg flex flex-col justify-center">
        <h4 className="text-lg font-bold mb-4">Summary Table</h4>
        <div className="overflow-x-auto w-full">
          <table className="w-full text-center divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="px-8 py-5 text-left text-xs font-bold text-muted-foreground uppercase tracking-wider">Float ID</th>
                <th className="px-8 py-5 text-center text-xs font-bold text-muted-foreground uppercase tracking-wider">Last Temperature (°C)</th>
                <th className="px-8 py-5 text-center text-xs font-bold text-muted-foreground uppercase tracking-wider">Min Temperature (°C)</th>
              </tr>
            </thead>
            <tbody className="bg-card divide-y divide-gray-200 dark:divide-gray-700">
              {floatData.map((float, index) => (
                <tr key={index} className="hover:bg-muted/50 transition-colors">
                  <td className="px-8 py-5 whitespace-nowrap text-sm font-medium text-left">{float.id}</td>
                  <td className="px-8 py-5 whitespace-nowrap text-sm text-center">{float.last_temp}</td>
                  <td className="px-8 py-5 whitespace-nowrap text-sm text-center">{float.min_temp}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="max-w-7xl mx-auto h-screen snap-center flex-shrink-0 bg-card/80 backdrop-blur-sm shadow-xl rounded-xl p-8 flex flex-col justify-center space-y-6">
        <h4 className="text-2xl font-extrabold text-primary mb-4">Conclusion - Key Takeaways</h4>
        <ul className="list-disc list-inside space-y-3 text-muted-foreground text-lg">
          <li>**Float #98765** shows a "Warm Core" profile, with the highest surface temperature of the three floats.</li>
          <li>**Float #12345** exhibits a "Cold Intrusion" pattern, with significantly lower temperatures at the surface and throughout its profile compared to the others.</li>
          <li>All three floats demonstrate a general trend of decreasing temperature as depth increases.</li>
          <li>At a depth of 1000m, the temperatures of the three floats are very similar, suggesting a more uniform deep-water environment.</li>
          <li>**Float #54321** represents a "Standard Profile," with temperatures falling between the warm core and cold intrusion examples.</li>
        </ul>
        <button 
          onClick={handleExportPDF} 
          className="mt-8 px-6 py-3 self-center bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold rounded-full shadow-lg hover:scale-105 transition-all transform active:scale-95"
        >
          Export as PDF
        </button>
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
    </div>
  );
};

const InsightsTab = () => {
  const insightData = [
    {
      title: 'Cause & Effect Analysis',
      icon: Layers,
      color: 'from-blue-500 to-purple-600',
      text: 'Analysis of data from Float #12345 suggests a direct correlation between a cold water intrusion and a significant drop in surface salinity. This event appears to be caused by an increased influx of meltwater from polar regions.',
      buttonText: 'Explore Cause & Effect',
      span: 'md:col-span-2'
    },
    {
      title: 'Max Temperature Warning',
      icon: Zap,
      color: 'from-red-500 to-red-800',
      text: 'An underwater heatwave anomaly was observed in the Southern Indian Ocean, with temperatures 2°C above the seasonal average. This poses a significant threat to local marine ecosystems.',
      buttonText: 'View Heatwave Data',
      vibrate: true,
    },
    {
      title: 'Increasing Salinity',
      icon: Droplet,
      color: 'from-green-500 to-teal-600',
      text: 'Long-term data from the region shows a consistent increase in deep-water salinity levels. This is a critical indicator of a changing thermohaline circulation which can be deadly for the environment.',
      buttonText: 'See Salinity Trends',
    },
    {
      title: 'Ecosystem Impact',
      icon: Globe,
      color: 'from-yellow-400 to-orange-600',
      text: 'The observed oceanographic anomalies have led to localized bleaching events and a decrease in phytoplankton density, signaling a potential shift in the region\'s marine ecosystem.',
      buttonText: 'Analyze Ecosystem Health',
    },
    {
      title: 'Uncategorized Anomaly',
      icon: Hash,
      color: 'from-indigo-500 to-pink-600',
      text: 'A novel data pattern has been detected in a remote section of the Indian Ocean. Its cause is currently unknown, highlighting the need for further exploration and data collection.',
      buttonText: 'Investigate Anomaly',
    },
  ];

  const [inView, setInView] = useState(false);
  const domRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setInView(true);
            observer.disconnect();
          }
        });
      },
      { threshold: 0.1 }
    );

    const currentRef = domRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }
    
    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, []);

  return (
    <section ref={domRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-4 md:p-6 lg:p-8">
      {insightData.map((insight, index) => {
        const InsightIcon = insight.icon;
        return (
          <div 
            key={index} 
            className={`
              p-8 bg-card rounded-3xl shadow-2xl flex flex-col justify-between 
              hover:shadow-primary/50 transition-shadow
              ${insight.span || ''}
              ${inView ? 'animate-slide-up' : 'opacity-0'}
              ${insight.vibrate ? 'vibrate-on-load' : ''}
            `}
            style={{ animationDelay: `${index * 0.15}s` }}
          >
            <div>
              <h4 className={`font-extrabold text-2xl text-transparent bg-clip-text bg-gradient-to-r ${insight.color} mb-4 flex items-center font-mono`}>
                <InsightIcon size={32} className="mr-3" /> {insight.title}
              </h4>
              <p className="text-muted-foreground leading-relaxed text-lg">
                {insight.text}
              </p>
            </div>
            <div className="mt-6 self-start">
              <button className={`px-6 py-3 bg-gradient-to-r ${insight.color} text-white font-bold rounded-full shadow-lg hover:scale-105 transition-all transform active:scale-95`}>
                {insight.buttonText}
              </button>
            </div>
          </div>
        )
      })}
      <style jsx>{`
        @keyframes vibrate-on-load {
          0% { transform: translate(0); }
          20% { transform: translate(-2px, 2px); }
          40% { transform: translate(-2px, -2px); }
          60% { transform: translate(2px, 2px); }
          80% { transform: translate(2px, -2px); }
          100% { transform: translate(0); }
        }
        .vibrate-on-load {
          animation: vibrate-on-load 0.2s linear infinite;
          animation-iteration-count: 1;
        }
        @keyframes slide-up {
            from { opacity: 0; transform: translateY(50px); }
            to { opacity: 1; transform: translateY(0); }
        }
        .animate-slide-up {
            animation: slide-up 0.6s ease-out forwards;
        }
      `}</style>
    </section>
  );
};

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

const WaveAnimation = () => (
  <div className="wave-animation-overlay">
    <div className="wave wave-back"></div>
    <div className="wave wave-mid"></div>
    <div className="wave wave-front"></div>
  </div>
);