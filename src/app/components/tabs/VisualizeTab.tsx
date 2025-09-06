"use client";

import React, { useState, useMemo } from "react";
import dynamic from "next/dynamic";
import { Search } from 'lucide-react';
import FilterGroup from "../ui/FilterGroup";
import SidePanel from "../ui/SidePanel";

const Map = dynamic(() => import("../ui/Map"), {
  ssr: false,
  loading: () => <div className="flex items-center justify-center h-full"><p>Loading map...</p></div>,
});

export default function VisualizeTab({ floats, filters, handleFilterChange, handleApplyFilters, mapCenter, mapZoom, selectedFloat, regionSummary, onFloatSelect, onDetailClose, theme, mapTransition }) {
    const [suggestions, setSuggestions] = useState<any[]>([]);

    const handleQuickSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value;
        const today = new Date();
        const endDate = today.toISOString().split('T')[0];
        let startDate = filters.startDate;

        if (value === 'last-7-days') {
            const sevenDaysAgo = new Date(today);
            sevenDaysAgo.setDate(today.getDate() - 7);
            startDate = sevenDaysAgo.toISOString().split('T')[0];
        } else if (value === 'last-30-days') {
            const thirtyDaysAgo = new Date(today);
            thirtyDaysAgo.setDate(today.getDate() - 30);
            startDate = thirtyDaysAgo.toISOString().split('T')[0];
        }

        handleFilterChange({ target: { name: 'startDate', value: startDate } });
        handleFilterChange({ target: { name: 'endDate', value: endDate } });
    };
    
    // In-memory filter logic to simulate a real-world scenario
    const filteredFloats = useMemo(() => {
        const { region, startDate, endDate, data_mode, direction, cycle_number, project_name } = filters;
        
        // Mock data to associate floats with regions and dates
        const mockRegionalData = {
          "Indian Ocean": [98765, 12345],
          "North Atlantic": [54321],
          "Southern Ocean": [],
          "Equatorial Region": [],
        };
        const regionFloats = mockRegionalData[region] || [];
        
        const filteredByRegion = floats.filter(float => 
            regionFloats.includes(float.platform_number)
        );

        // This is a simple mock for date filtering, in a real app this would query a database
        const filteredByDate = filteredByRegion.filter(float => {
            const floatDate = new Date("2023-03-15"); // Mock a fixed date for demonstration
            return floatDate >= new Date(startDate) && floatDate <= new Date(endDate);
        });

        return filteredByDate;
    }, [floats, filters]);
    
    const handleFloatIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { value } = e.target;
        handleFilterChange(e);
        
        if (value.length > 0) {
            const matchingFloats = filteredFloats.filter(float => 
                float.platform_number.toString().includes(value)
            );
            setSuggestions(matchingFloats);
        } else {
            setSuggestions([]);
        }
    };
    
    const handleSuggestionClick = (floatId: string) => {
      handleFilterChange({ target: { name: 'floatId', value: floatId } });
      setSuggestions([]);
    };

    return (
        <section className="grid md:grid-cols-4 gap-6 h-[calc(100vh-120px)]">
          <aside className="col-span-1 bg-card rounded-xl shadow-lg p-6 flex flex-col space-y-6">
            <h3 className="text-xl font-bold border-b pb-3">Observation Lens</h3>
            <FilterGroup label="Date Range" animationDelay="0s">
                <div className="space-y-4">
                    <select onChange={handleQuickSelectChange} className="filter-input">
                        <option value="">Quick Select</option>
                        <option value="last-7-days">Last 7 Days</option>
                        <option value="last-30-days">Last 30 Days</option>
                    </select>
                    <div className="flex gap-2">
                        <div className="flex-1">
                            <label className="text-sm text-muted-foreground block mb-2">Start Date</label>
                            <input type="date" name="startDate" value={filters.startDate} onChange={handleFilterChange} className="filter-input w-full" />
                        </div>
                        <div className="flex-1">
                            <label className="text-sm text-muted-foreground block mb-2">End Date</label>
                            <input type="date" name="endDate" value={filters.endDate} onChange={handleFilterChange} className="filter-input w-full" />
                        </div>
                    </div>
                </div>
            </FilterGroup>
            <FilterGroup label="Region" animationDelay="0.1s">
              <select name="region" value={filters.region} onChange={handleFilterChange} className="filter-input">
                <option value="">Select</option>
                <option>Indian Ocean</option>
                <option>Equatorial Region</option>
                <option>North Atlantic</option>
                <option>Southern Ocean</option>
              </select>
            </FilterGroup>
            <FilterGroup label="Parameter" animationDelay="0.2s">
              <select name="parameter" value={filters.parameter} onChange={handleFilterChange} className="filter-input">
                <option value="">Select</option>
                <option>Salinity</option>
                <option>Temperature</option>
                <option>Pressure</option>
              </select>
            </FilterGroup>
            <FilterGroup label="Data Mode" animationDelay="0.3s">
                <select name="data_mode" value={filters.data_mode} onChange={handleFilterChange} className="filter-input">
                    <option value="">Select</option>
                    <option value="R">Real-time (R)</option>
                    <option value="D">Delayed-mode (D)</option>
                </select>
            </FilterGroup>
            <FilterGroup label="Profiling Direction" animationDelay="0.4s">
                <select name="direction" value={filters.direction} onChange={handleFilterChange} className="filter-input">
                    <option value="">Select</option>
                    <option value="A">Ascending (A)</option>
                    <option value="D">Descending (D)</option>
                </select>
            </FilterGroup>
            <FilterGroup label="Cycle Number" animationDelay="0.5s">
                <input 
                    type="text" 
                    name="cycle_number" 
                    placeholder="e.g., 15" 
                    value={filters.cycle_number} 
                    onChange={handleFilterChange} 
                    className="filter-input" 
                />
            </FilterGroup>
            <FilterGroup label="Project Name" animationDelay="0.6s">
                <select name="project_name" value={filters.project_name} onChange={handleFilterChange} className="filter-input">
                    <option value="">Select</option>
                    <option>INCOIS</option>
                    <option>NOAA</option>
                    <option>CSIRO</option>
                </select>
            </FilterGroup>
            <FilterGroup label="Float ID" animationDelay="0.7s">
                <div className="relative">
                    <div className="relative">
                        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                        <input 
                            type="text" 
                            name="floatId" 
                            placeholder="Search by ID..." 
                            value={filters.floatId} 
                            onChange={handleFloatIdChange} 
                            className="filter-input pl-10" 
                        />
                    </div>
                    {suggestions.length > 0 && (
                        <ul className="absolute z-10 w-full bg-card border border-muted-foreground/20 rounded-md mt-1 shadow-lg max-h-40 overflow-y-auto">
                            {suggestions.map((float) => (
                                <li 
                                    key={float.id} 
                                    onClick={() => handleSuggestionClick(float.platform_number.toString())}
                                    className="p-3 hover:bg-muted/50 cursor-pointer text-sm"
                                >
                                    {float.platform_number}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </FilterGroup>
            <button 
              onClick={handleApplyFilters} 
              className="mt-auto w-full py-3 bg-primary text-primary-foreground rounded-lg font-semibold 
                         hover:bg-primary/90 transition-all transform active:scale-95 active:bg-teal shadow-lg"
            >
              Apply Filters
            </button>
          </aside>
          <div className="col-span-3 bg-card rounded-xl shadow-lg overflow-hidden relative">
            <Map center={mapCenter} zoom={mapZoom} selectedFloatId={selectedFloat?.id} onFloatSelect={onFloatSelect} transition={mapTransition} floats={floats} theme={theme}/>
            <SidePanel float={selectedFloat} summary={regionSummary} onClose={onDetailClose} theme={theme} />
          </div>
        </section>
    );
};