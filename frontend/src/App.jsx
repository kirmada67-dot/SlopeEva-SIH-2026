import React, { useState, useCallback, useMemo } from 'react';
import MapComponent from './components/MapComponent.jsx';
import RegionInputPanel from './components/RegionInputPanel.jsx';
import HomeScreen from './components/HomeScreen.jsx';
import PublicDashboard from './components/PublicDashboard.jsx';
import { DEFAULT_FEATURE_MEDIANS } from './constants/featureDefaults';
import { predictLandslide, fetchRiskyRoads } from './services/api';
import slopeEvaLogo from './assets/slopeeva-icon-accent.png';
import './App.css';

// Grid size options: dimensions × dimensions of 1 km² regions
const GRID_SIZE_OPTIONS = [
  { value: 1, label: '1 × 1' },
  { value: 2, label: '2 × 2' },
  { value: 3, label: '3 × 3' },
];

// Stable palette for road identity coloring — ordered for visual variety
const ROAD_PALETTE = [
  '#3b82f6', // blue
  '#8b5cf6', // purple
  '#ec4899', // pink
  '#14b8a6', // teal
  '#f59e0b', // amber
  '#6366f1', // indigo
  '#84cc16', // lime
  '#06b6d4', // cyan
  '#f43f5e', // rose
  '#a855f7', // violet
];

export const UNREFERENCED_COLOR_KEY = 'unreferenced';
export const UNREFERENCED_FALLBACK_COLOR = '#94a3b8'; // Slate gray

/**
 * Returns a unique color/group identity key with prefix to avoid collisions:
 * 1. `ref:<ref>` when ref is non-empty
 * 2. `name:<name>` when name is non-empty (and no ref)
 * 3. `unreferenced` when both ref and name are missing
 */
export function getRoadColorKey(properties) {
  const props = properties || {};
  const trimmedRef = props.ref ? String(props.ref).trim() : '';
  const trimmedName = props.name ? String(props.name).trim() : '';

  if (trimmedRef) {
    return `ref:${trimmedRef}`;
  }
  if (trimmedName) {
    return `name:${trimmedName}`;
  }
  return UNREFERENCED_COLOR_KEY;
}

/**
 * Build a deterministic roadColorMap from GeoJSON features.
 * - Distinct color from ROAD_PALETTE for each `ref:<ref>`
 * - Distinct color from ROAD_PALETTE for each `name:<name>` (no ref)
 * - Single shared UNREFERENCED_FALLBACK_COLOR for `unreferenced`
 */
function buildRoadColorMap(features) {
  const map = {
    [UNREFERENCED_COLOR_KEY]: UNREFERENCED_FALLBACK_COLOR,
  };
  let idx = 0;
  for (const f of (features || [])) {
    const key = getRoadColorKey(f.properties);
    if (key !== UNREFERENCED_COLOR_KEY && !(key in map)) {
      map[key] = ROAD_PALETTE[idx % ROAD_PALETTE.length];
      idx++;
    }
  }
  return map;
}

