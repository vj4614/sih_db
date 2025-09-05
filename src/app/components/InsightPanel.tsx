"use client";

import React from "react";
import { motion } from "framer-motion";
import { X } from "lucide-react";
import DynamicInsight from "./DynamicInsight";
import { Insight } from "@/app/services/insightService";

interface InsightPanelProps {
  insight: Insight;
  onClose: () => void;
}

export default function InsightPanel({ insight, onClose }: InsightPanelProps) {
  return (
    <motion.div
      key={insight.id} // Add key to force re-render on insight change
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 50 }}
      transition={{ duration: 0.5, ease: "easeInOut" }}
      className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 h-full flex flex-col"
    >
      {/* DynamicInsight already has a back button, so we pass onClose to it */}
      <DynamicInsight insight={insight} onBack={onClose} />
    </motion.div>
  );
}