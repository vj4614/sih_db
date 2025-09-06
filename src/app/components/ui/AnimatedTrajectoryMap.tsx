// src/app/components/ui/AnimatedTrajectoryMap.tsx

import React, { useEffect, useRef, useState } from "react";
import L, { LatLngExpression, Map as LeafletMap } from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix for default marker icon issue with Leaflet and Webpack/Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

interface Float {
  id: number;
  platform_number: number;
  project_name: string;
  last_cycle: number;
  position: LatLngExpression;
  trajectory: LatLngExpression[];
  color?: string; // Color property added here
}

interface AnimatedTrajectoryMapProps {
  center: LatLngExpression;
  zoom: number;
  floats: Float[];
  selectedFloatId: number | null;
  onFloatSelect: (float: Float) => void;
  transition: "fly" | "instant";
  theme: "light" | "dark";
  animationSpeed: number; // milliseconds per trajectory segment
}

const AnimatedTrajectoryMap: React.FC<AnimatedTrajectoryMapProps> = ({
  center,
  zoom,
  floats,
  selectedFloatId,
  onFloatSelect,
  transition,
  theme,
  animationSpeed,
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<LeafletMap | null>(null);
  const trajectoryLayerRef = useRef<L.LayerGroup | null>(null); // Layer for polylines
  const markerLayerRef = useRef<L.LayerGroup | null>(null); // Layer for markers

  // State to track animation progress for each float
  const [animationProgress, setAnimationProgress] = useState<Map<number, { segmentIndex: number; segmentProgress: number }>>(() => {
    const initialProgress = new Map();
    floats.forEach(float => initialProgress.set(float.id, { segmentIndex: 0, segmentProgress: 0 }));
    return initialProgress;
  });

  // Initialize map
  useEffect(() => {
    if (mapRef.current && !leafletMapRef.current) {
      leafletMapRef.current = L.map(mapRef.current, {
        center: center,
        zoom: zoom,
        zoomControl: false,
        attributionControl: false,
      });

      trajectoryLayerRef.current = L.layerGroup().addTo(leafletMapRef.current);
      markerLayerRef.current = L.layerGroup().addTo(leafletMapRef.current);

      L.tileLayer(
        theme === "dark"
          ? "https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png"
          : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
        {
          maxZoom: 18,
        }
      ).addTo(leafletMapRef.current);
    }

    return () => {
      if (leafletMapRef.current) {
        leafletMapRef.current.remove();
        leafletMapRef.current = null;
      }
    };
  }, [theme]);

  // Update map view when center/zoom changes
  useEffect(() => {
    if (leafletMapRef.current) {
      if (transition === "fly") {
        leafletMapRef.current.flyTo(center, zoom, {
          duration: 1.5,
        });
      } else {
        leafletMapRef.current.setView(center, zoom, { animate: false });
      }
    }
  }, [center, zoom, transition]);

  // Animation loop
  useEffect(() => {
    if (!leafletMapRef.current || !trajectoryLayerRef.current || !markerLayerRef.current) return;

    let lastTimestamp = 0;
    let animationFrameId: number;

    const animate = (timestamp: DOMHighResTimeStamp) => {
      if (!lastTimestamp) lastTimestamp = timestamp;
      const deltaTime = timestamp - lastTimestamp;
      lastTimestamp = timestamp;

      setAnimationProgress(prevProgress => {
        const newProgress = new Map(prevProgress);

        floats.forEach(float => {
          const current = newProgress.get(float.id) || { segmentIndex: 0, segmentProgress: 0 };
          const trajectory = float.trajectory;

          if (trajectory.length < 2) return; // Need at least two points to animate

          let { segmentIndex, segmentProgress } = current;

          // Advance progress along the current segment
          segmentProgress += (deltaTime / animationSpeed);

          if (segmentProgress >= 1) {
            // Move to next segment
            segmentIndex++;
            segmentProgress = 0; // Reset progress for the new segment

            if (segmentIndex >= trajectory.length - 1) {
              // Reached end of trajectory, loop back to start
              segmentIndex = 0;
            }
          }
          newProgress.set(float.id, { segmentIndex, segmentProgress });
        });
        return newProgress;
      });

      animationFrameId = requestAnimationFrame(animate);
    };

    animationFrameId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [floats, animationSpeed]);

  // Render floats based on animation progress
  useEffect(() => {
    if (!leafletMapRef.current || !trajectoryLayerRef.current || !markerLayerRef.current) return;

    trajectoryLayerRef.current.clearLayers();
    markerLayerRef.current.clearLayers();

    floats.forEach(float => {
      const { segmentIndex, segmentProgress } = animationProgress.get(float.id) || { segmentIndex: 0, segmentProgress: 0 };
      const trajectory = float.trajectory;

      if (trajectory.length < 2) return;

      const p1 = trajectory[segmentIndex];
      const p2 = trajectory[segmentIndex + 1] || trajectory[segmentIndex]; // Handle end of trajectory gracefully

      // Interpolate current position
      const currentLat = (p1[0] as number) + ((p2[0] as number) - (p1[0] as number)) * segmentProgress;
      const currentLng = (p1[1] as number) + ((p2[1] as number) - (p1[1] as number)) * segmentProgress;
      const currentPosition: LatLngExpression = [currentLat, currentLng];

      // Render the path up to the current point
      const interpolatedPath = float.trajectory.slice(0, segmentIndex + 1);
      interpolatedPath.push(currentPosition); // Add current interpolated point to the path

      L.polyline(interpolatedPath, {
        color: float.color || '#3388ff', // Use float's color, default to blue
        weight: 3,
        opacity: 0.7,
      }).addTo(trajectoryLayerRef.current);

      // Render the current float marker
      L.circleMarker(currentPosition, {
        radius: 8,
        fillColor: float.color || '#3388ff', // Use float's color for marker
        color: '#000', // Border color
        weight: 1,
        opacity: 1,
        fillOpacity: 0.8,
      }).addTo(markerLayerRef.current!).on('click', () => onFloatSelect(float));
    });

  }, [animationProgress, floats, onFloatSelect, selectedFloatId]);


  return <div ref={mapRef} className="w-full h-full rounded-lg" />;
};

export default AnimatedTrajectoryMap;