// src/app/components/tabs/VisualizeTab.tsx
"use client";

import React, { useState, useMemo, useEffect } from "react";
import dynamic from "next/dynamic";
import { Sparkles, Search, Loader, SlidersHorizontal } from "lucide-react";
import SidePanel from "../ui/SidePanel";
import FilterGroup from "../ui/FilterGroup";
import TuningIndicator from "../ui/TuningIndicator";
import Select from "react-select";
import { customSelectStyles } from "../ui/selectStyles";

const Map = dynamic(() => import("../ui/Map"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full">
      <p>Loading map...</p>
    </div>
  ),
});

// Options for react-select
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
  { value: "JAMSTEC", label: "JAMSTEC" },
];

export default function VisualizeTab({
  floats,
  filters,
  setFilters,
  handleApplyFilters,
  mapCenter,
  mapZoom,
  selectedFloat,
  regionSummary,
  onFloatSelect,
  onDetailClose,
  theme,
  mapTransition,
}) {
  const [command, setCommand] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showManualFilters, setShowManualFilters] = useState(false);

  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Hybrid filter handler: works with react-select and native inputs
  const handleFilterChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement> | null,
    actionMeta?: any
  ) => {
    if (actionMeta && actionMeta.name) {
      const { name } = actionMeta;
      const value = e ? (e as any).value : "";
      setFilters((prev: any) => ({ ...prev, [name]: value }));
    } else if (e) {
      const { name, value } = e.target;
      setFilters((prev: any) => ({ ...prev, [name]: value }));
    }
  };

  const handleFloatIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    handleFilterChange(e);

    if (value.length > 0) {
      const matchingFloats = floats.filter((float: any) =>
        float.platform_number.toString().includes(value)
      );
      setSuggestions(matchingFloats);
    } else {
      setSuggestions([]);
    }
  };

  const handleSuggestionClick = (floatId: string) => {
    setFilters((prev: any) => ({ ...prev, floatId }));
    setSuggestions([]);
  };

  // AI command submit
  const handleCommandSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!command.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/map-command", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ command }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "Failed to parse command.");
      }

      const parsedFilters = await response.json();
      setFilters((prev: any) => ({ ...prev, ...parsedFilters }));

      setTimeout(() => {
        handleApplyFilters();
      }, 0);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
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
            <button
              type="button"
              onClick={() => setShowManualFilters(!showManualFilters)}
              className="p-2 mr-1 rounded-full hover:bg-muted/50 transition-colors"
              title="Toggle Manual Filters"
            >
              <SlidersHorizontal className="h-5 w-5 text-muted-foreground" />
            </button>
            <button
              type="submit"
              className="p-2 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:bg-muted"
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader className="h-5 w-5 animate-spin" />
              ) : (
                <Search className="h-5 w-5" />
              )}
            </button>
          </div>
        </form>
        {error && (
          <p className="text-center text-red-500 text-sm mt-2 bg-card/80 p-2 rounded-md">
            {error}
          </p>
        )}
      </div>

      {/* Manual Filters (Collapsible) */}
      {showManualFilters && (
        <div className="bg-card/80 backdrop-blur-md rounded-xl shadow-lg p-4 border border-white/10 dark:border-gray-800/20 grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {/* Dates */}
          <FilterGroup label="Start Date">
            <input
              type="date"
              name="startDate"
              value={filters.startDate}
              onChange={handleFilterChange}
              className="filter-input"
            />
          </FilterGroup>
          <FilterGroup label="End Date">
            <input
              type="date"
              name="endDate"
              value={filters.endDate}
              onChange={handleFilterChange}
              className="filter-input"
            />
          </FilterGroup>

          {/* React-select advanced filters */}
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
              value={
                regionOptions.find((o) => o.value === filters.region) || null
              }
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
              value={
                parameterOptions.find((o) => o.value === filters.parameter) ||
                null
              }
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
              value={
                dataModeOptions.find((o) => o.value === filters.data_mode) ||
                null
              }
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
              value={
                directionOptions.find((o) => o.value === filters.direction) ||
                null
              }
            />
          </FilterGroup>
          <FilterGroup label="Cycle Number" animationDelay="0.5s">
            <input
              type="text"
              name="cycle_number"
              placeholder="e.g., 15"
              value={filters.cycle_number || ""}
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
              value={
                projectNameOptions.find(
                  (o) => o.value === filters.project_name
                ) || null
              }
            />
          </FilterGroup>
          <FilterGroup label="Float ID" animationDelay="0.7s">
            <div className="relative">
              <div className="relative">
                <Search
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                />
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
                  {suggestions.map((float: any) => (
                    <li
                      key={float.id}
                      onClick={() =>
                        handleSuggestionClick(
                          float.platform_number.toString()
                        )
                      }
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
            className="mt-auto w-full py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-all transform active:scale-95 active:bg-teal shadow-lg"
          >
            Apply Filters
          </button>
        </div>
      )}

      {/* Map Area */}
      <div className="relative col-span-3 bg-card rounded-xl shadow-lg overflow-hidden flex-1">
        <TuningIndicator year={filters.year} month={filters.month} />
        <Map
          center={mapCenter}
          zoom={mapZoom}
          selectedFloatId={selectedFloat?.id}
          onFloatSelect={onFloatSelect}
          transition={mapTransition}
          floats={floats}
          theme={theme}
        />
        <SidePanel
          float={selectedFloat}
          summary={regionSummary}
          onClose={onDetailClose}
          theme={theme}
        />
      </div>
    </section>
  );
}
