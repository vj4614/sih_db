"use client";

import React from "react";
import dynamic from "next/dynamic";
import { Search } from 'lucide-react';
import FilterGroup from "../ui/FilterGroup";
import SidePanel from "../ui/SidePanel";

const Map = dynamic(() => import("../ui/Map"), {
  ssr: false,
  loading: () => <div className="flex items-center justify-center h-full"><p>Loading map...</p></div>,
});

export default function VisualizeTab({ floats, filters, handleFilterChange, handleApplyFilters, mapCenter, mapZoom, selectedFloat, regionSummary, onFloatSelect, onDetailClose, theme, mapTransition }) {
    return (
        <section className="grid md:grid-cols-4 gap-6 h-[calc(100vh-120px)]">
          <aside className="col-span-1 bg-card rounded-xl shadow-lg p-6 flex flex-col space-y-6">
            <h3 className="text-xl font-bold border-b pb-3">Filters</h3>
            <FilterGroup label="Date Range"><div className="flex gap-2"><input type="date" name="startDate" value={filters.startDate} onChange={handleFilterChange} className="filter-input" /><input type="date" name="endDate" value={filters.endDate} onChange={handleFilterChange} className="filter-input" /></div></FilterGroup>
            <FilterGroup label="Region"><select name="region" value={filters.region} onChange={handleFilterChange} className="filter-input"><option>Indian Ocean</option><option>Equatorial Region</option><option>North Atlantic</option><option>Southern Ocean</option></select></FilterGroup>
            <FilterGroup label="Parameter"><select name="parameter" value={filters.parameter} onChange={handleFilterChange} className="filter-input"><option>Salinity</option><option>Temperature</option></select></FilterGroup>
            <FilterGroup label="Float ID"><div className="relative"><Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" /><input type="text" name="floatId" placeholder="Search by ID..." value={filters.floatId} onChange={handleFilterChange} className="filter-input pl-10" /></div></FilterGroup>
            <button onClick={handleApplyFilters} className="mt-auto w-full py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-all transform active:scale-95 shadow-lg">Apply Filters</button>
          </aside>
          <div className="col-span-3 bg-card rounded-xl shadow-lg overflow-hidden relative">
            <Map center={mapCenter} zoom={mapZoom} selectedFloatId={selectedFloat?.id} onFloatSelect={onFloatSelect} transition={mapTransition} floats={floats} theme={theme}/>
            <SidePanel float={selectedFloat} summary={regionSummary} onClose={onDetailClose} theme={theme} />
          </div>
        </section>
    );
};