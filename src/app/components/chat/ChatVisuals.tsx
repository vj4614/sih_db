"use client";

import React from 'react';
import dynamic from "next/dynamic";
import LoadingSpinner from './LoadingSpinner';
import { X } from 'lucide-react';

const Plot = dynamic(() => import("react-plotly.js"), { ssr: false });

export default function ChatVisuals({ theme, selectedVisual, onClose }) {
    const depth = [0, 100, 200, 400, 600, 800, 1000];
    const plotLayout = (title, xaxis, yaxis) => ({
        title: { text: title, font: { size: 18, family: 'Poppins', color: theme === 'dark' ? '#e6edf3' : '#1a202c', weight: '600' } },
        paper_bgcolor: 'transparent',
        plot_bgcolor: theme === 'dark' ? 'rgba(30, 41, 59, 0.5)' : 'rgba(241, 245, 249, 1)',
        font: { color: theme === 'dark' ? '#cbd5e1' : '#475569', size: 12, family: 'Fira Code' },
        xaxis: { title: { text: xaxis, font: { size: 14 } }, gridcolor: theme === 'dark' ? '#374151' : '#e5e7eb', zeroline: false },
        yaxis: { title: { text: yaxis, font: { size: 14 } }, gridcolor: theme === 'dark' ? '#374151' : '#e5e7eb', autorange: 'reversed', zeroline: false },
        margin: { t: 50, l: 60, r: 20, b: 60 },
        legend: { font: { family: 'Fira Code' } },
        hovermode: 'closest'
    });
    
    let plotData = [];
    let plotLayoutConfig = {};
    let plotTitle = "";

    switch (selectedVisual) {
        case 'Temperature Profile':
            plotData = [{ y: depth, x: [25, 22, 18, 12, 8, 6, 5], name: 'Temp', type: 'scatter', mode: 'lines', line: { color: '#f97316', width: 3 } }];
            plotTitle = 'Temperature Profile';
            plotLayoutConfig = plotLayout(plotTitle, 'Temp (°C)', 'Depth (m)');
            break;
        case 'Salinity Profile':
            plotData = [{ y: depth, x: [34.4, 35.0, 35.6, 35.8, 36.0, 35.2, 34.8], name: 'Salinity', type: 'scatter', mode: 'lines', line: { color: '#3b82f6', width: 3 } }];
            plotTitle = 'Salinity Profile';
            plotLayoutConfig = plotLayout(plotTitle, 'Salinity (PSU)', 'Depth (m)');
            break;
        case '2D Trajectory':
            plotData = [{ y: [-14.0,-12.5,-11.0,-10.5,-9.0,-11.0,-12.0,-10.0], x: [75.0, 76.5, 75.5, 78.0, 79.0, 82.0, 84.0, 85.0], name: 'Trajectory', type: 'scatter', mode: 'lines', line: { color: '#10b981', width: 3 } }];
            plotTitle = '2D Trajectory';
            plotLayoutConfig = { ...plotLayout(plotTitle, 'Longitude', 'Latitude'), yaxis: { scaleanchor: "x", scaleratio: 1, gridcolor: theme === 'dark' ? '#374151' : '#e5e7eb' } };
            break;
        default:
            return <div className="flex items-center justify-center h-full"><p>No visual selected.</p></div>;
    }
    
    return (
        <div className="relative h-full bg-card/80 backdrop-blur-lg rounded-2xl shadow-2xl shadow-primary/20 border-l border-white/10 dark:border-blue-800 p-6 sm:p-8 animate-fade-in flex flex-col items-center justify-center">
            <button onClick={onClose} className="absolute top-4 right-4 p-2 rounded-lg hover:bg-muted/50 transition-colors" title="Close Visual">
                <X size={20} />
            </button>
            <div className="w-full h-[80%] aspect-square max-w-full max-h-[calc(100vh-160px)] flex items-center justify-center">
                <div className="w-full h-full animate-plot-appear rounded-lg overflow-hidden shadow-md">
                    <Plot data={plotData} layout={plotLayoutConfig} style={{ width: "100%", height: "100%" }} useResizeHandler config={{ displayModeBar: false }}/>
                </div>
            </div>
        </div>
    );
};