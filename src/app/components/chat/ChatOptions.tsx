"use client";
import React from 'react';
import { LineChart, Droplet, Route } from 'lucide-react';

interface ChatOptionsProps {
    onSelect: (optionName: string) => void;
}

export default function ChatOptions({ onSelect }: ChatOptionsProps) {
    return (
        <div className="flex flex-col space-y-2 p-4 bg-muted/20 rounded-xl mt-4">
            <h4 className="text-sm font-semibold text-muted-foreground mb-2">Select a visualization to display:</h4>
            <button onClick={() => onSelect('Temperature Profile')} className="flex items-center gap-3 px-4 py-3 bg-card rounded-lg hover:bg-primary/10 transition-colors shadow-md text-foreground text-left">
                <LineChart size={20} className="text-primary" />
                <span className="font-medium">Temperature Profile</span>
            </button>
            <button onClick={() => onSelect('Salinity Profile')} className="flex items-center gap-3 px-4 py-3 bg-card rounded-lg hover:bg-primary/10 transition-colors shadow-md text-foreground text-left">
                <Droplet size={20} className="text-primary" />
                <span className="font-medium">Salinity Profile</span>
            </button>
            <button onClick={() => onSelect('2D Trajectory')} className="flex items-center gap-3 px-4 py-3 bg-card rounded-lg hover:bg-primary/10 transition-colors shadow-md text-foreground text-left">
                <Route size={20} className="text-primary" />
                <span className="font-medium">2D Trajectory</span>
            </button>
        </div>
    );
}