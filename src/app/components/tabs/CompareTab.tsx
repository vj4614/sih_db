"use client";

import React from "react";
import dynamic from "next/dynamic";

const Plot = dynamic(() => import("react-plotly.js"), { ssr: false });

export default function CompareTab({ theme }) {
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
    x: [20, 19, 16, 11, 9, 8, 6],
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