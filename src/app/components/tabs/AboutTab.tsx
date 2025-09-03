"use client";

import React from "react";

export default function AboutTab() {
    return (
        <section className="mt-4">
            <div className="bg-card p-8 rounded-xl shadow-lg max-w-4xl mx-auto">
                <h2 className="text-3xl font-bold text-primary">About FloatChat</h2>
                <p className="mt-4 text-muted-foreground">This is a demonstration of a modern, AI-powered interface for exploring ARGO float data. The current frontend is a showcase of what's possible with interactive maps and charts, built with Next.js, Plotly, and Leaflet.</p>
                <p className="mt-2 text-muted-foreground">The next phase of development will involve connecting this interface to a robust backend, replacing the mock data with live queries to a Postgres database and leveraging a Retrieval-Augmented Generation (RAG) pipeline for the conversational AI.</p>
            </div>
        </section>
    );
};