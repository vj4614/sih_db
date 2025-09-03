"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { LatLngExpression } from "leaflet";

// Dynamically import Plotly for charting
const Plot = dynamic(() => import("react-plotly.js"), {
  ssr: false,
});

// Dynamically import the Map component to prevent SSR issues
const Map = dynamic(() => import("./components/Map"), {
  ssr: false,
  loading: () => <p className="text-center">Loading map...</p>,
});

export default function Page() {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [activeTab, setActiveTab] = useState<"chat" | "visualize" | "compare" | "insights" | "about">(
    "chat"
  );
  const [messages, setMessages] = useState([
    { id: 1, who: "system", text: "Ask about floats, e.g., show salinity near equator in March 2023" },
  ]);

  // State for map view control
  const [mapCenter, setMapCenter] = useState<LatLngExpression>([0, 80]);
  const [mapZoom, setMapZoom] = useState(4);

  // State for new filters, matching the image provided
  const [filters, setFilters] = useState({
    startDate: "2023-03-01",
    endDate: "2023-03-31",
    region: "Equatorial Region",
    parameter: "Salinity",
    floatId: "",
  });

  // Handle filter input changes
  const handleFilterChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };
  
  // Apply button functionality
  const handleApplyFilters = () => {
    console.log("Applying Filters:", filters);
    
    // Zoom to mock float location as an example action
    const mockFloatLocation: LatLngExpression = [-15.0, 75.0];
    setMapCenter(mockFloatLocation);
    setMapZoom(7);
  };

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  // Sample data for plots
  const salinityProfile = {
    x: [34.4, 35.0, 35.6, 35.8, 36.0],
    y: [0, 50, 200, 500, 1000],
  };
  const compareA = { x: [0, 100, 200], y: [10, 20, 15] };
  const compareB = { x: [0, 100, 200], y: [12, 18, 17] };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100">
      {/* NAV */}
      <header className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-sky-600 to-cyan-500 text-white">
        <div className="flex items-center gap-3">
          <div className="rounded-full bg-white/20 w-10 h-10 flex items-center justify-center text-lg">🌊</div>
          <h1 className="text-xl font-semibold">ARGO Explorer</h1>
        </div>
        <nav className="hidden md:flex gap-6">
          <button className="hover:underline" onClick={() => setActiveTab("chat")}>Chat</button>
          <button className="hover:underline" onClick={() => setActiveTab("visualize")}>Visualize</button>
          <button className="hover:underline" onClick={() => setActiveTab("compare")}>Compare</button>
          <button className="hover:underline" onClick={() => setActiveTab("insights")}>Insights</button>
          <button className="hover:underline" onClick={() => setActiveTab("about")}>About</button>
        </nav>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setTheme((t) => (t === "dark" ? "light" : "dark"))}
            className="bg-white/20 px-3 py-1 rounded"
          >
            {theme === "dark" ? "Light" : "Dark"}
          </button>
        </div>
      </header>

      {/* TABS */}
      <main className="px-4 md:px-12 py-8">
        <div className="md:hidden mb-4 flex gap-2">
          {(["chat", "visualize", "compare", "insights", "about"] as const).map(
            (tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-2 rounded ${
                  activeTab === tab ? "bg-sky-500 text-white" : "bg-white/60"
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            )
          )}
        </div>

        {/* Chat Tab */}
        {activeTab === "chat" && (
          <section className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="bg-white dark:bg-slate-800 p-4 rounded shadow">
                <h2 className="font-semibold mb-2">Chat with ARGO AI</h2>
                <div className="space-y-2 max-h-64 overflow-auto">
                  {messages.map((m) => (
                    <div
                      key={m.id}
                      className="p-2 rounded bg-gray-100 dark:bg-slate-700"
                    >
                      <strong>{m.who}</strong>: {m.text}
                    </div>
                  ))}
                </div>
                <div className="mt-3 flex gap-2">
                  <input
                    className="flex-1 p-2 rounded border dark:bg-slate-700"
                    placeholder='Try: "show salinity near equator in March 2023"'
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        const val = (e.target as HTMLInputElement).value.trim();
                        if (!val) return;
                        setMessages((prev) => [
                          ...prev,
                          { id: Date.now(), who: "user", text: val },
                        ]);
                        (e.target as HTMLInputElement).value = "";
                        setTimeout(() => {
                          setMessages((prev) => [
                            ...prev,
                            {
                              id: Date.now() + 1,
                              who: "ai",
                              text: `Mock result for: "${val}" — generated plot on right.`,
                            },
                          ]);
                        }, 800);
                      }
                    }}
                  />
                  <button
                    className="px-4 py-2 bg-sky-600 text-white rounded"
                    onClick={() =>
                      setMessages((prev) => [
                        ...prev,
                        {
                          id: Date.now(),
                          who: "user",
                          text: "Show mock salinity profile",
                        },
                      ])
                    }
                  >
                    Send
                  </button>
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-slate-800 p-4 rounded shadow">
              <h3 className="font-semibold mb-2">Mock Salinity Profile</h3>
              <div style={{ width: "100%", height: 420 }}>
                <Plot
                  data={[
                    {
                      x: salinityProfile.x,
                      y: salinityProfile.y,
                      type: "scatter",
                      mode: "lines+markers",
                      marker: { size: 6 },
                      name: "Salinity (PSU)",
                    },
                  ]}
                  layout={{
                    title: "Salinity vs Depth (mock)",
                    yaxis: { autorange: "reversed", title: "Depth (m)" },
                    xaxis: { title: "Salinity (PSU)" },
                    margin: { t: 40, l: 50, r: 30, b: 50 },
                    autosize: true,
                  }}
                  style={{ width: "100%", height: "100%" }}
                  useResizeHandler
                />
              </div>
            </div>
          </section>
        )}

        {/* Visualize Tab */}
        {activeTab === "visualize" && (
          <section className="grid md:grid-cols-4 gap-4">
            <aside className="col-span-1 bg-white dark:bg-slate-800 p-4 rounded shadow space-y-4">
              <h3 className="font-semibold">Filters</h3>
              
              <div>
                <label className="block text-sm font-medium mb-1">Date Range</label>
                <div className="flex gap-2">
                  <input
                    type="date"
                    name="startDate"
                    value={filters.startDate}
                    onChange={handleFilterChange}
                    className="w-full p-2 rounded border dark:bg-slate-700"
                  />
                  <input
                    type="date"
                    name="endDate"
                    value={filters.endDate}
                    onChange={handleFilterChange}
                    className="w-full p-2 rounded border dark:bg-slate-700"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="region" className="block text-sm font-medium mb-1">Region</label>
                <select
                  id="region"
                  name="region"
                  value={filters.region}
                  onChange={handleFilterChange}
                  className="w-full p-2 rounded border dark:bg-slate-700"
                >
                  <option>Equatorial Region</option>
                  <option>Indian Ocean</option>
                  <option>North Atlantic</option>
                  <option>Southern Ocean</option>
                </select>
              </div>

              <div>
                <label htmlFor="parameter" className="block text-sm font-medium mb-1">Parameter</label>
                <select
                  id="parameter"
                  name="parameter"
                  value={filters.parameter}
                  onChange={handleFilterChange}
                  className="w-full p-2 rounded border dark:bg-slate-700"
                >
                  <option>Salinity</option>
                  <option>Temperature</option>
                </select>
              </div>
              
              <div>
                <label htmlFor="floatId" className="block text-sm font-medium mb-1">Float ID</label>
                <input
                  type="text"
                  id="floatId"
                  name="floatId"
                  placeholder="Search..."
                  value={filters.floatId}
                  onChange={handleFilterChange}
                  className="w-full p-2 rounded border dark:bg-slate-700"
                />
              </div>

              <button
                onClick={handleApplyFilters}
                className="mt-2 w-full py-2 bg-sky-600 text-white rounded hover:bg-sky-700 transition-colors"
              >
                Apply
              </button>
            </aside>
            <div className="col-span-3 bg-white dark:bg-slate-800 p-2 rounded shadow h-[520px]">
              <h3 className="font-semibold px-3 py-2">
                ARGO Floats Trajectories
              </h3>
              <div className="h-[460px] rounded overflow-hidden">
                <Map center={mapCenter} zoom={mapZoom} />
              </div>
            </div>
          </section>
        )}

        {/* Other Tabs */}
        {activeTab === "compare" && (
          <section className="mt-4 grid md:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-slate-800 p-4 rounded shadow">
              <h3 className="font-semibold mb-2">Float A Profile (mock)</h3>
              <Plot
                data={[
                  {
                    x: compareA.x,
                    y: compareA.y,
                    type: "scatter",
                    mode: "lines+markers",
                    name: "Float A",
                  },
                ]}
                layout={{ title: "Float A" }}
                style={{ width: "100%", height: 320 }}
                useResizeHandler
              />
            </div>
            <div className="bg-white dark:bg-slate-800 p-4 rounded shadow">
              <h3 className="font-semibold mb-2">Float B Profile (mock)</h3>
              <Plot
                data={[
                  {
                    x: compareB.x,
                    y: compareB.y,
                    type: "scatter",
                    mode: "lines+markers",
                    name: "Float B",
                  },
                ]}
                layout={{ title: "Float B" }}
                style={{ width: "100%", height: 320 }}
                useResizeHandler
              />
            </div>
          </section>
        )}
        {activeTab === "insights" && (
          <section className="mt-4 grid md:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-white dark:bg-slate-800 p-4 rounded shadow"
              >
                <h4 className="font-semibold">Insight card #{i}</h4>
                <p className="text-sm mt-2">
                  Mock insight: unusual low oxygen in Arabian Sea in March 2023.
                </p>
                <div className="mt-3">
                  <button className="px-3 py-1 bg-sky-600 text-white rounded">
                    View details
                  </button>
                </div>
              </div>
            ))}
          </section>
        )}
        {activeTab === "about" && (
          <section className="mt-4">
            <div className="bg-white dark:bg-slate-800 p-6 rounded shadow">
              <h2 className="text-xl font-bold">About ARGO Explorer (Mock)</h2>
              <p className="mt-2 text-sm">
                This is a demo frontend using mock ARGO float data, Plotly
                charts and Leaflet maps. Replace mocks with backend APIs later
                to connect to Postgres / RAG pipelines.
              </p>
            </div>
          </section>
        )}
      </main>

      {/* FOOTER */}
      <footer className="py-4 px-6 bg-slate-100 dark:bg-slate-900 text-xs text-slate-600 dark:text-slate-400">
        <div className="max-w-6xl mx-auto flex justify-between">
          <span>Powered by ARGO • Mock demo</span>
          <span>Privacy • Terms • API Docs</span>
        </div>
      </footer>
    </div>
  );
}