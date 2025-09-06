// src/app/components/tabs/VisualizeTab.tsx

"use client";

import React, { useState } from "react";
import dynamic from "next/dynamic";
import { Sparkles, Search, Loader, SlidersHorizontal } from 'lucide-react';
import SidePanel from "../ui/SidePanel";
import FilterGroup from "../ui/FilterGroup";

const Map = dynamic(() => import("../ui/Map"), {
  ssr: false,
  loading: () => <div className="flex items-center justify-center h-full"><p>Loading map...</p></div>,
});

export default function VisualizeTab({ floats, filters, setFilters, handleApplyFilters, mapCenter, mapZoom, selectedFloat, regionSummary, onFloatSelect, onDetailClose, theme, mapTransition }) {
    const [command, setCommand] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showManualFilters, setShowManualFilters] = useState(false);

    const handleCommandSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!command.trim()) return;

        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch('/api/map-command', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ command }),
            });

            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.error || "Failed to parse command.");
            }

            const parsedFilters = await response.json();
            setFilters(prev => ({ ...prev, ...parsedFilters }));

            setTimeout(() => {
                handleApplyFilters();
            }, 0);

        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFilters(prev => ({...prev, [name]: value}));
    };
    
    return (
        <section className="h-[calc(100vh-120px)] flex flex-col gap-4">
            {/* AI Command Bar */}
            <div className="relative z-10">
                <form onSubmit={handleCommandSubmit} className="relative">
                     <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                        <Sparkles className="h-5 w-5 text-primary" />
                    </div>
                    <input 
                        type="text"
                        value={command}
                        onChange={(e) => setCommand(e.target.value)}
                        placeholder="AI Command: e.g., Show INCOIS floats in the Arabian Sea from June 2022..."
                        className="w-full pl-12 pr-28 py-3 bg-card/80 backdrop-blur-md border border-primary/20 rounded-full shadow-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                        disabled={isLoading}
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-2">
                         <button type="button" onClick={() => setShowManualFilters(!showManualFilters)} className="p-2 mr-1 rounded-full hover:bg-muted/50 transition-colors" title="Toggle Manual Filters">
                            <SlidersHorizontal className="h-5 w-5 text-muted-foreground" />
                        </button>
                        <button type="submit" className="p-2 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:bg-muted" disabled={isLoading}>
                            {isLoading ? <Loader className="h-5 w-5 animate-spin" /> : <Search className="h-5 w-5" />}
                        </button>
                    </div>
                </form>
                {error && <p className="text-center text-red-500 text-sm mt-2 bg-card/80 p-2 rounded-md">{error}</p>}
            </div>

            {/* Manual Filters (Collapsible) */}
            {showManualFilters && (
                 <div className="bg-card/80 backdrop-blur-md rounded-xl shadow-lg p-4 border border-white/10 dark:border-gray-800/20">
                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                        <FilterGroup label="Start Date">
                            <input type="date" name="startDate" value={filters.startDate} onChange={handleFilterChange} className="filter-input" />
                        </FilterGroup>
                        <FilterGroup label="End Date">
                            <input type="date" name="endDate" value={filters.endDate} onChange={handleFilterChange} className="filter-input" />
                        </FilterGroup>
                         <FilterGroup label="Region">
                            <select name="region" value={filters.region} onChange={handleFilterChange} className="filter-input">
                                <option value="">All Regions</option>
                                <option>Arabian Sea</option>
                                <option>Bay of Bengal</option>
                                <option>Equatorial Indian Ocean</option>
                            </select>
                        </FilterGroup>
                        <FilterGroup label="Project">
                             <select name="project_name" value={filters.project_name} onChange={handleFilterChange} className="filter-input">
                                <option value="">All Projects</option>
                                <option>INCOIS</option>
                                <option>NOAA</option>
                                <option>CSIRO</option>
                                <option>JAMSTEC</option>
                            </select>
                        </FilterGroup>
                        <button onClick={() => handleApplyFilters()} className="w-full h-full py-2 bg-primary text-primary-foreground rounded-lg font-semibold self-end hover:bg-primary/90 transition-colors">
                            Apply Manual Filters
                        </button>
                    </div>
                </div>
            )}

            {/* Map Area */}
            <div className="relative col-span-3 bg-card rounded-xl shadow-lg overflow-hidden flex-1">
                <Map 
                    center={mapCenter} 
                    zoom={mapZoom} 
                    selectedFloatId={selectedFloat?.id} 
                    onFloatSelect={onFloatSelect} 
                    transition={mapTransition} 
                    floats={floats} 
                    theme={theme}
                />
                <SidePanel float={selectedFloat} summary={regionSummary} onClose={onDetailClose} theme={theme} />
            </div>
        </section>
    );
};