"use client";

import React from "react";
import dynamic from "next/dynamic";
import { X, MapPin, AreaChart, Thermometer, Droplets, Wind, Lightbulb, TrendingUp } from 'lucide-react';

const Plot = dynamic(() => import("react-plotly.js"), { ssr: false });
const Map = dynamic(() => import("./Map"), { ssr: false });

const KeyMetric = ({ icon: Icon, value, label, color }) => (
    <div className="bg-muted/50 p-4 rounded-lg text-center h-full flex flex-col justify-center">
        <Icon className={`mx-auto h-8 w-8 ${color}`} />
        <p className="mt-2 text-xl md:text-2xl font-bold text-foreground">{value}</p>
        <p className="text-xs md:text-sm text-muted-foreground">{label}</p>
    </div>
);

export default function InsightDetailView({ insight, onClose, theme }) {
    if (!insight) return null;

    const plotLayout = (title, xaxis, yaxis) => ({
        title: { text: title, font: { size: 16, family: 'Inter, sans-serif' } },
        paper_bgcolor: 'transparent',
        plot_bgcolor: 'transparent',
        font: { color: theme === 'dark' ? '#e6edf3' : '#1a202c' },
        xaxis: { title: { text: xaxis, font: { size: 12 } }, gridcolor: theme === 'dark' ? '#21262d' : '#e2e8f0' },
        yaxis: { title: { text: yaxis, font: { size: 12 } }, gridcolor: theme === 'dark' ? '#21262d' : '#e2e8f0' },
        margin: { t: 40, l: 50, r: 20, b: 50 },
        legend: { orientation: 'h', y: -0.2 }
    });

    return (
        <div className="bg-card p-4 md:p-6 rounded-2xl shadow-2xl h-full flex flex-col animate-fade-in border border-primary/20">
            <div className="flex justify-between items-center pb-4 border-b border-muted">
                <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-full bg-gradient-to-br ${insight.color}`}>
                        <insight.icon size={24} className="text-white" />
                    </div>
                    <h2 className="text-xl md:text-2xl font-bold">{insight.title}</h2>
                </div>
                <button onClick={onClose} className="p-2 rounded-full hover:bg-muted transition-colors">
                    <X size={20} />
                </button>
            </div>

            <div className="flex-1 overflow-y-auto mt-4 space-y-8 pr-2 custom-scrollbar">

                {/* --- AI Interpretation Section --- */}
                <div className="bg-muted/30 p-4 rounded-lg border-l-4 border-primary">
                    <h3 className="text-lg font-semibold mb-2 flex items-center gap-2"><Lightbulb size={20} className="text-primary"/> AI Interpretation</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed whitespace-pre-line">{insight.interpretation}</p>
                </div>

                {/* --- Key Metrics Section --- */}
                {insight.metrics && (
                    <div>
                        <h3 className="text-lg font-semibold mb-3">Key Metrics</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {insight.metrics.map(metric => (
                                <KeyMetric key={metric.label} {...metric} />
                            ))}
                        </div>
                    </div>
                )}
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Map View */}
                    {insight.location && (
                        <div>
                            <h3 className="text-lg font-semibold mb-2 flex items-center gap-2"><MapPin size={20} /> Geographic Context</h3>
                            <div className="h-72 w-full rounded-lg overflow-hidden border border-muted">
                                 <Map
                                    center={[insight.location.lat, insight.location.lon]}
                                    zoom={insight.location.zoom}
                                    floats={[{ id: 1, position: [insight.location.lat, insight.location.lon], platform_number: "Event Location"}]}
                                    selectedFloatId={1}
                                    onFloatSelect={() => {}}
                                    transition="instant"
                                    theme={theme}
                                />
                            </div>
                        </div>
                    )}

                    {/* Chart View */}
                    {insight.chartData && (
                         <div>
                            <h3 className="text-lg font-semibold mb-2 flex items-center gap-2"><AreaChart size={20}/> Data Profile</h3>
                            <div className="h-72 w-full">
                                <Plot
                                    data={insight.chartData.data}
                                    layout={plotLayout(insight.chartData.title, insight.chartData.xAxisLabel, insight.chartData.yAxisLabel)}
                                    style={{ width: "100%", height: "100%" }}
                                    useResizeHandler
                                    config={{ displayModeBar: false, responsive: true }}
                                />
                            </div>
                        </div>
                    )}
                </div>

                 {/* --- Predictions & Outlook Section --- */}
                <div className="bg-muted/30 p-4 rounded-lg border-l-4 border-yellow-500">
                    <h3 className="text-lg font-semibold mb-2 flex items-center gap-2"><TrendingUp size={20} className="text-yellow-500"/> Predictions & Outlook</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed whitespace-pre-line">{insight.prediction}</p>
                </div>
            </div>
        </div>
    );
};