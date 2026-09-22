import React, { useState } from 'react';
import {
  PRIMARY_FEATURES,
  ADVANCED_FEATURES,
  DEFAULT_FEATURE_MEDIANS,
} from '../constants/featureDefaults';

export default function CellInputPanel({
  selectedCellId,
  cellValues,
  onFeatureChange,
}) {
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);

  if (!selectedCellId) {
    return (
      <aside className="cell-panel empty-panel">
        <div className="empty-panel-content">
          <div className="empty-panel-icon">🗺️</div>
          <h3>No Cell Selected</h3>
          <p>Select a grid cell on the map to enter environmental data.</p>
        </div>
      </aside>
    );
  }

  // Get current cell's feature values or fallback to medians
  const currentValues = cellValues || DEFAULT_FEATURE_MEDIANS;

  const handleInputChange = (key, valueStr) => {
    const num = valueStr === '' ? '' : parseFloat(valueStr);
    onFeatureChange(selectedCellId, key, isNaN(num) ? valueStr : num);
  };

  return (
    <aside className="cell-panel">
      <div className="cell-panel-header">
        <div>
          <span className="panel-subtitle">Environmental Parameters</span>
          <h2>{selectedCellId}</h2>
        </div>
        <span className="cell-active-tag">Active</span>
      </div>

      <div className="cell-panel-body">
        {/* Primary 5 Features */}
        <div className="feature-group">
          <h4 className="group-title">Primary Parameters</h4>
          <div className="input-grid">
            {PRIMARY_FEATURES.map(({ key, label, step }) => (
              <div key={key} className="input-field">
                <label htmlFor={`input-${key}`}>{label}</label>
                <input
                  id={`input-${key}`}
                  type="number"
                  step={step}
                  value={currentValues[key] !== undefined ? currentValues[key] : ''}
                  onChange={(e) => handleInputChange(key, e.target.value)}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Advanced Inputs Toggle */}
        <div className="advanced-toggle-wrapper">
          <button
            type="button"
            className="advanced-toggle-btn"
            onClick={() => setIsAdvancedOpen((prev) => !prev)}
            aria-expanded={isAdvancedOpen}
          >
            <span>{isAdvancedOpen ? '▲ Hide Advanced Inputs' : '▼ Advanced Inputs (15 features)'}</span>
          </button>
        </div>

        {/* 15 Advanced Features (Expanded) */}
        {isAdvancedOpen && (
          <div className="feature-group advanced-group">
            <h4 className="group-title">Advanced Geo & Soil Parameters</h4>
            <div className="input-grid">
              {ADVANCED_FEATURES.map(({ key, label, step }) => (
                <div key={key} className="input-field">
                  <label htmlFor={`input-${key}`}>{label}</label>
                  <input
                    id={`input-${key}`}
                    type="number"
                    step={step}
                    value={currentValues[key] !== undefined ? currentValues[key] : ''}
                    onChange={(e) => handleInputChange(key, e.target.value)}
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
