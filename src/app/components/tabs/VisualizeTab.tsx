"use client";

import React, { useState, useMemo, useEffect } from "react";
import dynamic from "next/dynamic";
import { Search } from 'lucide-react';
import FilterGroup from "../ui/FilterGroup";
import SidePanel from "../ui/SidePanel";
import Select from 'react-select';
import { customSelectStyles } from '../ui/selectStyles';

const Map = dynamic(() => import("../ui/Map"), {
  ssr: false,
  loading: () => <div className="flex items-center justify-center h-full"><p>Loading map...</p></div>,
});

const regionOptions = [
    { value: "Indian Ocean", label: "Indian Ocean" },
    { value: "Equatorial Region", label: "Equatorial Region" },
    { value: "North Atlantic", label: "North Atlantic" },
    { value: "Southern Ocean", label: "Southern Ocean" },
];
const parameterOptions = [
    { value: "Salinity", label: "Salinity" },
    { value: "Temperature", label: "Temperature" },
    { value: "Pressure", label: "Pressure" },
];
const dataModeOptions = [
    { value: "R", label: "Real-time (R)" },
    { value: "D", label: "Delayed-mode (D)" },
];
const directionOptions = [
    { value: "A", label: "Ascending (A)" },
    { value: "D", label: "Descending (D)" },
];
const projectNameOptions = [
    { value: "INCOIS", label: "INCOIS" },
    { value: "NOAA", label: "NOAA" },
    { value: "CSIRO", label: "CSIRO" },
];

export default function VisualizeTab({ floats, filters, handleFilterChange, handleApplyFilters, mapCenter, mapZoom, selectedFloat, regionSummary, onFloatSelect, onDetailClose, theme, mapTransition }) {
    const [suggestions, setSuggestions] = useState<any[]>([]);
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

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
                <Select
                    menuPortalTarget={isMounted ? document.body : null}
                    menuPosition="fixed"
                    name="region"
                    options={regionOptions}
                    styles={customSelectStyles}
                    placeholder="Select"
                    isClearable
                    onChange={handleFilterChange}
                    value={regionOptions.find(o => o.value === filters.region) || null}
                />
            </FilterGroup>
            <FilterGroup label="Parameter" animationDelay="0.2s">
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
            <FilterGroup label="Data Mode" animationDelay="0.3s">
                <Select
                    menuPortalTarget={isMounted ? document.body : null}
                    menuPosition="fixed"
                    name="data_mode"
                    options={dataModeOptions}
                    styles={customSelectStyles}
                    placeholder="Select"
                    isClearable
                    onChange={handleFilterChange}
                    value={dataModeOptions.find(o => o.value === filters.data_mode) || null}
                />
            </FilterGroup>
            <FilterGroup label="Profiling Direction" animationDelay="0.4s">
                <Select
                    menuPortalTarget={isMounted ? document.body : null}
                    menuPosition="fixed"
                    name="direction"
                    options={directionOptions}
                    styles={customSelectStyles}
                    placeholder="Select"
                    isClearable
                    onChange={handleFilterChange}
                    value={directionOptions.find(o => o.value === filters.direction) || null}
                />
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
                <Select
                    menuPortalTarget={isMounted ? document.body : null}
                    menuPosition="fixed"
                    name="project_name"
                    options={projectNameOptions}
                    styles={customSelectStyles}
                    placeholder="Select"
                    isClearable
                    onChange={handleFilterChange}
                    value={projectNameOptions.find(o => o.value === filters.project_name) || null}
                />
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