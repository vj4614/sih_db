// src/app/components/ui/MapDisplay.tsx
"use client";

import React from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from "react-leaflet";
import L, { LatLngExpression } from "leaflet";
import "leaflet/dist/leaflet.css";

// Import leaflet images directly
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import shadowUrl from 'leaflet/dist/images/marker-shadow.png';

// This logic MUST run in a client-side context
if (typeof window !== 'undefined') {
    delete (L.Icon.Default as any).prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
        iconRetinaUrl: iconRetinaUrl.src,
        iconUrl: iconUrl.src,
        shadowUrl: shadowUrl.src,
    });
}

const floatIcon = new L.Icon({ iconUrl: '/float-icon.svg', iconSize: [25, 25] });
const selectedFloatIcon = new L.Icon({ iconUrl: '/float-icon-selected.svg', iconSize: [35, 35] });

const ChangeView = ({ center, zoom, transition }) => {
  const map = useMap();
  React.useEffect(() => {
    if (transition === 'fly') {
      map.flyTo(center, zoom, { duration: 2 });
    } else {
      map.setView(center, zoom);
    }
  }, [center, zoom, transition, map]);
  return null;
};

export default function MapDisplay({ center, zoom, selectedFloatId, onFloatSelect, transition, floats, theme }) {
  const lightTileUrl = "https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}";
  const darkTileUrl = "https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png";

  return (
    <MapContainer center={center} zoom={zoom} style={{ height: "100%", width: "100%" }} scrollWheelZoom={true}>
      <ChangeView center={center} zoom={zoom} transition={transition} />
      <TileLayer key={theme} url={theme === 'dark' ? darkTileUrl : lightTileUrl} />
      {floats.map((f) => (
          <React.Fragment key={f.id}>
            {f.trajectory && <Polyline positions={f.trajectory} color="#3b82f6" weight={2} opacity={0.7} />}
            <Marker
              icon={selectedFloatId === f.id ? selectedFloatIcon : floatIcon}
              position={f.position}
              eventHandlers={{ click: () => onFloatSelect(f) }}
            >
              <Popup>
                <div className="text-sm">
                    <p className="font-bold text-base">Float #{f.platform_number}</p>
                    {f.project_name && <p><strong>Project:</strong> {f.project_name}</p>}
                </div>
              </Popup>
            </Marker>
        </React.Fragment>
      ))}
    </MapContainer>
  );
}