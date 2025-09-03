// src/app/components/Map.tsx

"use client";

import React, { useEffect } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  useMap,
} from "react-leaflet";
import L, { LatLngExpression } from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix for default icon paths
delete (L.Icon.Default as any).prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
  iconUrl: require("leaflet/dist/images/marker-icon.png"),
  shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
});

// Mock data for a single float in the Indian Ocean
const mockFloats = [
  {
    profile_id: 12345,
    platform_number: 98765,
    latitude: -15.0,
    longitude: 75.0,
    project_name: "INCOIS",
    cycle_number: 15,
    juld: new Date().toLocaleDateString(),
  },
];

// Component to draw graticule (latitude and longitude lines)
const Graticule = () => {
  const lines = [];
  const lineStyle = { color: "rgba(0, 0, 0, 0.2)", weight: 1 };

  // Draw longitude lines
  for (let lon = -180; lon <= 180; lon += 30) {
    lines.push(
      <Polyline
        key={`lon-${lon}`}
        positions={[
          [90, lon],
          [-90, lon],
        ]}
        {...lineStyle}
      />
    );
  }
  // Draw latitude lines
  for (let lat = -90; lat <= 90; lat += 30) {
    lines.push(
      <Polyline
        key={`lat-${lat}`}
        positions={[
          [lat, -180],
          [lat, 180],
        ]}
        {...lineStyle}
      />
    );
  }
  return <>{lines}</>;
};

// Component to programmatically change the map's view with a smooth animation
const ChangeView = ({
  center,
  zoom,
}: {
  center: LatLngExpression;
  zoom: number;
}) => {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, zoom, {
      duration: 2, // Animation duration in seconds
    });
  }, [center, zoom, map]);
  return null;
};

// Define the props for the Map component
interface MapProps {
  center: LatLngExpression;
  zoom: number;
}

export default function Map({ center, zoom }: MapProps) {
  if (typeof window === "undefined") {
    return null;
  }

  return (
    <MapContainer
      center={center}
      zoom={zoom}
      style={{ height: "100%", width: "100%" }}
    >
      <ChangeView center={center} zoom={zoom} />
      <Graticule />
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      {mockFloats.map((f) => (
        <Marker key={f.profile_id} position={[f.latitude, f.longitude]}>
          <Popup>
            <b>Platform:</b> {f.platform_number} <br />
            <b>Project:</b> {f.project_name} <br />
            <b>Cycle:</b> {f.cycle_number} <br />
            <b>Date:</b> {f.juld} <br />
            <b>Location:</b> ({f.latitude.toFixed(2)}, {f.longitude.toFixed(2)})
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}