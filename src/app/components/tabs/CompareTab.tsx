"use client";

import React, { useEffect, useMemo, useState, useRef } from "react";
import dynamic from "next/dynamic";
import { Download, Printer, ChevronDown } from 'lucide-react';

const Plot = dynamic(() => import("react-plotly.js"), { ssr: false }) as any;

/* Types */
type FloatSeries = {
  id: string;
  temps: number[]; // temperatures corresponding to depths[]
  color?: string;
  emoji?: string;
};

type TraceData = {
  x: number[];
  y: number[];
  name: string;
  mode: string;
  type: "scatter";
  marker: {
    size: number;
    symbol: string;
    line: { width: number; color: string };
    color: string | undefined;
  };
  line: {
    color: string | undefined;
    width: number;
    shape: string;
    smoothing: number;
  };
  hovertemplate: string;
};

type CustomSelectProps = {
  options: string[];
  value: string;
  onChange: (value: string) => void;
  ariaLabel: string;
};

type Props = {
  theme?: "light" | "dark";
  floats?: FloatSeries[]; // optional override
  depths?: number[];
};

// ---------- Constants defined outside component to prevent re-creation on re-renders ----------
const defaultDepths = [0, 50, 100, 200, 400, 600, 800, 1000];

const oceanPresets: Record<string, FloatSeries[]> = {
  Atlantic: [
      { id: "AT-98765 (Warm Core)", temps: [26, 24, 21, 16, 11, 8, 6, 5], color: "#F97316", emoji: "🔥" }, // Orange
      { id: "AT-12345 (Cold Front)", temps: [19, 18, 16, 14, 11, 8, 6, 5], color: "#3B82F6", emoji: "❄️" }, // Blue
      { id: "AT-54321 (Standard)", temps: [22, 21, 19, 15, 12, 9, 7, 6], color: "#10B981", emoji: "🌊" }  // Green
  ],
  Pacific: [
    { id: "PX-10234 (Warm Core)", temps: [27, 25, 22, 17, 12, 9, 7, 6], color: "#ff5c33", emoji: "🔥" },
    { id: "PX-20456 (Upwelling)", temps: [16, 15, 14, 12, 10, 8, 6, 5], color: "#1e90ff", emoji: "❄️" },
    { id: "PX-30987 (Typical)", temps: [21, 19, 17, 14, 11, 9, 7, 6], color: "#10b981", emoji: "🌊" }
  ],
  Indian: [
    { id: "IN-55678 (Warm)", temps: [28, 26, 23, 18, 13, 10, 8, 7], color: "#ff8a3d", emoji: "🔥" },
    { id: "IN-66778 (Cool Patch)", temps: [18, 17, 15, 13, 11, 9, 7, 6], color: "#3b82f6", emoji: "❄️" },
    { id: "IN-77889 (Baseline)", temps: [23, 21, 19, 15, 12, 10, 8, 7], color: "#22c55e", emoji: "🌊" }
  ],
  Southern: [
    { id: "SO-00123 (Cold Core)", temps: [10, 9, 8, 7, 6, 5, 4, 3], color: "#2b6eff", emoji: "❄️" },
    { id: "SO-00987 (Mixed)", temps: [14, 13, 12, 10, 9, 8, 6, 5], color: "#57cc99", emoji: "🌊" }
  ],
  Arctic: [
    { id: "AR-90001 (Cold Surface)", temps: [4, 3.8, 3.5, 3.2, 3.0, 2.8, 2.6, 2.5], color: "#1f78ff", emoji: "❄️" },
    { id: "AR-90002 (Standard)", temps: [5, 4.6, 4.2, 3.9, 3.6, 3.4, 3.1, 3.0], color: "#2dd4bf", emoji: "🌊" }
  ]
};

