"use client";
import React from 'react';
import { Thermometer, Droplet, MapPin, Gauge } from 'lucide-react'; // Import Gauge icon for Pressure

interface ChatDataOptionsProps {
    onSelect: (dataType: string) => void;
}

export default function ChatDataOptions({ onSelect }: ChatDataOptionsProps) {
    return (
        <div className="flex flex-col space-y-2 p-4 bg-muted/20 rounded-xl mt-4">
            <h4 className="text-sm font-semibold text-muted-foreground mb-2">Select a data type to view:</h4>
            <button onClick={() => onSelect('Temperature')} className="flex items-center gap-3 px-4 py-3 bg-card rounded-lg hover:bg-primary/10 transition-colors shadow-md text-foreground text-left">
                <Thermometer size={20} className="text-red-500" />
                <span className="font-medium">Temperature Data</span>
            </button>
            <button onClick={() => onSelect('Salinity')} className="flex items-center gap-3 px-4 py-3 bg-card rounded-lg hover:bg-primary/10 transition-colors shadow-md text-foreground text-left">
                <Droplet size={20} className="text-blue-500" />
                <span className="font-medium">Salinity Data</span>
            </button>
            <button onClick={() => onSelect('Pressure')} className="flex items-center gap-3 px-4 py-3 bg-card rounded-lg hover:bg-primary/10 transition-colors shadow-md text-foreground text-left">
                <Gauge size={20} className="text-purple-500" />
                <span className="font-medium">Pressure Data</span>
            </button>
            <button onClick={() => onSelect('Lat & Lon')} className="flex items-center gap-3 px-4 py-3 bg-card rounded-lg hover:bg-primary/10 transition-colors shadow-md text-foreground text-left">
                <MapPin size={20} className="text-green-500" />
                <span className="font-medium">Lat & Lon Data</span>
            </button>
        </div>
    );
}