"use client";

import React from "react";
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
    return (
        <section className="grid md:grid-cols-4 gap-6 h-[calc(100vh-120px)]">
          <aside className="col-span-1 bg-card rounded-xl shadow-lg p-6 flex flex-col space-y-6">
            <h3 className="text-xl font-bold border-b pb-3">Simple Filters</h3>
            <FilterGroup label="Parameter">
                <select name="parameter" value={filters.parameter} onChange={handleFilterChange} className="filter-input">
                    <option>Salinity</option>
                    <option>Temperature</option>
                </select>
            </FilterGroup>
            <FilterGroup label="Float ID">
                <div className="relative">
                    <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input type="text" name="floatId" placeholder="Search by ID..." value={filters.floatId} onChange={handleFilterChange} className="filter-input pl-10" />
                </div>
            </FilterGroup>
            <button onClick={handleApplyFilters} className="mt-auto w-full py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-all transform active:scale-95 shadow-lg">Apply Filters</button>
          </aside>
          <div className="col-span-3 bg-card rounded-xl shadow-lg overflow-hidden relative">
            <Map center={mapCenter} zoom={mapZoom} selectedFloatId={selectedFloat?.id} onFloatSelect={onFloatSelect} transition={mapTransition} floats={floats} theme={theme}/>
            <SidePanel float={selectedFloat} summary={regionSummary} onClose={onDetailClose} theme={theme} />
          </div>
        </section>
    );
};