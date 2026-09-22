import React, { useState, useCallback } from 'react';
import MapComponent from './components/MapComponent.jsx';
import RegionInputPanel from './components/RegionInputPanel.jsx';
import { DEFAULT_FEATURE_MEDIANS } from './constants/featureDefaults';
import { predictLandslide, fetchRiskyRoads } from './services/api';
import './App.css';

// Grid size options: dimensions × dimensions of 1 km² regions
const GRID_SIZE_OPTIONS = [
  { value: 1, label: '1 × 1' },
  { value: 2, label: '2 × 2' },
  { value: 3, label: '3 × 3' },
];

function App() {
  const [isGridMode, setIsGridMode] = useState(false);
  const [gridSize, setGridSize] = useState(3); // default 3×3
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

  const handleToggleGridMode = () => {
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

  const hasGrid = gridRegions.length > 0;

  return (
    <div className="app-container">
      <header className="app-header">
        <div>
          <h1>Slope-EVA</h1>
          <p>AI-Powered Landslide Risk Evaluation Platform</p>
        </div>
        {selectedRegionId && (
          <div className="selected-region-badge">
            Selected: <strong>{selectedRegionId}</strong>
          </div>
        )}
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
        // Derive a deduplicated list of road names from the GeoJSON features
        const seen = new Set();
        const routeNames = [];
        (riskyRoadsGeoJSON.features || []).forEach((feature) => {
          const { name, ref } = feature.properties || {};
          const label = name || ref || 'Unnamed road segment';
          if (!seen.has(label)) {
            seen.add(label);
            routeNames.push(label);
          }
        });

        return (
          <div className="risk-routes-panel">
            <h4 className="risk-routes-title">⚠️ Risk-Affected Routes</h4>
            {routeNames.length > 0 ? (
              <ul className="risk-routes-list">
                {routeNames.map((name) => (
                  <li key={name} className="risk-routes-item">{name}</li>
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
