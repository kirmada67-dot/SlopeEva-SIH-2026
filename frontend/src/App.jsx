import React, { useState, useCallback } from 'react';
import MapComponent from './components/MapComponent.jsx';
import CellInputPanel from './components/CellInputPanel.jsx';
import { DEFAULT_FEATURE_MEDIANS } from './constants/featureDefaults';
import './App.css';

function App() {
  const [isGridMode, setIsGridMode] = useState(false);
  const [gridCells, setGridCells] = useState([]);
  const [selectedCellId, setSelectedCellId] = useState(null);
  // Store input features independently for each cell: { [cellId]: { ...features } }
  const [cellInputs, setCellInputs] = useState({});

  const handleToggleGridMode = () => {
    setIsGridMode((prev) => !prev);
  };

  const handleGridCreated = useCallback((cells) => {
    setGridCells(cells);
    setIsGridMode(false); // Automatically disable grid creation mode after creation
    setSelectedCellId(null);
  }, []);

  const handleSelectCell = useCallback((cellId) => {
    setSelectedCellId((prev) => {
      const nextCellId = prev === cellId ? null : cellId;
      // If selecting a new cell that doesn't have initialized inputs yet, initialize it with medians
      if (nextCellId) {
        setCellInputs((currentInputs) => {
          if (!currentInputs[nextCellId]) {
            return {
              ...currentInputs,
              [nextCellId]: { ...DEFAULT_FEATURE_MEDIANS },
            };
          }
          return currentInputs;
        });
      }
      return nextCellId;
    });
  }, []);

  const handleFeatureChange = useCallback((cellId, key, value) => {
    setCellInputs((prev) => {
      const currentCellValues = prev[cellId] || { ...DEFAULT_FEATURE_MEDIANS };
      return {
        ...prev,
        [cellId]: {
          ...currentCellValues,
          [key]: value,
        },
      };
    });
  }, []);

  return (
    <div className="app-container">
      <header className="app-header">
        <div>
          <h1>Slope-EVA</h1>
          <p>AI-Powered Landslide Risk Evaluation Platform</p>
        </div>
        {selectedCellId && (
          <div className="selected-cell-badge">
            Selected: <strong>{selectedCellId}</strong>
          </div>
        )}
      </header>

      {/* Control panel directly above the map */}
      <section className="controls-panel">
        <button
          className={`control-btn ${isGridMode ? 'active' : ''}`}
          type="button"
          onClick={handleToggleGridMode}
          id="create-grid-btn"
        >
          {isGridMode ? 'Cancel Grid Mode' : 'Create Grid'}
        </button>

        <div className="control-status">
          {isGridMode ? (
            <span className="status-text active">
              🎯 <strong>Grid Mode Active:</strong> Click anywhere on the map to set the center of the 3x3 grid (~1 km² cells).
            </span>
          ) : gridCells.length > 0 ? (
            <span className="status-text ready">
              ✓ 3x3 Grid created ({gridCells.length} cells). Click any cell to select it.
            </span>
          ) : (
            <span className="status-text idle">
              Click &quot;Create Grid&quot; and then click on the map to place a 3x3 spatial evaluation grid.
            </span>
          )}
        </div>
      </section>

      {/* Main Workspace: Left Map, Right Cell Input Panel */}
      <div className="workspace-layout">
        <main className="map-section">
          <MapComponent
            isGridMode={isGridMode}
            onGridCreated={handleGridCreated}
            gridCells={gridCells}
            selectedCellId={selectedCellId}
            onSelectCell={handleSelectCell}
          />
        </main>

        <CellInputPanel
          selectedCellId={selectedCellId}
          cellValues={selectedCellId ? cellInputs[selectedCellId] : null}
          onFeatureChange={handleFeatureChange}
        />
      </div>
    </div>
  );
}

export default App;
