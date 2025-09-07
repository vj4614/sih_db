// src/app/components/ui/TuneModal.tsx

"use client";

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles } from 'lucide-react';
import FilterGroup from './FilterGroup';

interface TuneModalProps {
  isOpen: boolean;
  onClose: () => void;
  filters: { year: string; month: string; };
  setFilters: React.Dispatch<React.SetStateAction<any>>;
  onApply: () => void;
}

const TuneModal: React.FC<TuneModalProps> = ({ isOpen, onClose, filters, setFilters, onApply }) => {
  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleApplyClick = () => {
    onApply();
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 30 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 30 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="bg-card/80 border border-primary/20 rounded-2xl shadow-2xl shadow-primary/20 w-full max-w-md p-8 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button onClick={onClose} className="absolute top-4 right-4 p-2 text-muted-foreground hover:text-foreground transition-colors rounded-full">
              <X size={20} />
            </button>
            <div className="flex items-center gap-3 mb-6">
              <Sparkles className="w-8 h-8 text-primary" />
              <h2 className="text-2xl font-bold text-foreground">Tune FloatChat</h2>
            </div>
            <p className="text-muted-foreground mb-8">
              Focus your session on a specific timeframe. The AI will tailor its responses and visualizations to the data from your selected period.
            </p>
            <div className="grid grid-cols-2 gap-6">
              <FilterGroup label="Target Year">
                <select name="year" value={filters.year} onChange={handleFilterChange} className="filter-input">
                  <option value="">All Years</option>
                  <option>2024</option>
                  <option>2023</option>
                  <option>2022</option>
                </select>
              </FilterGroup>
              <FilterGroup label="Target Month">
                <select name="month" value={filters.month} onChange={handleFilterChange} className="filter-input">
                  <option value="">All Months</option>
                  {[...Array(12)].map((_, i) => (
                    <option key={i + 1} value={i + 1}>
                      {new Date(0, i).toLocaleString('default', { month: 'long' })}
                    </option>
                  ))}
                </select>
              </FilterGroup>
            </div>
            <button
              onClick={handleApplyClick}
              className="w-full mt-10 py-3 bg-primary text-primary-foreground font-semibold rounded-lg shadow-lg shadow-primary/30 hover:bg-primary/90 transition-all transform hover:scale-105 active:scale-100"
            >
              Apply Tuning
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default TuneModal;