"use client";

import React from 'react';

export default function LoadingSpinner() {
    return (
        <div className="flex items-center justify-center h-full bg-muted/30 rounded-lg">
            <div className="w-8 h-8 border-4 border-primary/50 border-t-primary rounded-full animate-spin"></div>
        </div>
    );
};