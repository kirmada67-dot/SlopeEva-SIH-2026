import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { PREDEFINED_LOCATIONS } from '../constants/predefinedLocations';

// Fix Leaflet's default icon paths if needed
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const KM_PER_DEG_LAT = 111.32;

// Custom pin icon for predefined Sohra demo risk zones
const createPredefinedMarkerIcon = (name) => {
  return L.divIcon({
    className: 'custom-sohra-marker-container',
    html: `
      <div class="sohra-marker-pin">
        <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" stroke="none">
          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
        </svg>
      </div>
      <div class="sohra-marker-label">${name}</div>
    `,
    iconSize: [140, 48],
    iconAnchor: [70, 28],
    popupAnchor: [0, -28],
  });
};

export default function MapComponent({
  isGridMode,
  gridSize,            // 1, 2, or 3 — number of rows/cols
  onGridCreated,
  gridRegions,
  selectedRegionId,
  onSelectRegion,
  riskyRoadsGeoJSON,   // GeoJSON FeatureCollection | null
}) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const predefinedMarkersLayerGroupRef = useRef(null);
  const gridLayerGroupRef = useRef(null);
  const roadsLayerGroupRef = useRef(null);
  const isGridModeRef = useRef(isGridMode);
  const gridSizeRef = useRef(gridSize);

  // Keep refs synchronized with current prop values
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

  useEffect(() => {
    gridSizeRef.current = gridSize;
  }, [gridSize]);

  // Initialize Leaflet Map once
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    // Default center at Sohra (Cherrapunji), Meghalaya
    const initialCenter = [25.2702, 91.7323];
    const map = L.map(mapContainerRef.current, {
      center: initialCenter,
      zoom: 13,
      zoomControl: true,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);

    // Layer groups hierarchy:
    // 1. Roads layer (lowest overlay)
    // 2. Grid layer (custom 3x3 regions)
    // 3. Predefined location markers (always visible top reference)
    const roadsLayerGroup = L.layerGroup().addTo(map);
    const gridLayerGroup = L.layerGroup().addTo(map);
    const predefinedMarkersLayerGroup = L.layerGroup().addTo(map);

    roadsLayerGroupRef.current = roadsLayerGroup;
    gridLayerGroupRef.current = gridLayerGroup;
    predefinedMarkersLayerGroupRef.current = predefinedMarkersLayerGroup;
    mapInstanceRef.current = map;

    // Render predefined Sohra demo risk zone markers
    PREDEFINED_LOCATIONS.forEach((loc) => {
      const marker = L.marker(loc.coordinates, {
        icon: createPredefinedMarkerIcon(loc.name),
        title: `${loc.name} - Sohra, Meghalaya`,
      });

      const popupContent = `
        <div class="predefined-popup-card">
          <div class="popup-title-row">
            <h4 class="popup-place-name">${loc.name}</h4>
            <span class="popup-state-name">Sohra, Meghalaya</span>
          </div>
          <div class="popup-badge-tag">Demo Risk Profile</div>
          
          <div class="popup-risk-strip risk-${loc.demoProfile.risk.toLowerCase()}">
            <div class="popup-risk-item">
              <span class="label">Risk:</span>
              <span class="value">${loc.demoProfile.risk}</span>
            </div>
            <div class="popup-risk-item">
              <span class="label">Probability:</span>
              <span class="value">${loc.demoProfile.probability}</span>
            </div>
          </div>

          <div class="popup-metrics-table">
            <div class="metric-row">
              <span class="metric-label">24h Rainfall:</span>
              <span class="metric-val">${loc.demoProfile.rainfall24h}</span>
            </div>
            <div class="metric-row">
              <span class="metric-label">Slope:</span>
              <span class="metric-val">${loc.demoProfile.slope}</span>
            </div>
            <div class="metric-row">
              <span class="metric-label">3-Day Rainfall:</span>
              <span class="metric-val">${loc.demoProfile.rainfall3Day}</span>
            </div>
            <div class="metric-row">
              <span class="metric-label">Distance to Water:</span>
              <span class="metric-val">${loc.demoProfile.distanceToWater}</span>
            </div>
            <div class="metric-row">
              <span class="metric-label">7-Day Rainfall:</span>
              <span class="metric-val">${loc.demoProfile.rainfall7Day}</span>
            </div>
          </div>
        </div>
      `;

      marker.bindPopup(popupContent, {
        className: 'custom-sohra-popup',
        maxWidth: 280,
      });

      // Prevent marker clicks from triggering grid creation on the map
      marker.on('click', (e) => {
        L.DomEvent.stopPropagation(e);
      });

      marker.addTo(predefinedMarkersLayerGroup);
    });

    // Handle map clicks
    map.on('click', (e) => {
      if (!isGridModeRef.current) {
        // Grid mode is OFF: do not create or recreate grid
        return;
      }

      const { lat, lng } = e.latlng;
      const deltaLat = 1.0 / KM_PER_DEG_LAT;
      const deltaLng = 1.0 / (KM_PER_DEG_LAT * Math.cos((lat * Math.PI) / 180));

      const size = gridSizeRef.current; // 1, 2, or 3
      const regions = [];
      let regionCount = 1;

      // Build offset arrays so grid is centered around clicked point.
      // For size N, offsets go from -(N-1)/2 to +(N-1)/2 in steps of 1.
      // Row offsets: positive = North (higher lat), rendered top-to-bottom.
      // Col offsets: positive = East (higher lng), rendered left-to-right.
      const half = (size - 1) / 2;
      const rowOffsets = [];
      for (let r = size - 1; r >= 0; r--) rowOffsets.push(r - half); // North→South
      const colOffsets = [];
      for (let c = 0; c < size; c++) colOffsets.push(c - half);      // West→East

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
            // Store bbox for the roads endpoint
            south,
            north,
            west,
            east,
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

      // Permanent short label (R1–R9) on the map
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

  // Render risky roads overlay whenever riskyRoadsGeoJSON changes
  useEffect(() => {
    const roadsLayerGroup = roadsLayerGroupRef.current;
    if (!roadsLayerGroup) return;

    roadsLayerGroup.clearLayers();

    if (!riskyRoadsGeoJSON || riskyRoadsGeoJSON.features?.length === 0) return;

    L.geoJSON(riskyRoadsGeoJSON, {
      style: () => ({
        color: '#ef4444',
        weight: 5,
        opacity: 0.9,
        lineCap: 'round',
        lineJoin: 'round',
      }),
      onEachFeature: (feature, layer) => {
        const { highway, name } = feature.properties || {};
        const label = name
          ? `⚠️ ${name} (${highway})`
          : `⚠️ ${highway || 'Road'} — High/Critical Risk Zone`;
        layer.bindPopup(label);
      },
    }).addTo(roadsLayerGroup);
  }, [riskyRoadsGeoJSON]);

  return <div ref={mapContainerRef} className="map-view-container" id="map" />;
}
