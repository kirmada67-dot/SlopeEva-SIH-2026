import React, { useState, useCallback } from 'react';
import MapComponent from './components/MapComponent.jsx';
import RegionInputPanel from './components/RegionInputPanel.jsx';
import { DEFAULT_FEATURE_MEDIANS } from './constants/featureDefaults';
import { predictLandslide } from './services/api';
import './App.css';

function App() {
  const [isGridMode, setIsGridMode] = useState(false);
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

  const handlePredict = async (regionId) => {
    if (!regionId) return;

    setIsPredicting(true);
    setPredictionError(null);

    try {
      const currentValues = regionInputs[regionId] || DEFAULT_FEATURE_MEDIANS;
      const response = await predictLandslide(currentValues);

      setRegionPredictions((prev) => ({
        ...prev,
        [regionId]: response,
      }));
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
              🎯 <strong>Grid Mode Active:</strong> Click anywhere on the map to set the center of the 3x3 grid (~1 km² regions).
            </span>
          ) : hasGrid ? (
            <span className="status-text ready">
              ✓ 3x3 Grid active ({gridRegions.length} regions). Click any region (R1–R9) to view details and evaluate risk.
            </span>
          ) : (
            <span className="status-text idle">
              Click &quot;Create Grid&quot; and then click on the map to place a 3x3 spatial evaluation grid.
            </span>
          )}
        </div>
      </section>

      {/* Main Workspace: Left Map, Right Region Input Panel */}
      <div className="workspace-layout">
        <main className="map-section">
          <MapComponent
            isGridMode={isGridMode}
            onGridCreated={handleGridCreated}
            gridRegions={gridRegions}
            selectedRegionId={selectedRegionId}
            onSelectRegion={handleSelectRegion}
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

      {/* Remove Grid Confirmation Modal */}
      {showRemoveModal && (
        <div className="modal-backdrop" role="dialog" aria-modal="true">
          <div className="modal-card">
            <div className="modal-icon">⚠️</div>
            <h3>Remove current grid?</h3>
            <p>This will remove all 9 regions and their entered data.</p>
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
