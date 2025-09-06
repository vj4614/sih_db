// src/app/components/chat/ChatVisuals.tsx

"use client";

import React from 'react';
import dynamic from "next/dynamic";
import { X, Download } from 'lucide-react';

const Plot = dynamic(() => import("react-plotly.js"), { ssr: false });

// Professional color palette for multi-series graphs
const PLOT_COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f97316', '#8b5cf6'];

export default function ChatVisuals({ theme, graphData, onClose }) {
  if (!graphData || !graphData.data || graphData.data.length === 0) {
    return (
        <div className="relative h-full bg-card/80 backdrop-blur-lg rounded-2xl p-6 flex flex-col items-center justify-center">
             <button onClick={onClose} className="absolute top-4 right-4 p-2 rounded-lg hover:bg-muted/50 transition-colors" title="Close Visual">
                <X size={20} />
            </button>
            <p className="text-muted-foreground">No visual to display.</p>
        </div>
    )
  }

  const handleDownload = () => {
    const plotlyContainer = document.getElementById('plotly-graph-container');
    if (plotlyContainer) {
      const plotlyInstance = (plotlyContainer as any).getElementsByClassName('js-plotly-plot')[0];
      if (plotlyInstance && (window as any).Plotly) {
        (window as any).Plotly.downloadImage(plotlyInstance, {
          format: 'png',
          width: 1200,
          height: 800,
          filename: graphData.title.replace(/ /g, '_') || 'floatchat-graph'
        });
      }
    }
  };

  const plotLayout = {
    title: { text: graphData.title, font: { size: 18, family: 'Poppins', color: theme === 'dark' ? '#e6edf3' : '#1a202c', weight: '600' } },
    paper_bgcolor: 'transparent',
    plot_bgcolor: theme === 'dark' ? 'rgba(30, 41, 59, 0.5)' : 'rgba(241, 245, 249, 1)',
    font: { color: theme === 'dark' ? '#cbd5e1' : '#475569', size: 12, family: 'Fira Code' },
    xaxis: { title: { text: graphData.xAxisLabel, font: { size: 14 } }, gridcolor: theme === 'dark' ? '#374151' : '#e5e7eb', zeroline: false },
    yaxis: { title: { text: graphData.yAxisLabel, font: { size: 14 } }, gridcolor: theme === 'dark' ? '#374151' : '#e5e7eb', autorange: 'reversed', zeroline: false },
    margin: { t: 50, l: 60, r: 20, b: 60 },
    legend: { font: { family: 'Fira Code' }, orientation: 'h', y: -0.2, x: 0.5, xanchor: 'center' },
    hovermode: 'closest'
  };

  const plotData = graphData.data.map((series, index) => ({
    ...series,
    type: 'scatter',
    mode: 'lines+markers',
    line: { width: 3, color: PLOT_COLORS[index % PLOT_COLORS.length] },
    marker: { color: PLOT_COLORS[index % PLOT_COLORS.length] },
    // NEW: Detailed hover template for interactive tooltips
    hovertemplate: `<b>${graphData.yAxisLabel}:</b> %{y}<br>` +
                   `<b>${graphData.xAxisLabel}:</b> %{x}<br>` +
                   `<extra></extra>`, // Removes the default trace name from the tooltip
  }));

  return (
      <div className="relative h-full bg-card/80 backdrop-blur-lg rounded-2xl shadow-2xl shadow-primary/20 border-l border-white/10 dark:border-blue-800 p-6 sm:p-8 animate-fade-in flex flex-col items-center justify-center">
          <div className="w-full flex justify-between items-center absolute top-4 left-0 px-6">
            <button onClick={handleDownload} className="p-2 rounded-lg hover:bg-muted/50 transition-colors flex items-center gap-2 text-sm" title="Download as PNG">
                <Download size={18} />
                <span>Download</span>
            </button>
            <button onClick={onClose} className="p-2 rounded-lg hover:bg-muted/50 transition-colors" title="Close Visual">
                <X size={20} />
            </button>
          </div>

          <div className="w-full h-[80%] aspect-square max-w-full max-h-[calc(100vh-160px)] flex items-center justify-center pt-8">
              <div id="plotly-graph-container" className="w-full h-full animate-plot-appear rounded-lg overflow-hidden shadow-md">
                  <Plot
                      data={plotData}
                      layout={plotLayout}
                      style={{ width: "100%", height: "100%" }}
                      useResizeHandler
                      // UPDATED: config now allows the modebar to appear on hover for more interactivity
                      config={{ 
                        displayModeBar: 'hover',
                        modeBarButtonsToRemove: ['zoom2d', 'pan2d', 'select2d', 'lasso2d', 'zoomIn2d', 'zoomOut2d', 'autoScale2d', 'resetScale2d']
                      }}
                  />
              </div>
          </div>
      </div>
  );
}