"use client";

import React from 'react';

export default function FilterGroup({ label, children }) {
    return (
        <div>
            <label className="block text-sm font-medium mb-2 text-muted-foreground">{label}</label>
            {children}
            <style jsx>{`.filter-input {width: 100%;padding: 0.75rem;border-radius: 0.5rem;border: 1px solid #d1d5db;background-color: var(--background);color: var(--foreground);}.dark .filter-input {border-color: #374151;}`}</style>
        </div>
    );
};