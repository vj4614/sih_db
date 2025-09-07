// src/app/components/ui/TuningIndicator.tsx

"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { SlidersHorizontal } from 'lucide-react';

interface TuningIndicatorProps {
  year?: string;
  month?: string;
}

const TuningIndicator: React.FC<TuningIndicatorProps> = ({ year, month }) => {
  if (!year && !month) {
    return null;
  }

  const monthNames = ["", "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const displayMonth = month ? monthNames[parseInt(month, 10)] : '';

  const displayText = [displayMonth, year].filter(Boolean).join(' ');

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="absolute top-4 right-20 flex items-center gap-2 px-3 py-1.5 bg-primary/10 text-primary text-xs font-semibold rounded-full border border-primary/20"
    >
      <SlidersHorizontal size={14} />
      <span>Tuned to: {displayText}</span>
    </motion.div>
  );
};

export default TuningIndicator;