const CustomSelect = ({ options, value, onChange, ariaLabel }: CustomSelectProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (option: string) => {
    onChange(option);
    setIsOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
  }

  return (
    <div className="relative w-36" ref={ref} onKeyDown={handleKeyDown}>
      <button
        type="button"
        className="flex items-center justify-between w-full px-3 py-1.5 border rounded-md bg-background text-foreground border-border text-sm focus:ring-2 focus:ring-ring focus:outline-none transition-colors duration-200"
        onClick={() => setIsOpen(!isOpen)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label={ariaLabel}
      >
        <span>{value}</span>
        <ChevronDown size={16} className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      {isOpen && (
        <ul
          className="absolute z-10 w-full mt-1 bg-card/80 backdrop-blur-md border border-border rounded-md shadow-lg overflow-hidden animate-fade-in-scale"
          role="listbox"
          aria-label={ariaLabel}
        >
          {options.map((option: string) => (
            <li
              key={option}
              className="px-3 py-2 text-sm text-foreground hover:bg-primary/20 cursor-pointer"
              onClick={() => handleSelect(option)}
              onKeyPress={(e) => e.key === 'Enter' && handleSelect(option)}
              tabIndex={0}
              role="option"
              aria-selected={value === option}
            >
              {option}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};


/* Component */
export default function CompareTab({ theme = "light", floats: floatsProp, depths: depthsProp }: Props) {
  const depths = depthsProp ?? defaultDepths;
  const [ocean, setOcean] = useState<string>("Atlantic");
  const floatsFromPreset = floatsProp ?? oceanPresets[ocean] ?? oceanPresets["Atlantic"];
  const [visibleIds, setVisibleIds] = useState<string[]>(floatsFromPreset.map((f) => f.id));
  const [smoothCurves, setSmoothCurves] = useState<boolean>(true);
  const [showThermoclineBand, setShowThermoclineBand] = useState<boolean>(true);
  const [thermoclineRange, setThermoclineRange] = useState<{ min: number; max: number }>({ min: 50, max: 300 });
  const [plotReady, setPlotReady] = useState<boolean>(false);
  const [animatedTraces, setAnimatedTraces] = useState<TraceData[]>([]);
  const [highlightedId, setHighlightedId] = useState<string | null>(null);
  const tabRef = useRef<HTMLDivElement>(null);
  const [isIntersecting, setIsIntersecting] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [depthRange, setDepthRange] = useState<{ min: number; max: number }>({ min: Math.min(...depths), max: Math.max(...depths) });

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    const handleChange = () => setPrefersReducedMotion(mediaQuery.matches);
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  useEffect(() => {
    setVisibleIds(floatsFromPreset.map((f) => f.id));
    setPlotReady(false);
  }, [ocean, floatsProp]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !plotReady) {
          setTimeout(() => setPlotReady(true), 150);
        }
        setIsIntersecting(entry.isIntersecting);
      },
      { threshold: 0.1 }
    );
    if (tabRef.current) observer.observe(tabRef.current);
    return () => observer.disconnect();
  }, [plotReady]);

  function mean(arr: number[]) {
    if (arr.length === 0) return NaN;
    return arr.reduce((a, b) => a + b, 0) / arr.length;
  }

  const stats = useMemo(() => {
    return floatsFromPreset.map((f) => ({
      id: f.id,
      type: f.id.match(/\((.*?)\)/)?.[1] || 'Standard',
      surface: f.temps[0],
      min: Math.min(...f.temps),
      max: Math.max(...f.temps),
      mean: Number(mean(f.temps).toFixed(2)),
      color: f.color,
      emoji: f.emoji
    }));
  }, [floatsFromPreset]);

  const xAll = floatsFromPreset.flatMap((f) => f.temps);
  const xMin = Math.floor(Math.min(...xAll) - 2);
  const xMax = Math.ceil(Math.max(...xAll) + 2);

  const baseTraces = useMemo(() => {
     const filteredData = depths
      .map((depth, index) => ({ depth, index }))
      .filter(({ depth }) => depth >= depthRange.min && depth <= depthRange.max);
      
    return floatsFromPreset
      .filter((f) => visibleIds.includes(f.id))
      .map((f) => {
        const isHighlighted = highlightedId === f.id;
        const x = filteredData.map(({ index }) => f.temps[index]);
        const y = filteredData.map(({ depth }) => depth);

        return {
          x,
          y,
          name: f.id,
          mode: "lines+markers",
          type: "scatter" as const,
          marker: {
            size: isHighlighted ? 11 : 8,
            symbol: 'circle',
            line: { width: 2, color: theme === 'dark' ? '#0a192f' : '#ffffff' },
            color: f.color,
          },
          line: { 
            color: f.color, 
            width: isHighlighted ? 4 : 2.5, 
            shape: smoothCurves ? "spline" : "linear", 
            smoothing: 1.3 
          },
          hovertemplate: `<b>${f.id.split(' ')[0]}</b><br>Depth: %{y} m<br>Temp: %{x}°C<extra></extra>`
        };
      });
  }, [floatsFromPreset, visibleIds, highlightedId, smoothCurves, theme, depths, depthRange]);

  useEffect(() => {
    if (!plotReady || !isIntersecting) {
      setAnimatedTraces(baseTraces.map(t => ({...t, x: [], y: []})));
      return;
    }

    if (prefersReducedMotion) {
      setAnimatedTraces(baseTraces);
      return;
    }

    const maxLen = Math.max(0, ...baseTraces.map(t => t.x.length));
    let frame = 0;
    let animationFrameId: number;

    const animate = () => {
      frame++;
      if (frame <= maxLen) {
        setAnimatedTraces(baseTraces.map(trace => ({
          ...trace,
          x: trace.x.slice(0, frame),
          y: trace.y.slice(0, frame),
        })));
        animationFrameId = requestAnimationFrame(animate);
      }
    };

    animationFrameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrameId);
  }, [plotReady, isIntersecting, baseTraces, prefersReducedMotion]);

  const shapes: any[] = [];
  if (showThermoclineBand) {
    shapes.push({
      type: "rect", xref: "x", yref: "y", x0: xMin, x1: xMax,
      y0: thermoclineRange.min, y1: thermoclineRange.max,
      fillcolor: theme === 'dark' ? "rgba(255, 165, 0, 0.1)" : "rgba(255, 165, 0, 0.08)",
      line: { width: 1, color: theme === 'dark' ? 'rgba(255, 165, 0, 0.3)' : 'rgba(255, 165, 0, 0.2)', dash: 'dash' },
      layer: "below"
    });
  }
  
  const layout: any = {
    title: { 
        text: `<b>${ocean} Ocean:</b> Temperature vs. Depth Profile`, 
        font: { size: 16, family: "Inter, sans-serif", color: theme === 'dark' ? '#cbd5e1' : '#4b5563' },
        x: 0.04, xanchor: 'left', y: 0.95, yanchor: 'top',
    },
    paper_bgcolor: "transparent",
    plot_bgcolor: "transparent",
    font: { color: theme === "dark" ? "#e5e7eb" : "#374151", family: "Inter, sans-serif" },
    xaxis: {
      title: { text: "Temperature (°C)", font: { size: 13 } }, range: [xMin, xMax],
      gridcolor: theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
      zeroline: false, dtick: 4, tickfont: { size: 12 }
    },
    yaxis: {
      title: { text: "Depth (m)", font: { size: 13 } }, autorange: "reversed",
      gridcolor: theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
      zeroline: false, tickfont: { size: 12 }
    },
    showlegend: false,
    margin: { l: 70, r: 20, t: 70, b: 60 },
    hovermode: "closest",
    shapes: shapes,
    annotations: []
  };

  const config = { responsive: true, displaylogo: false };

  const downloadCSV = () => { /* ... implementation ... */ };
  const exportReport = () => { /* ... implementation ... */ };
  const toggleVisible = (id: string) => setVisibleIds(prev => prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]);

  return (
    <div ref={tabRef} className="min-h-screen p-4 sm:p-6 font-sans">
      <div className="max-w-8xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">Compare Float Profiles</h1>
          <p className="mt-1 text-sm text-muted-foreground">Interactive visual analysis of temperature-depth profiles across different oceans.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <div className="lg:col-span-2 xl:col-span-3 rounded-xl shadow-lg relative min-h-[600px] overflow-hidden chart-container p-4">
            {(!plotReady && isIntersecting) && <div className="absolute inset-0 z-20 flex items-center justify-center p-6 bg-card/80 backdrop-blur-sm"><span className="text-muted-foreground">Preparing Visualization...</span></div>}
             <div 
                id="compare-plotly" 
                className="compare-plotly-root" 
                style={{ width: "100%", height: "100%" }}
                role="region"
                aria-label="Chart displaying float temperature profiles"
              >
              <Plot
                data={animatedTraces}
                layout={layout}
                config={config}
                useResizeHandler
                style={{ width: "100%", height: "100%", visibility: plotReady ? "visible" : "hidden" }}
              />
            </div>
          </div>

          <aside className="lg:col-span-1 xl:col-span-1 space-y-6">
             <div 
                className="bg-card rounded-xl p-4 border border-border shadow-lg"
                onMouseLeave={() => setHighlightedId(null)}
             >
                <h3 className="text-base font-semibold mb-3 text-foreground">Select Floats</h3>
                 <div className="space-y-1 text-sm">
                    {stats.map((s) => (
                      <label 
                        key={s.id} 
                        className={`flex items-center justify-between gap-3 cursor-pointer p-1.5 rounded-md transition-all duration-200 ${visibleIds.includes(s.id) ? 'bg-primary/20' : 'hover:bg-muted/50'} ${highlightedId === s.id ? 'ring-2 ring-primary' : ''}`}
                        onMouseEnter={() => setHighlightedId(s.id)}
                        >
                        <div className="flex items-center gap-3">
                          <input type="checkbox" className="h-4 w-4 rounded-sm border-border text-primary focus:ring-ring shrink-0" checked={visibleIds.includes(s.id)} onChange={() => toggleVisible(s.id)} />
                          <div style={{ width: 4, height: 16, backgroundColor: s.color, borderRadius: 2 }} />
                          <div className="leading-tight">
                            <div className="font-medium text-xs text-foreground">{s.id.split(' ')[0]} <span className="text-muted-foreground font-normal">{s.type}</span></div>
                            <div className="text-[11px] text-muted-foreground">Surface: {s.surface}°C</div>
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>
            </div>
            
            <div className="bg-card rounded-xl p-4 border border-border shadow-lg">
                <h3 className="text-base font-semibold mb-3 text-foreground">Chart Tools</h3>
                <div className="space-y-4">
                     <div className="flex items-center justify-between">
                        <label className="text-sm font-medium text-foreground">Ocean Preset</label>
                        <CustomSelect 
                          options={Object.keys(oceanPresets)}
                          value={ocean}
                          onChange={setOcean}
                          ariaLabel="Select ocean preset"
                        />
                    </div>

                    <div className="space-y-2 pt-4 border-t border-border">
                        <label className="text-sm font-medium text-foreground">Depth Range (m)</label>
                        <div className="flex items-center gap-2">
                            <input 
                                type="number" 
                                className="w-full px-2 py-1 border rounded-md bg-background text-foreground border-border text-sm" 
                                value={depthRange.min} 
                                onChange={(e) => setDepthRange(d => ({ ...d, min: Number(e.target.value) }))}
                                aria-label="Minimum depth"
                            />
                            <span className="text-muted-foreground">-</span>
                            <input 
                                type="number" 
                                className="w-full px-2 py-1 border rounded-md bg-background text-foreground border-border text-sm" 
                                value={depthRange.max} 
                                onChange={(e) => setDepthRange(d => ({ ...d, max: Number(e.target.value) }))}
                                aria-label="Maximum depth"
                            />
                        </div>
                    </div>

                    <div className="space-y-2 pt-4 border-t border-border">
                        <label className="flex items-center justify-between text-sm text-foreground cursor-pointer">
                            <span>Smooth Curves</span>
                            <input type="checkbox" className="toggle" checked={smoothCurves} onChange={() => setSmoothCurves((s) => !s)} />
                        </label>
                        <label className="flex items-center justify-between text-sm text-foreground cursor-pointer">
                           <span>Thermocline Band</span>
                           <input type="checkbox" className="toggle" checked={showThermoclineBand} onChange={() => setShowThermoclineBand((s) => !s)} />
                        </label>
                    </div>
                    <div className="flex gap-2 pt-4 border-t border-border">
                         <button onClick={downloadCSV} className="flex-1 flex items-center justify-center gap-2 px-3 py-1.5 rounded-md bg-card border border-border text-sm font-medium shadow-sm text-foreground hover:bg-muted transition-colors">
                            <Download size={16} />CSV
                        </button>
                        <button onClick={exportReport} className="flex-1 flex items-center justify-center gap-2 px-3 py-1.5 rounded-md bg-primary text-primary-foreground shadow-sm text-sm font-medium hover:bg-primary/90 transition-colors">
                            <Printer size={16} />Export
                        </button>
                    </div>
                </div>
            </div>

             <div className="bg-card rounded-xl p-4 border border-border shadow-lg">
                <h3 className="text-base font-semibold mb-3 text-foreground">Comparison Details</h3>
                 <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                      <thead className="border-b border-border">
                        <tr className="text-xs text-muted-foreground uppercase">
                          <th className="font-medium p-2">Float</th>
                          <th className="font-medium p-2 text-right">Surface</th>
                          <th className="font-medium p-2 text-right">Min</th>
                          <th className="font-medium p-2 text-right">Max</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {stats.filter(s => visibleIds.includes(s.id)).map((s) => (
                          <tr key={s.id} className={`transition-colors duration-200 ${highlightedId === s.id ? 'bg-primary/10' : 'hover:bg-muted/50'}`}>
                            <td className="p-2 font-medium text-foreground whitespace-nowrap flex items-center gap-2">
                                <div style={{ width: 10, height: 10, backgroundColor: s.color, borderRadius: 3, flexShrink: 0 }} />
                                {s.id.split(' ')[0]}
                            </td>
                            <td className="p-2 text-right text-muted-foreground font-mono">{s.surface.toFixed(1)}°</td>
                            <td className="p-2 text-right text-muted-foreground font-mono">{s.min.toFixed(1)}°</td>
                            <td className="p-2 text-right text-muted-foreground font-mono">{s.max.toFixed(1)}°</td>
                          </tr>
                        ))}
                         {visibleIds.length === 0 && (
                            <tr><td colSpan={5} className="p-4 text-center text-muted-foreground text-xs">Select a float to see details.</td></tr>
                         )}
                      </tbody>
                    </table>
                </div>
            </div>
          </aside>
        </div>
      </div>
       <style jsx>{`
        .chart-container {
            background: linear-gradient(165deg, hsl(var(--background) / 0.9), hsl(var(--background) / 1)),
                        radial-gradient(ellipse at top left, hsl(var(--primary) / 0.1), transparent 50%),
                        radial-gradient(ellipse at bottom right, hsl(var(--primary) / 0.1), transparent 50%);
            filter: drop-shadow(0 4px 6px rgba(0,0,0,0.05));
        }
        .dark .chart-container {
             background: linear-gradient(165deg, hsl(222 47% 9% / 1), hsl(222 47% 6% / 1)),
                        radial-gradient(ellipse at top left, hsl(var(--primary) / 0.15), transparent 50%),
                        radial-gradient(ellipse at bottom right, hsl(var(--primary) / 0.25), transparent 60%);
            filter: drop-shadow(0 10px 15px rgba(0,0,0,0.2));
        }
        .toggle {
            -webkit-appearance: none;
            appearance: none;
            width: 36px;
            height: 20px;
            background-color: hsl(var(--muted));
            border-radius: 9999px;
            position: relative;
            transition: background-color 0.2s ease-in-out;
            cursor: pointer;
        }
        .toggle::before {
            content: '';
            position: absolute;
            top: 2px;
            left: 2px;
            width: 16px;
            height: 16px;
            background-color: white;
            border-radius: 9999px;
            transition: transform 0.2s ease-in-out;
        }
        .toggle:checked {
            background-color: hsl(var(--primary));
        }
        .toggle:checked::before {
            transform: translateX(16px);
        }
        @keyframes fade-in-scale {
            from {
                opacity: 0;
                transform: scale(0.95) translateY(-5px);
            }
            to {
                opacity: 1;
                transform: scale(1) translateY(0);
            }
        }
        .animate-fade-in-scale {
            animation: fade-in-scale 0.2s ease-out forwards;
        }
      `}</style>
    </div>
  );
}