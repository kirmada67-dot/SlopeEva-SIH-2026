import React, { useState, useCallback } from 'react';
import PublicMapComponent from './PublicMapComponent.jsx';
import { PREDEFINED_LOCATIONS } from '../constants/predefinedLocations.js';
import slopeEvaLogo from '../assets/slopeeva-icon-accent.png';

/**
 * Haversine formula — returns distance in km between two [lat, lng] points.
 */
function haversineKm(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/**
 * Find the nearest predefined zone to [lat, lng] by Haversine distance.
 * Returns { zone, distanceKm }.
 */
function findNearestZone(lat, lng) {
  let nearest = null;
  let minDist = Infinity;

  for (const zone of PREDEFINED_LOCATIONS) {
    const [zLat, zLng] = zone.coordinates;
    const dist = haversineKm(lat, lng, zLat, zLng);
    if (dist < minDist) {
      minDist = dist;
      nearest = zone;
    }
  }

  return { zone: nearest, distanceKm: minDist };
}

/**
 * Risk level → CSS class name used in shared App.css risk badge styles.
 */
function getRiskBadgeClass(risk) {
  switch (risk?.toLowerCase()) {
    case 'low':      return 'risk-badge risk-low';
    case 'moderate': return 'risk-badge risk-moderate';
    case 'high':     return 'risk-badge risk-high';
    case 'critical': return 'risk-badge risk-critical';
    default:         return 'risk-badge';
  }
}

/**
 * Risk level → fill colour for probability bar (reuses officials palette).
 */
function getProbabilityBarClass(risk) {
  return `probability-bar-fill ${(risk || '').toLowerCase()}`;
}

export default function PublicDashboard({ onReturnHome }) {
  const [userMarkerPos, setUserMarkerPos] = useState(null);
  const [assessment, setAssessment]       = useState(null); // { zone, distanceKm, userLat, userLng }

  const handleLocationSelected = useCallback((lat, lng) => {
    setUserMarkerPos([lat, lng]);
    const { zone, distanceKm } = findNearestZone(lat, lng);
    setAssessment({ zone, distanceKm, userLat: lat, userLng: lng });
  }, []);

  const probabilityPercent = assessment
    ? Math.round(assessment.zone.demoProfile.probability * 100)
    : null;

  return (
    <div className="public-container">
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <header className="public-header">
        <div className="public-header-brand">
          <img
            src={slopeEvaLogo}
            alt="SlopeEva Logo"
            className="public-header-logo"
          />
          <div>
            <span className="public-header-title">SlopeEva</span>
            <span className="public-header-sub">Public Landslide Risk Map</span>
          </div>
        </div>

        <div className="public-header-actions">
          <span className="public-region-badge">
            📍 Sohra · Cherrapunji, Meghalaya
          </span>
          <button
            className="return-home-btn"
            type="button"
            onClick={onReturnHome}
            id="public-return-home-btn"
          >
            ← Return Home
          </button>
        </div>
      </header>

      {/* ── Map hint bar ─────────────────────────────────────────────────── */}
      <div className="public-map-hint" role="status" aria-live="polite">
        {userMarkerPos ? (
          <span>
            📍 Location selected at{' '}
            <strong>
              {userMarkerPos[0].toFixed(4)}°N, {userMarkerPos[1].toFixed(4)}°E
            </strong>
            . Click anywhere else to update.
          </span>
        ) : (
          <span>
            🖱️ <strong>Click anywhere on the map</strong> to select your location and receive a risk assessment.
          </span>
        )}
      </div>

      {/* ── Main workspace ───────────────────────────────────────────────── */}
      <div className="public-workspace">
        {/* Map section */}
        <section className="public-map-section" aria-label="Risk map">
          <PublicMapComponent
            onLocationSelected={handleLocationSelected}
            userMarkerPos={userMarkerPos}
          />
        </section>

        {/* Assessment panel */}
        <aside className="public-assessment-panel" aria-label="Risk assessment results">
          {!assessment ? (
            <div className="public-panel-empty">
              <div className="public-panel-empty-icon" aria-hidden="true">📍</div>
              <h3>No Location Selected</h3>
              <p>
                Click anywhere on the Sohra map to place a marker and receive
                a landslide risk assessment for that area.
              </p>
              <div className="public-zone-legend">
                <p className="public-zone-legend-title">Zone Risk Key</p>
                <div className="public-legend-items">
                  <span className="public-legend-dot legend-low" /> Low
                  <span className="public-legend-dot legend-moderate" /> Moderate
                  <span className="public-legend-dot legend-high" /> High
                  <span className="public-legend-dot legend-critical" /> Critical
                </div>
              </div>
            </div>
          ) : (
            <div className="public-panel-result">
              {/* Location heading */}
              <div className="public-result-header">
                <span className="public-result-label">Selected Location</span>
                <span className="public-result-coords">
                  {assessment.userLat.toFixed(4)}°N,{' '}
                  {assessment.userLng.toFixed(4)}°E
                </span>
              </div>

              {/* Nearest zone attribution */}
              <div className="public-nearest-zone-card">
                <div className="public-nearest-zone-label">
                  📡 Nearest Monitored Zone
                </div>
                <div className="public-nearest-zone-name">
                  {assessment.zone.name}
                </div>
                <div className="public-nearest-zone-dist">
                  {assessment.distanceKm < 1
                    ? `${Math.round(assessment.distanceKm * 1000)} m away`
                    : `${assessment.distanceKm.toFixed(2)} km away`}
                </div>
              </div>

              {/* Risk result */}
              <div className="public-risk-result-card">
                <div className="public-risk-result-header">
                  <span className="public-risk-result-title">Risk Assessment</span>
                  <span className={getRiskBadgeClass(assessment.zone.demoProfile.risk)}>
                    {assessment.zone.demoProfile.risk} Risk
                  </span>
                </div>

                <div className="prediction-metric">
                  <span className="metric-label">Landslide Probability:</span>
                  <span className="metric-value">{probabilityPercent}%</span>
                </div>

                <div className="probability-bar-bg">
                  <div
                    className={getProbabilityBarClass(assessment.zone.demoProfile.risk)}
                    style={{
                      width: `${Math.min(Math.max(probabilityPercent, 2), 100)}%`,
                    }}
                  />
                </div>
              </div>

              {/* Demo conditions */}
              <div className="public-conditions-section">
                <h4 className="public-conditions-title">Zone Conditions</h4>
                <div className="popup-metrics-table">
                  <div className="metric-row">
                    <span className="metric-label">24h Rainfall:</span>
                    <span className="metric-val">
                      {assessment.zone.demoProfile.rainfall24h}
                    </span>
                  </div>
                  <div className="metric-row">
                    <span className="metric-label">Slope Angle:</span>
                    <span className="metric-val">
                      {assessment.zone.demoProfile.slope}
                    </span>
                  </div>
                  <div className="metric-row">
                    <span className="metric-label">3-Day Rainfall:</span>
                    <span className="metric-val">
                      {assessment.zone.demoProfile.rainfall3Day}
                    </span>
                  </div>
                  <div className="metric-row">
                    <span className="metric-label">7-Day Rainfall:</span>
                    <span className="metric-val">
                      {assessment.zone.demoProfile.rainfall7Day}
                    </span>
                  </div>
                </div>
              </div>

              {/* Disclaimer */}
              <div className="public-disclaimer">
                <span className="public-disclaimer-icon" aria-hidden="true">ℹ️</span>
                <p>
                  Assessment based on nearest monitored reference zone.
                  Exact-location measurements are not taken — this is a
                  demo/proximity-based evaluation.
                </p>
              </div>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
