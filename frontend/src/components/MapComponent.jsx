import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet's default icon paths if needed
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const KM_PER_DEG_LAT = 111.32;

export default function MapComponent({
  isGridMode,
  onGridCreated,
  gridRegions,
  selectedRegionId,
  onSelectRegion,
}) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const gridLayerGroupRef = useRef(null);
  const isGridModeRef = useRef(isGridMode);

  // Keep ref synchronized with current isGridMode state
  useEffect(() => {
    isGridModeRef.current = isGridMode;
    if (mapContainerRef.current) {
      if (isGridMode) {
        mapContainerRef.current.classList.add('crosshair-cursor');
      } else {
        mapContainerRef.current.classList.remove('crosshair-cursor');
      }
    }
  }, [isGridMode]);

  // Initialize Leaflet Map once
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    // Default center at a high-relief Himalayan slope region (Shimla / Uttarakhand region)
    const initialCenter = [31.1048, 77.1734];
    const map = L.map(mapContainerRef.current, {
      center: initialCenter,
      zoom: 13,
      zoomControl: true,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);

    const layerGroup = L.layerGroup().addTo(map);
    gridLayerGroupRef.current = layerGroup;
    mapInstanceRef.current = map;

    // Handle map clicks
    map.on('click', (e) => {
      if (!isGridModeRef.current) {
        // Grid mode is OFF: do not create or recreate grid
        return;
      }

      const { lat, lng } = e.latlng;
      const deltaLat = 1.0 / KM_PER_DEG_LAT;
      const deltaLng = 1.0 / (KM_PER_DEG_LAT * Math.cos((lat * Math.PI) / 180));

      const regions = [];
      let regionCount = 1;
      const rowOffsets = [1, 0, -1]; // North to South (Row 1, Row 2, Row 3)
      const colOffsets = [-1, 0, 1]; // West to East (Col 1, Col 2, Col 3)

      for (const r of rowOffsets) {
        for (const c of colOffsets) {
          const south = lat + (r - 0.5) * deltaLat;
          const north = lat + (r + 0.5) * deltaLat;
          const west = lng + (c - 0.5) * deltaLng;
          const east = lng + (c + 0.5) * deltaLng;

          const polygonCoords = [
            [north, west],
            [north, east],
            [south, east],
            [south, west],
          ];

          regions.push({
            id: `Region ${regionCount}`,
            shortLabel: `R${regionCount}`,
            index: regionCount,
            polygonCoords,
            center: [lat + r * deltaLat, lng + c * deltaLng],
          });

          regionCount++;
        }
      }

      onGridCreated(regions);
    });

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, [onGridCreated]);

  // Render / update grid regions layer whenever gridRegions or selectedRegionId changes
  useEffect(() => {
    const layerGroup = gridLayerGroupRef.current;
    if (!layerGroup || !mapInstanceRef.current) return;

    layerGroup.clearLayers();

    if (!gridRegions || gridRegions.length === 0) return;

    gridRegions.forEach((region) => {
      const isSelected = selectedRegionId === region.id;

      const polygon = L.polygon(region.polygonCoords, {
        color: isSelected ? '#f59e0b' : '#38bdf8',
        weight: isSelected ? 3.5 : 2,
        dashArray: isSelected ? null : '4, 4',
        fillColor: isSelected ? '#f59e0b' : '#0284c7',
        fillOpacity: isSelected ? 0.45 : 0.2,
      });

      // Permanent short label (R1–R9) displaying on the map
      polygon.bindTooltip(region.shortLabel, {
        permanent: true,
        direction: 'center',
        className: isSelected ? 'grid-region-tooltip-selected' : 'grid-region-tooltip',
      });

      polygon.on('click', (e) => {
        L.DomEvent.stopPropagation(e);
        onSelectRegion(region.id);
      });

      polygon.addTo(layerGroup);
    });
  }, [gridRegions, selectedRegionId, onSelectRegion]);

  return <div ref={mapContainerRef} className="map-view-container" id="map" />;
}
