"use client";

import React, { useState, useMemo, useEffect } from "react";
import dynamic from "next/dynamic";
import { Search } from 'lucide-react';
import FilterGroup from "../../ui/FilterGroup";
import SidePanel from "../../ui/SidePanel";
import Select from 'react-select';
import { customSelectStyles } from '../../ui/selectStyles';

const Map = dynamic(() => import("../../ui/Map"), {
  ssr: false,
  loading: () => <div className="flex items-center justify-center h-full"><p>Loading map...</p></div>,
});

const parameterOptions = [
    { value: "Salinity", label: "Salinity" },
    { value: "Temperature", label: "Temperature" },
    { value: "Pressure", label: "Pressure" },
];

export default function NewbieDiagram({ floats, filters, handleFilterChange, handleApplyFilters, mapCenter, mapZoom, selectedFloat, regionSummary, onFloatSelect, onDetailClose, theme, mapTransition }) {
    const [suggestions, setSuggestions] = useState<any[]>([]);
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);
    
    const filteredFloats = useMemo(() => {
        const { region } = filters;
        const mockRegionalData = {
          "Indian Ocean": [98765, 12345],
          "North Atlantic": [54321],
          "Southern Ocean": [],
          "Equatorial Region": [],
        };
        const regionFloats = mockRegionalData[region] || [];
        
        return floats.filter(float => 
            regionFloats.includes(float.platform_number)
        );
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
                <Select
                    menuPortalTarget={isMounted ? document.body : null}
                    menuPosition="fixed"
                    name="parameter"
                    options={parameterOptions}
                    styles={customSelectStyles}
                    placeholder="Select"
                    isClearable
                    onChange={handleFilterChange}
                    value={parameterOptions.find(o => o.value === filters.parameter) || null}
                />
            </FilterGroup>
            <FilterGroup label="Float ID" animationDelay="0.1s">
                <div className="relative">
                    <div className="relative">
                        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground z-10" />
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
                        <ul className="absolute z-20 w-full bg-card border border-muted-foreground/20 rounded-md mt-1 shadow-lg max-h-40 overflow-y-auto">
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