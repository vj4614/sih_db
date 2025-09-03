"use client";

import React from "react";

export default function NewbieDistinguish({ theme }) {
    const floatData = [
        { id: 98765, project: "INCOIS", lastCycle: 15, position: "[-10.0, 85.0]", temp: "25°C" },
        { id: 12345, project: "NOAA", lastCycle: 22, position: "[-15.0, 78.0]", temp: "18°C" },
        { id: 54321, project: "CSIRO", lastCycle: 8, position: "[-13.0, 83.0]", temp: "22°C" },
    ];

    return (
        <section className="bg-card p-4 sm:p-6 rounded-xl shadow-lg animate-fade-in">
            <h3 className="text-xl font-bold mb-4">Float Comparison Table</h3>
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-800">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Float ID</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Project</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Last Cycle</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Last Temperature</th>
                        </tr>
                    </thead>
                    <tbody className="bg-card divide-y divide-gray-200 dark:divide-gray-700">
                        {floatData.map((float) => (
                            <tr key={float.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{float.id}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">{float.project}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">{float.lastCycle}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">{float.temp}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <style jsx>{`
                @keyframes fade-in { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
                .animate-fade-in { animation: fade-in 0.5s ease-out forwards; }
            `}</style>
        </section>
    );
};