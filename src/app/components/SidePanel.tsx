// src/app/components/SidePanel.tsx

"use client";

import React from "react";
import dynamic from "next/dynamic";
import { X, Hash, MapPin, Layers, Globe } from 'lucide-react';

const Plot = dynamic(() => import("react-plotly.js"), { ssr: false });

const plotLayout = (title: string, theme: string) => ({
    title: { text: title, font: { size: 16 } },
    paper_bgcolor: 'transparent',
    plot_bgcolor: 'transparent',
    font: { color: theme === 'dark' ? '#e6edf3' : '#1a202c' },
    xaxis: { title: 'Longitude', gridcolor: theme === 'dark' ? '#21262d' : '#e2e8f0' },
    yaxis: { title: 'Latitude', gridcolor: theme === 'dark' ? '#21262d' : '#e2e8f0', scaleanchor: "x", scaleratio: 1 },
    margin: { t: 40, l: 50, r: 20, b: 40 },
    legend: { orientation: 'h', y: -0.2 }
});

const InfoItem = ({ icon: Icon, label, value }) => (
    <div className="flex items-center text-sm">
        <Icon className="w-4 h-4 mr-3 text-muted-foreground" />
        <span className="font-semibold w-28">{label}:</span>
        <span className="text-muted-foreground">{value}</span>
    </div>
);

const FloatDetailView = ({ float, theme }) => {
    const trajectoryData = {
        x: float.trajectory.map(p => p[1]), // Longitude
        y: float.trajectory.map(p => p[0]), // Latitude
    };

    return (
        <>
            <div className="space-y-2">
                <InfoItem icon={Hash} label="Platform ID" value={float.platform_number} />
                <InfoItem icon={Layers} label="Project" value={float.project_name} />
                <InfoItem icon={MapPin} label="Last Location" value={`${float.position[0].toFixed(2)}, ${float.position[1].toFixed(2)}`} />
            </div>
            <div className="w-full h-[250px] mt-4">
                <Plot
                    data={[{
                        ...trajectoryData,
                        type: 'scatter',
                        mode: 'lines+markers',
                        name: `Float ${float.platform_number}`,
                        marker: { color: '#f97316' }
                    }]}
                    layout={plotLayout(`Trajectory for Float #${float.platform_number}`, theme)}
                    style={{ width: "100%", height: "100%" }}
                    useResizeHandler
                    config={{ displayModeBar: false }}
                />
            </div>
        </>
    );
};

const RegionSummaryView = ({ summary, theme }) => {
    const colors = ['#3b82f6', '#ef4444', '#10b981'];

    // Create the main trajectory lines
    const lineData = summary.floats.map((float, index) => ({
        x: float.trajectory.map(p => p[1]),
        y: float.trajectory.map(p => p[0]),
        type: 'scatter',
        mode: 'lines',
        name: `Float #${float.platform_number}`,
        line: { color: colors[index % colors.length], width: 3 },
        hoverinfo: 'none' // Hover info will be handled by markers
    }));

    // Create special markers for start and end points
    const markerData = summary.floats.flatMap((float, index) => {
        const startPoint = float.trajectory[0];
        const endPoint = float.trajectory[float.trajectory.length - 1];
        const color = colors[index % colors.length];
        return [
            {
                x: [startPoint[1]], y: [startPoint[0]],
                type: 'scatter', mode: 'markers', name: `Start #${float.platform_number}`,
                marker: { symbol: 'circle-open', size: 12, color: color, line: { width: 3 } },
                hovertemplate: `<b>Start #${float.platform_number}</b><br>Lat: %{y:.2f}<br>Lon: %{x:.2f}<extra></extra>`,
                showlegend: false
            },
            {
                x: [endPoint[1]], y: [endPoint[0]],
                type: 'scatter', mode: 'markers', name: `End #${float.platform_number}`,
                marker: { symbol: 'circle', size: 12, color: color },
                hovertemplate: `<b>End #${float.platform_number}</b><br>Lat: %{y:.2f}<br>Lon: %{x:.2f}<extra></extra>`,
                showlegend: false
            }
        ];
    });

    const layout = {
        title: { text: `Float Trajectories in ${summary.region}`, font: { size: 18, family: 'sans-serif' } },
        paper_bgcolor: 'transparent',
        plot_bgcolor: theme === 'dark' ? 'rgba(30, 41, 59, 0.5)' : 'rgba(241, 245, 249, 1)',
        font: { color: theme === 'dark' ? '#cbd5e1' : '#475569' },
        xaxis: { title: 'Longitude', gridcolor: theme === 'dark' ? '#374151' : '#e5e7eb', zeroline: false },
        yaxis: { title: 'Latitude', gridcolor: theme === 'dark' ? '#374151' : '#e5e7eb', scaleanchor: "x", scaleratio: 1, zeroline: false },
        legend: { orientation: 'h', y: -0.25, x: 0.5, xanchor: 'center', font: {size: 10} },
        hovermode: 'closest',
        showlegend: true,
        margin: { t: 40, l: 50, r: 20, b: 40 },
    };

    return (
        <>
            <div className="space-y-2">
                <InfoItem icon={Globe} label="Region" value={summary.region} />
                <InfoItem icon={Hash} label="Active Floats" value={summary.floats.length} />
            </div>
            <div className="w-full h-[320px] mt-4">
                <Plot
                    data={[...lineData, ...markerData]}
                    layout={layout}
                    style={{ width: "100%", height: "100%" }}
                    useResizeHandler
                    config={{ displayModeBar: false }}
                />
            </div>
        </>
    );
};

export default function SidePanel({ float, summary, onClose, theme }) {
  if (!float && !summary) return null;

  const isDetailView = !!float;
  const panelTitle = isDetailView ? "Float Details" : "Region Summary";

  return (
    <div className="absolute top-0 right-0 h-full w-full md:w-96 bg-card/80 dark:bg-card/90 backdrop-blur-sm border-l border-gray-200 dark:border-gray-800 shadow-2xl flex flex-col z-[1000] animate-slide-in">
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
        <h3 className="text-lg font-bold">{panelTitle}</h3>
        <button onClick={onClose} className="p-2 rounded-full hover:bg-muted transition-colors">
          <X size={20} />
        </button>
      </div>
      <div className="flex-1 p-4 space-y-4 overflow-y-auto">
        {isDetailView ? (
            <FloatDetailView float={float} theme={theme} />
        ) : (
            <RegionSummaryView summary={summary} theme={theme} />
        )}
      </div>
      <style jsx>{`
        @keyframes slide-in {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        .animate-slide-in {
          animation: slide-in 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
}