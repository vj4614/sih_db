"use client";

import React from "react";
import dynamic from "next/dynamic";
import { PlotParams } from "react-plotly.js";

const Plot = dynamic(() => import("react-plotly.js"), { ssr: false });

// Helper function to define a consistent layout for the plots
const layoutBase = (title: string) => ({
  title,
  paper_bgcolor: "transparent",
  plot_bgcolor: "transparent",
  font: { color: "#0f172a" }, // Adapts to dark/light mode via CSS variables
  margin: { t: 28, b: 36, l: 48, r: 20 },
  legend: { orientation: "h", y: -0.15 },
});

// Define the props the component will accept
interface DetailShellProps {
  id: string;
  subtitle: string;
  left: PlotParams["data"];
  right: PlotParams["data"];
  how: string[];
}

export default function DetailShell({ id, subtitle, left, right, how }: DetailShellProps) {
  
  // Function to handle exporting the plot as a PNG image
  const exportPNG = async (plotId: string, filename:string) => {
    try {
      const el = document.getElementById(plotId);
      // Ensure Plotly is loaded and available on the window object before trying to use it
      if (el && (window as any).Plotly && (window as any).Plotly.toImage) {
        const imgData = await (window as any).Plotly.toImage(el, { format: "png", width: 1200, height: 600 });
        const a = document.createElement("a");
        a.href = imgData;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      } else {
        alert("Export functionality is not available at the moment.");
        console.warn("Plotly.toImage is not available. Check if the Plotly script is loaded.");
      }
    } catch (err) {
      console.error("Export failed:", err);
      alert("An error occurred during the export. Please see the console for details.");
    }
  };

  const plotLeftId = `${id}-left`;
  const plotRightId = `${id}-right`;

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Primary Visualization Panel */}
        <div className="bg-white dark:bg-slate-800 border rounded-lg p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-semibold">Primary visual</h4>
            <button
              onClick={() => exportPNG(plotLeftId, `${id}-left.png`)}
              className="text-xs px-3 py-1 border rounded hover:bg-muted transition"
            >
              Download PNG
            </button>
          </div>
          <div id={plotLeftId} className="h-72">
            <Plot
              data={left}
              layout={layoutBase(subtitle)}
              useResizeHandler
              style={{ width: "100%", height: "100%" }}
            />
          </div>
          <p className="text-xs text-muted-foreground mt-3">{subtitle}</p>
        </div>

        {/* Secondary Visualization Panel */}
        <div className="bg-white dark:bg-slate-800 border rounded-lg p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-semibold">Secondary visual</h4>
            <button
              onClick={() => exportPNG(plotRightId, `${id}-right.png`)}
              className="text-xs px-3 py-1 border rounded hover:bg-muted transition"
            >
              Download PNG
            </button>
          </div>
          <div id={plotRightId} className="h-72">
            <Plot
              data={right}
              layout={layoutBase("Detail")}
              useResizeHandler
              style={{ width: "100%", height: "100%" }}
            />
          </div>
          <p className="text-xs text-muted-foreground mt-3">Additional details and context for the visualization.</p>
        </div>
      </div>

      {/* "How this was calculated" Section */}
      <section className="mt-6 bg-white dark:bg-slate-800 border rounded-lg p-4 shadow-sm">
        <h4 className="font-semibold">How this was calculated</h4>
        <div className="mt-3 text-sm text-muted-foreground space-y-2">
          {how.map((line: string, idx: number) => (
            <div key={idx} className="flex gap-3 items-start">
              <div className="text-xs text-slate-400 mt-1">•</div>
              <div>{line}</div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}