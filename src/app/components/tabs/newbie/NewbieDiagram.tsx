"use client";

import React, { useState, useMemo } from "react";
import dynamic from "next/dynamic";
import { Search } from 'lucide-react';
import FilterGroup from "../../ui/FilterGroup";
import SidePanel from "../../ui/SidePanel";
import { mockFloats } from "@/app/page";

const Map = dynamic(() => import("../../ui/Map"), {
  ssr: false,
  loading: () => <div className="flex items-center justify-center h-full"><p>Loading map...</p></div>,
});

export default function NewbieDiagram({ floats, filters, handleFilterChange, handleApplyFilters, mapCenter, mapZoom, selectedFloat, regionSummary, onFloatSelect, onDetailClose, theme, mapTransition }) {
    const [suggestions, setSuggestions] = useState<any[]>([]);
    
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
            <h3 className="text-xl font-bold border-b pb-3">Dive Parameters</h3>
            <FilterGroup label="Parameter" animationDelay="0s">
                <select name="parameter" value={filters.parameter} onChange={handleFilterChange} className="filter-input">
                    <option value="">Select</option>
                    <option>Salinity</option>
                    <option>Temperature</option>
                    <option>Pressure</option>
                </select>
            </FilterGroup>
            <FilterGroup label="Float ID" animationDelay="0.1s">
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