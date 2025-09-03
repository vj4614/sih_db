"use client";

import React, { useState, useEffect } from 'react';
import dynamic from "next/dynamic";
import LoadingSpinner from './LoadingSpinner';

const Plot = dynamic(() => import("react-plotly.js"), { ssr: false });

export default function ChatVisuals({ theme }) {
    const [visiblePlots, setVisiblePlots] = useState(0);

    useEffect(() => {
        const timer1 = setTimeout(() => setVisiblePlots(1), 500);
        const timer2 = setTimeout(() => setVisiblePlots(2), 1200);
        const timer3 = setTimeout(() => setVisiblePlots(3), 1900);
        return () => { clearTimeout(timer1); clearTimeout(timer2); clearTimeout(timer3); };
    }, []);

    const depth = [0, 100, 200, 400, 600, 800, 1000];
    const plotLayout = (title, xaxis, yaxis) => ({
        title: { text: title, font: { size: 14 } },
        paper_bgcolor: 'transparent',
        plot_bgcolor: theme === 'dark' ? 'rgba(30, 41, 59, 0.5)' : 'rgba(241, 245, 249, 1)',
        font: { color: theme === 'dark' ? '#cbd5e1' : '#475569', size: 10 },
        xaxis: { title: xaxis, gridcolor: theme === 'dark' ? '#374151' : '#e5e7eb' },
        yaxis: { title: yaxis, gridcolor: theme === 'dark' ? '#374151' : '#e5e7eb', autorange: 'reversed' },
        margin: { t: 30, l: 40, r: 20, b: 40 }
    });

    return (
        <div className="md:col-span-2 bg-card rounded-xl shadow-lg p-4 flex flex-col gap-4 animate-fade-in overflow-y-auto">
             <div className="h-64 w-full">{visiblePlots >= 1 ? (<div className="h-full w-full animate-plot-appear"><Plot data={[{ y: depth, x: [25, 22, 18, 12, 8, 6, 5], name: 'Temp', type: 'scatter', mode: 'lines', line: { color: '#f97316' } }]} layout={plotLayout('Temperature Profile', 'Temp (°C)', 'Depth (m)')} style={{ width: "100%", height: "100%" }} useResizeHandler config={{ displayModeBar: false }}/></div>) : <LoadingSpinner /> }</div>
            <div className="h-64 w-full">{visiblePlots >= 2 ? (<div className="h-full w-full animate-plot-appear"><Plot data={[{ y: depth, x: [34.4, 35.0, 35.6, 35.8, 36.0, 35.2, 34.8], name: 'Salinity', type: 'scatter', mode: 'lines', line: { color: '#3b82f6' } }]} layout={plotLayout('Salinity Profile', 'Salinity (PSU)', 'Depth (m)')} style={{ width: "100%", height: "100%" }} useResizeHandler config={{ displayModeBar: false }}/></div>) : visiblePlots >= 1 && <LoadingSpinner />}</div>
             <div className="h-64 w-full">{visiblePlots >= 3 ? (<div className="h-full w-full animate-plot-appear"><Plot data={[{ y: [-14.0,-12.5,-11.0,-10.5,-9.0,-11.0,-12.0,-10.0], x: [75.0, 76.5, 75.5, 78.0, 79.0, 82.0, 84.0, 85.0], name: 'Trajectory', type: 'scatter', mode: 'lines', line: { color: '#10b981' } }]} layout={{...plotLayout('2D Trajectory', 'Longitude', 'Latitude'), yaxis: { scaleanchor: "x", scaleratio: 1, gridcolor: theme === 'dark' ? '#374151' : '#e5e7eb' }}} style={{ width: "100%", height: "100%" }} useResizeHandler config={{ displayModeBar: false }}/></div>) : visiblePlots >= 2 && <LoadingSpinner />}</div>
        </div>
    );
};