function App() {
  // ── View routing: 'home' | 'public' | 'officials' ───────────────────────
  const [view, setView] = useState('home');

  // ── Officials dashboard state (unchanged) ────────────────────────────────
  const [isGridMode, setIsGridMode] = useState(false);
  const [gridSize, setGridSize] = useState(1); // default 1×1
  const [gridRegions, setGridRegions] = useState([]);
  const [selectedRegionId, setSelectedRegionId] = useState(null);

  // Store input features independently for each region: { [regionId]: { ...features } }
  const [regionInputs, setRegionInputs] = useState({});

  // Store prediction results independently for each region: { [regionId]: { probability, risk } }
  const [regionPredictions, setRegionPredictions] = useState({});

  // Modal & API State
  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const [isPredicting, setIsPredicting] = useState(false);
  const [predictionError, setPredictionError] = useState(null);

  // Risky roads GeoJSON overlay – updated whenever any prediction changes
  const [riskyRoadsGeoJSON, setRiskyRoadsGeoJSON] = useState(null);
  const [roadsError, setRoadsError] = useState(null);
  const [isFetchingRoads, setIsFetchingRoads] = useState(false);

  // Deterministic road identity → color map derived from current road GeoJSON.
  // Single source of truth shared between MapComponent and the route panel.
  const refColorMap = useMemo(
    () => buildRoadColorMap(riskyRoadsGeoJSON?.features),
    [riskyRoadsGeoJSON]
  );

  const hasGrid = gridRegions.length > 0;

  const handleToggleGridMode = () => {
    if (hasGrid) return;
    setIsGridMode((prev) => !prev);
  };

  const handleGridCreated = useCallback((regions) => {
    setGridRegions(regions);
    setIsGridMode(false); // Automatically disable grid creation mode after creation
    setSelectedRegionId(null);
  }, []);

  const handleSelectRegion = useCallback((regionId) => {
    setSelectedRegionId((prev) => {
      const nextRegionId = prev === regionId ? null : regionId;
      // If selecting a new region that doesn't have initialized inputs yet, initialize it with medians
      if (nextRegionId) {
        setRegionInputs((currentInputs) => {
          if (!currentInputs[nextRegionId]) {
            return {
              ...currentInputs,
              [nextRegionId]: { ...DEFAULT_FEATURE_MEDIANS },
            };
          }
          return currentInputs;
        });
      }
      return nextRegionId;
    });
    setPredictionError(null);
  }, []);

  const handleFeatureChange = useCallback((regionId, key, value) => {
    setRegionInputs((prev) => {
      const currentValues = prev[regionId] || { ...DEFAULT_FEATURE_MEDIANS };
      return {
        ...prev,
        [regionId]: {
          ...currentValues,
          [key]: value,
        },
      };
    });

    // Invalidate / clear previous prediction for this region if an input is edited
    setRegionPredictions((prev) => {
      if (prev[regionId]) {
        const updated = { ...prev };
        delete updated[regionId];
        return updated;
      }
      return prev;
    });

    setPredictionError(null);
  }, []);

  // Helper: rebuild the roads overlay based on the current grid + prediction state
  const refreshRoadsOverlay = useCallback(async (regions, predictions) => {
    if (!regions || regions.length === 0) {
      setRiskyRoadsGeoJSON(null);
      return;
    }

    // Only call /roads if at least one region has been evaluated
    const evaluatedRegions = regions
      .filter((r) => predictions[r.id])
      .map((r) => ({
        region_id: r.id,
        risk: predictions[r.id].risk,
        south: r.south,
        north: r.north,
        west: r.west,
        east: r.east,
      }));

    if (evaluatedRegions.length === 0) {
      setRiskyRoadsGeoJSON(null);
      return;
    }

    setIsFetchingRoads(true);
    setRoadsError(null);
    try {
      const geojson = await fetchRiskyRoads(evaluatedRegions);
      setRiskyRoadsGeoJSON(geojson);
    } catch (err) {
      setRoadsError(err.message || 'Road data fetch failed.');
      setRiskyRoadsGeoJSON(null);
    } finally {
      setIsFetchingRoads(false);
    }
  }, []);

  const handlePredict = async (regionId) => {
    if (!regionId) return;

    setIsPredicting(true);
    setPredictionError(null);

    try {
      const currentValues = regionInputs[regionId] || DEFAULT_FEATURE_MEDIANS;
      const response = await predictLandslide(currentValues);

      const updatedPredictions = { ...regionPredictions, [regionId]: response };
      setRegionPredictions(updatedPredictions);

      // Road evaluation is strictly conditional on the CURRENT prediction being High or Critical
      const currentRisk = response?.risk?.toLowerCase();
      if (currentRisk === 'high' || currentRisk === 'critical') {
        await refreshRoadsOverlay(gridRegions, updatedPredictions);
      }
    } catch (err) {
      setPredictionError(err.message || 'Failed to predict landslide risk.');
    } finally {
      setIsPredicting(false);
    }
  };

  // Remove Grid Modal Handlers
  const handleOpenRemoveModal = () => {
    if (gridRegions.length > 0) {
      setShowRemoveModal(true);
    }
  };

  const handleCancelRemove = () => {
    setShowRemoveModal(false);
  };

  const handleConfirmRemove = () => {
    setGridRegions([]);
    setSelectedRegionId(null);
    setRegionInputs({});
    setRegionPredictions({});
    setIsGridMode(false);
    setShowRemoveModal(false);
    setPredictionError(null);
    setRiskyRoadsGeoJSON(null);  // Clear road overlay
    setRoadsError(null);
  };

  // ── View rendering ────────────────────────────────────────────────────────

  if (view === 'home') {
    return <HomeScreen onNavigate={setView} />;
  }

  if (view === 'public') {
    return <PublicDashboard onReturnHome={() => setView('home')} />;
  }

  // view === 'officials' — the entire existing Officials dashboard, preserved exactly.
  return (
    <div className="app-container">
      <header className="app-header">
        <div className="app-header-brand">
          <img
            src={slopeEvaLogo}
            alt="SlopeEva Logo"
            className="app-header-logo"
          />
          <div>
            <h1>SlopeEva</h1>
            <p>AI-Powered Landslide Risk Evaluation Platform — Officials Dashboard</p>
          </div>
        </div>
        <div className="app-header-right">
          {selectedRegionId && (
            <div className="selected-region-badge">
              Selected: <strong>{selectedRegionId}</strong>
            </div>
          )}
          <button
            className="return-home-btn"
            type="button"
            onClick={() => setView('home')}
            id="officials-return-home-btn"
          >
            ← Return Home
          </button>
        </div>
      </header>

      {/* Control panel directly above the map */}
      <section className="controls-panel">
        <div className="grid-action-buttons">
          {/* Grid Size Selector */}
          <div className="grid-size-selector">
            <label htmlFor="grid-size-select" className="grid-size-label">
              Grid Size
            </label>
            <select
              id="grid-size-select"
              className="grid-size-select"
              value={gridSize}
              onChange={(e) => setGridSize(Number(e.target.value))}
              disabled={hasGrid}
              title={hasGrid ? 'Remove the current grid to change grid size' : 'Select grid size'}
            >
              {GRID_SIZE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <button
            className={`control-btn ${isGridMode ? 'active' : ''}`}
            type="button"
            onClick={handleToggleGridMode}
            disabled={hasGrid}
            title={hasGrid ? 'Remove the current grid before creating a new one' : undefined}
            id="create-grid-btn"
          >
            {isGridMode ? 'Cancel Grid Mode' : 'Create Grid'}
          </button>

          <button
            className="control-btn btn-danger"
            type="button"
            onClick={handleOpenRemoveModal}
            disabled={!hasGrid}
            id="remove-grid-btn"
          >
            Remove Grid
          </button>
        </div>

        <div className="control-status">
          {isGridMode ? (
            <span className="status-text active">
              🎯 <strong>Grid Mode Active:</strong> Click anywhere on the map to set the center of the {gridSize}×{gridSize} grid (~1 km² regions).
            </span>
          ) : hasGrid ? (
            <span className="status-text ready">
              ✓ {gridSize}×{gridSize} Grid active ({gridRegions.length} region{gridRegions.length !== 1 ? 's' : ''}). Click any region to view details and evaluate risk.
            </span>
          ) : (
            <span className="status-text idle">
              Select a grid size, click &quot;Create Grid&quot;, then click on the map to place the spatial evaluation grid.
            </span>
          )}
        </div>
      </section>

      {/* Main Workspace: Left Map, Right Region Input Panel */}
      <div className="workspace-layout">
        <main className="map-section">
          <MapComponent
            isGridMode={isGridMode}
            gridSize={gridSize}
            onGridCreated={handleGridCreated}
            gridRegions={gridRegions}
            selectedRegionId={selectedRegionId}
            onSelectRegion={handleSelectRegion}
            riskyRoadsGeoJSON={riskyRoadsGeoJSON}
            regionPredictions={regionPredictions}
            refColorMap={refColorMap}
          />
        </main>

        <RegionInputPanel
          selectedRegionId={selectedRegionId}
          regionValues={selectedRegionId ? regionInputs[selectedRegionId] : null}
          prediction={selectedRegionId ? regionPredictions[selectedRegionId] : null}
          isLoading={isPredicting}
          errorMessage={predictionError}
          onFeatureChange={handleFeatureChange}
          onPredict={handlePredict}
        />
      </div>

      {/* Road Overlay Status */}
      {(isFetchingRoads || roadsError) && (
        <div className={`roads-status-bar ${roadsError ? 'roads-error' : 'roads-loading'}`}>
          {isFetchingRoads && !roadsError && (
            <span><span className="spinner" /> Fetching road data from OpenStreetMap...</span>
          )}
          {roadsError && (
            <span>⚠️ Road overlay: {roadsError}</span>
          )}
        </div>
      )}

      {/* Risk-Affected Routes List — shown after road evaluation completes */}
      {!isFetchingRoads && !roadsError && riskyRoadsGeoJSON && (() => {
        // 1. Group referenced roads (ref:XXX) and named unreferenced roads (name:YYY)
        // 2. Consolidate nameless unreferenced roads into single 'unreferenced' entry
        const groupMap = new Map();
        let hasNamelessUnrefRoads = false;

        (riskyRoadsGeoJSON.features || []).forEach((feature) => {
          const props = feature.properties || {};
          const trimmedRef = props.ref ? String(props.ref).trim() : '';
          const trimmedName = props.name ? String(props.name).trim() : '';
          const key = getRoadColorKey(props);

          if (key === UNREFERENCED_COLOR_KEY) {
            hasNamelessUnrefRoads = true;
          } else if (trimmedRef) {
            // 1. ref:XXX entry
            if (!groupMap.has(key)) {
              groupMap.set(key, {
                colorKey: key,
                name: trimmedName,
                ref: trimmedRef,
                color: refColorMap[key] || ROAD_PALETTE[0],
              });
            } else {
              const entry = groupMap.get(key);
              if (!entry.name && trimmedName) {
                entry.name = trimmedName;
              }
            }
          } else {
            // 2. name:YYY entry (no ref)
            if (!groupMap.has(key)) {
              groupMap.set(key, {
                colorKey: key,
                name: trimmedName,
                ref: '',
                color: refColorMap[key] || ROAD_PALETTE[0],
              });
            }
          }
        });

        const routeEntries = Array.from(groupMap.values()).map((entry) => ({
          colorKey: entry.colorKey,
          displayName: entry.name || entry.ref,
          color: entry.color,
        }));

        // 3. Nameless unreferenced roads
        if (hasNamelessUnrefRoads) {
          routeEntries.push({
            colorKey: UNREFERENCED_COLOR_KEY,
            displayName: 'Unreferenced / Local Roads',
            color: refColorMap[UNREFERENCED_COLOR_KEY] || UNREFERENCED_FALLBACK_COLOR,
          });
        }

        return (
          <div className="risk-routes-panel">
            <h4 className="risk-routes-title">⚠️ Risk-Affected Routes</h4>
            {routeEntries.length > 0 ? (
              <ul className="risk-routes-list">
                {routeEntries.map(({ colorKey, displayName, color }) => (
                  <li key={colorKey} className="risk-routes-item">
                    <span
                      className="route-color-swatch"
                      style={{ backgroundColor: color }}
                      aria-hidden="true"
                    />
                    {displayName}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="risk-routes-empty">No risk-affected routes identified</p>
            )}
          </div>
        );
      })()}

      {/* Remove Grid Confirmation Modal */}
      {showRemoveModal && (
        <div className="modal-backdrop" role="dialog" aria-modal="true">
          <div className="modal-card">
            <div className="modal-icon">⚠️</div>
            <h3>Remove current grid?</h3>
            <p>This will remove all {gridRegions.length} region{gridRegions.length !== 1 ? 's' : ''} and their entered data.</p>
            <div className="modal-actions">
              <button
                type="button"
                className="modal-btn btn-secondary"
                onClick={handleCancelRemove}
                id="modal-cancel-btn"
              >
                Cancel
              </button>
              <button
                type="button"
                className="modal-btn btn-danger"
                onClick={handleConfirmRemove}
                id="modal-confirm-remove-btn"
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
