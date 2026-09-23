import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { PREDEFINED_LOCATIONS } from '../constants/predefinedLocations';

// Fix Leaflet default icon paths
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

/**
 * Tight bounding box restricting the public map to the Sohra/Cherrapunji
 * demo area. Users cannot pan or zoom out beyond this region.
 */
export const PUBLIC_SOHRA_BOUNDS = [
  [25.22, 91.68], // South-West
  [25.32, 91.78], // North-East
];

/**
 * Risk-level → fill/border colors (matches officials MapComponent palette).
 */
const getRiskColor = (risk) => {
  switch (risk?.toLowerCase()) {
    case 'low':      return '#10b981';
    case 'moderate': return '#eab308';
    case 'high':     return '#f97316';
    case 'critical': return '#ef4444';
    default:         return '#94a3b8';
  }
};

/**
 * Custom coloured pin icon for predefined reference zones.
 */
const createZoneMarkerIcon = (name, risk) => {
  const riskClass = (risk || 'low').toLowerCase();
  return L.divIcon({
    className: 'custom-sohra-marker-container',
    html: `
      <div class="sohra-marker-pin risk-${riskClass}">
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

/**
 * Distinct crosshair/pulse icon for the user's selected location —
 * visually separate from the predefined risk markers.
 */
const createUserLocationIcon = () =>
  L.divIcon({
    className: 'public-user-marker-container',
    html: `
      <div class="public-user-pin">
        <div class="public-user-pulse" aria-hidden="true"></div>
        <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
          <circle cx="12" cy="12" r="4"/>
          <line x1="12" y1="2" x2="12" y2="6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          <line x1="12" y1="18" x2="12" y2="22" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          <line x1="2" y1="12" x2="6" y2="12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          <line x1="18" y1="12" x2="22" y2="12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        </svg>
      </div>
      <div class="public-user-label">Your Location</div>
    `,
    iconSize: [120, 52],
    iconAnchor: [60, 26],
    popupAnchor: [0, -26],
  });

/**
 * PublicMapComponent — Leaflet map locked to Sohra bounds.
 *
 * Props:
 *   onLocationSelected(lat, lng) — called when user clicks map to place marker
 *   userMarkerPos               — [lat, lng] of current user marker or null
 */
export default function PublicMapComponent({ onLocationSelected, userMarkerPos }) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef  = useRef(null);
  const userMarkerRef   = useRef(null);

  // ── Initialise map once ────────────────────────────────────────────────────
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [25.270, 91.733],
      zoom: 13,
      minZoom: 12,
      maxZoom: 19,
      maxBounds: PUBLIC_SOHRA_BOUNDS,
      maxBoundsViscosity: 1.0,
      zoomControl: true,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);

    // Layer groups (bottom → top)
    const zonesLayerGroup = L.layerGroup().addTo(map);
    const userLayerGroup  = L.layerGroup().addTo(map);

    // Render all 10 predefined reference zone markers
    PREDEFINED_LOCATIONS.forEach((loc) => {
      const riskColor = getRiskColor(loc.demoProfile.risk);
      const marker = L.marker(loc.coordinates, {
        icon: createZoneMarkerIcon(loc.name, loc.demoProfile.risk),
        title: `${loc.name} — ${loc.demoProfile.risk} Risk`,
        zIndexOffset: 100,
      });

      const popupContent = `
        <div class="predefined-popup-card">
          <div class="popup-title-row">
            <h4 class="popup-place-name">${loc.name}</h4>
            <span class="popup-state-name">Sohra, Meghalaya</span>
          </div>
          <div class="popup-badge-tag">Monitored Zone</div>
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
              <span class="metric-label">7-Day Rainfall:</span>
              <span class="metric-val">${loc.demoProfile.rainfall7Day}</span>
            </div>
          </div>
        </div>
      `;

      marker.bindPopup(popupContent, {
        className: 'custom-sohra-popup',
        maxWidth: 270,
      });

      // Prevent zone marker clicks from also triggering user location placement
      marker.on('click', (e) => {
        L.DomEvent.stopPropagation(e);
      });

      marker.addTo(zonesLayerGroup);
    });

    // Handle map clicks → place user location marker
    map.on('click', (e) => {
      const { lat, lng } = e.latlng;

      // Clear existing user marker
      userLayerGroup.clearLayers();

      const marker = L.marker([lat, lng], {
        icon: createUserLocationIcon(),
        zIndexOffset: 200,
        title: 'Your selected location',
      });

      marker.addTo(userLayerGroup);
      userMarkerRef.current = marker;

      onLocationSelected(lat, lng);
    });

    mapInstanceRef.current = map;

    // Store user layer ref so we can update the marker from outside
    mapInstanceRef.current._userLayerGroup = userLayerGroup;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, [onLocationSelected]);

  // ── Sync userMarkerPos prop → actual Leaflet marker ───────────────────────
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;
    const group = map._userLayerGroup;
    if (!group) return;

    if (!userMarkerPos) {
      group.clearLayers();
    }
    // If userMarkerPos is set, the marker was already placed by the click handler.
    // Nothing extra to do here since the click handler renders it immediately.
  }, [userMarkerPos]);

  return (
    <div
      ref={mapContainerRef}
      className="public-map-view-container"
      id="public-map"
      aria-label="Sohra landslide risk map — click to select your location"
    />
  );
}
