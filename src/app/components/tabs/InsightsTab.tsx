"use client";

import React, { useState, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import { Layers, Zap, Droplet, Globe, Hash, X } from 'lucide-react';
import InsightDetailView from "../ui/InsightDetailView";

const Plot = dynamic(() => import("react-plotly.js"), { ssr: false });

export default function InsightsTab({ theme }) {
  const [selectedInsight, setSelectedInsight] = useState(null);
  const [predictionSlider, setPredictionSlider] = useState(50); // 0-100 range for prediction

  const insightData = [
    {
      id: 'cause-effect',
      title: 'Cause & Effect Analysis',
      icon: Layers,
      color: 'from-blue-500 to-purple-600',
      text: 'Analysis of data from Float #12345 suggests a direct correlation between a cold water intrusion and a significant drop in surface salinity. This event appears to be caused by an increased influx of meltwater from polar regions.',
      buttonText: 'Explore Cause & Effect',
      span: 'md:col-span-2'
    },
    {
      id: 'max-temp',
      title: 'Max Temperature Warning',
      icon: Zap,
      color: 'from-red-500 to-red-800',
      text: 'An underwater heatwave anomaly was observed in the Southern Indian Ocean, with temperatures 2°C above the seasonal average. This poses a significant threat to local marine ecosystems.',
      buttonText: 'View Heatwave Data',
      vibrate: true,
    },
    {
      id: 'salinity',
      title: 'Increasing Salinity',
      icon: Droplet,
      color: 'from-green-500 to-teal-600',
      text: 'Long-term data from the region shows a consistent increase in deep-water salinity levels. This is a critical indicator of a changing thermohaline circulation which can be deadly for the environment.',
      buttonText: 'See Salinity Trends',
    },
    {
      id: 'ecosystem',
      title: 'Ecosystem Impact',
      icon: Globe,
      color: 'from-yellow-400 to-orange-600',
      text: 'The observed oceanographic anomalies have led to localized bleaching events and a decrease in phytoplankton density, signaling a potential shift in the region\'s marine ecosystem.',
      buttonText: 'Analyze Ecosystem Health',
    },
    {
      id: 'anomaly',
      title: 'Uncategorized Anomaly',
      icon: Hash,
      color: 'from-indigo-500 to-pink-600',
      text: 'A novel data pattern has been detected in a remote section of the Indian Ocean. Its cause is currently unknown, highlighting the need for further exploration and data collection.',
      buttonText: 'Investigate Anomaly',
    },
  ];

  const [inView, setInView] = useState(false);
  const domRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setInView(true);
            observer.disconnect();
          }
        });
      },
      { threshold: 0.1 }
    );

    const currentRef = domRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }
    
    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, []);

  const handleButtonClick = (insightId) => {
    setSelectedInsight(insightId);
    setPredictionSlider(50); // Reset slider on new insight
  };

  const handleSliderChange = (event) => {
    setPredictionSlider(event.target.value);
  };
  
  if (selectedInsight === 'cause-effect') {
      const dates = ['Jan 2023', 'Feb 2023', 'Mar 2023', 'Apr 2023', 'May 2023', 'Jun 2023'];
      const historicalSalinity = [34.5, 34.2, 33.8, 33.5, 33.9, 34.1];
      const historicalMeltwater = [10, 15, 25, 35, 20, 12];
      
      const predictionMonths = (predictionSlider - 50) / 50 * 12; // -12 to +12 months
      const lastHistoricalIndex = historicalSalinity.length - 1;
      const lastDate = new Date('2023-06-01');

      let predictedDates = [];
      if (predictionMonths > 0) {
        for(let i = 1; i <= Math.round(predictionMonths); i++) {
          const newDate = new Date(lastDate);
          newDate.setMonth(lastDate.getMonth() + i);
          predictedDates.push(newDate.toLocaleString('en-us', { month: 'short', year: 'numeric' }));
        }
      } else if (predictionMonths < 0) {
        const firstDate = new Date('2023-01-01');
        for(let i = 1; i <= Math.round(Math.abs(predictionMonths)); i++) {
          const newDate = new Date(firstDate);
          newDate.setMonth(firstDate.getMonth() - i);
          predictedDates.unshift(newDate.toLocaleString('en-us', { month: 'short', year: 'numeric' }));
        }
      }
      
      const combineDataPoints = (historicalData, predictedData) => [
          ...historicalData,
          ...predictedData.slice(1)
      ];

      const combineLabels = (historicalDates, predictedDates) => [
          ...historicalDates,
          ...predictedDates.slice(1)
      ];
      
      const salinityChangeRate = (historicalSalinity[lastHistoricalIndex] - historicalSalinity[0]) / (lastHistoricalIndex);
      const meltwaterChangeRate = (historicalMeltwater[lastHistoricalIndex] - historicalMeltwater[0]) / (lastHistoricalIndex);

      let futureSalinityPrediction = [];
      let futureMeltwaterPrediction = [];
      
      if (predictionMonths > 0) {
        futureSalinityPrediction = [historicalSalinity[lastHistoricalIndex], ...new Array(Math.round(predictionMonths)).fill(0).map((_, i) => {
            return historicalSalinity[lastHistoricalIndex] + (i + 1) * salinityChangeRate;
        })];
        
        futureMeltwaterPrediction = [historicalMeltwater[lastHistoricalIndex], ...new Array(Math.round(predictionMonths)).fill(0).map((_, i) => {
            return historicalMeltwater[lastHistoricalIndex] + (i + 1) * meltwaterChangeRate;
        })];

        predictedDates = [dates[dates.length - 1], ...predictedDates];
      } else if (predictionMonths < 0) {
        const pastMonths = Math.round(Math.abs(predictionMonths));
        futureSalinityPrediction = new Array(pastMonths).fill(0).map((_, i) => {
            return historicalSalinity[0] + (i - pastMonths) * salinityChangeRate;
        }).concat(historicalSalinity);
        
        futureMeltwaterPrediction = new Array(pastMonths).fill(0).map((_, i) => {
            return historicalMeltwater[0] + (i - pastMonths) * meltwaterChangeRate;
        }).concat(historicalMeltwater);
        
        const firstDate = new Date('2023-01-01');
        for (let i = 1; i <= pastMonths; i++) {
            const newDate = new Date(firstDate);
            newDate.setMonth(firstDate.getMonth() - i);
            predictedDates.unshift(newDate.toLocaleString('en-us', { month: 'short', year: 'numeric' }));
        }
        
      }
      
      const predictedSalinityData = [
          {
            x: predictionMonths >= 0 ? dates : predictedDates.slice(0, Math.round(Math.abs(predictionMonths))),
            y: predictionMonths >= 0 ? historicalSalinity : futureSalinityPrediction.slice(0, Math.round(Math.abs(predictionMonths))),
            name: 'Historical Salinity',
            type: 'scatter',
            mode: 'lines+markers',
            line: { color: '#3b82f6', width: 2 }
          },
          {
            x: predictionMonths >= 0 ? predictedDates : dates.slice(0, dates.length - Math.round(Math.abs(predictionMonths))),
            y: predictionMonths >= 0 ? futureSalinityPrediction : futureSalinityPrediction.slice(Math.round(Math.abs(predictionMonths))),
            name: 'Predicted Trend',
            type: 'scatter',
            mode: 'lines',
            line: { color: '#3b82f6', width: 2, dash: 'dot' },
            showlegend: true
          }
      ];

      const predictedMeltwaterData = [
          {
            x: predictionMonths >= 0 ? dates : predictedDates.slice(0, Math.round(Math.abs(predictionMonths))),
            y: predictionMonths >= 0 ? historicalMeltwater : futureMeltwaterPrediction.slice(0, Math.round(Math.abs(predictionMonths))),
            name: 'Historical Meltwater',
            type: 'scatter',
            mode: 'lines+markers',
            line: { color: '#ef4444', width: 2 }
          },
          {
            x: predictionMonths >= 0 ? predictedDates : dates.slice(0, dates.length - Math.round(Math.abs(predictionMonths))),
            y: predictionMonths >= 0 ? futureMeltwaterPrediction : futureMeltwaterPrediction.slice(Math.round(Math.abs(predictionMonths))),
            name: 'Predicted Trend',
            type: 'scatter',
            mode: 'lines',
            line: { color: '#ef4444', width: 2, dash: 'dot' },
            showlegend: true
          }
      ];
      
      const layout = (title) => ({
        title: title,
        paper_bgcolor: 'transparent',
        plot_bgcolor: 'transparent',
        font: { color: theme === 'dark' ? '#e6edf3' : '#1a202c' },
        xaxis: { title: 'Date', gridcolor: theme === 'dark' ? '#21262d' : '#e2e8f0', tickformat: '%b %Y' },
        yaxis: { title: 'Value', gridcolor: theme === 'dark' ? '#21262d' : '#e2e8f0' },
        margin: { t: 40, l: 50, r: 20, b: 40 },
        legend: { orientation: 'h', y: -0.25 }
      });
      
      let predictionLabel = "";
      const roundedPredictionMonths = Math.round(predictionMonths);
      if (roundedPredictionMonths > 0) {
        predictionLabel = `Future prediction: +${roundedPredictionMonths} months`;
      } else if (roundedPredictionMonths < 0) {
        predictionLabel = `Historical simulation: ${-roundedPredictionMonths} months in the past`;
      } else {
        predictionLabel = "Present moment";
      }
      
      return (
        <InsightDetailView
            title="Cause & Effect Analysis"
            onClose={() => setSelectedInsight(null)}
            theme={theme}
            predictionSlider={predictionSlider}
            onSliderChange={handleSliderChange}
            predictionLabel={predictionLabel}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Plot data={predictedSalinityData} layout={layout('Salinity vs. Time')} style={{ width: "100%", height: "100%" }} useResizeHandler />
              <Plot data={predictedMeltwaterData} layout={layout('Meltwater Influx vs. Time')} style={{ width: "100%", height: "100%" }} useResizeHandler />
          </div>
        </InsightDetailView>
      );
  }

  return (
    <section ref={domRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-4 md:p-6 lg:p-8">
      {insightData.map((insight, index) => {
        const InsightIcon = insight.icon;
        return (
          <div 
            key={index} 
            className={`
              p-8 bg-card rounded-3xl shadow-2xl flex flex-col justify-between 
              hover:shadow-primary/50 transition-shadow
              ${insight.span || ''}
              ${inView ? 'animate-slide-up' : 'opacity-0'}
              ${insight.vibrate ? 'vibrate-on-load' : ''}
            `}
            style={{ animationDelay: `${index * 0.15}s` }}
          >
            <div>
              <h4 className={`font-extrabold text-2xl text-transparent bg-clip-text bg-gradient-to-r ${insight.color} mb-4 flex items-center font-mono`}>
                <InsightIcon size={32} className="mr-3" /> {insight.title}
              </h4>
              <p className="text-muted-foreground leading-relaxed text-lg">
                {insight.text}
              </p>
            </div>
            <div className="mt-6 self-start">
              <button 
                  onClick={() => handleButtonClick(insight.id)}
                  className={`px-6 py-3 bg-gradient-to-r ${insight.color} text-white font-bold rounded-full shadow-lg hover:scale-105 transition-all transform active:scale-95`}
              >
                {insight.buttonText}
              </button>
            </div>
          </div>
        )
      })}
      <style jsx>{`
        @keyframes vibrate-on-load {
          0% { transform: translate(0); }
          20% { transform: translate(-2px, 2px); }
          40% { transform: translate(-2px, -2px); }
          60% { transform: translate(2px, 2px); }
          80% { transform: translate(2px, -2px); }
          100% { transform: translate(0); }
        }
        .vibrate-on-load {
          animation: vibrate-on-load 0.2s linear infinite;
          animation-iteration-count: 1;
        }
        @keyframes slide-up {
            from { opacity: 0; transform: translateY(50px); }
            to { opacity: 1; transform: translateY(0); }
        }
        .animate-slide-up {
            animation: slide-up 0.6s ease-out forwards;
        }
      `}</style>
    </section>
  );
};