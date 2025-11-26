import React from "react";

/**
 * Simple placeholder MapViews component.
 * Replace with your real map implementation (Leaflet, Mapbox, Google Maps...) later.
 */
const MapViews: React.FC = () => {
  return (
    <div className="w-full h-full flex items-center justify-center bg-gray-50">
      <div className="text-center text-gray-500">
        <div style={{ fontSize: 36 }}>🗺️</div>
        <div>Map view placeholder — implement your real MapViews here</div>
      </div>
    </div>
  );
};

export default MapViews;