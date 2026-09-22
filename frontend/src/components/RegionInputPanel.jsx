import React, { useState } from 'react';
import {
  PRIMARY_FEATURES,
  ADVANCED_FEATURES,
  DEFAULT_FEATURE_MEDIANS,
} from '../constants/featureDefaults';

export default function RegionInputPanel({
  selectedRegionId,
  regionValues,
  prediction,
  isLoading,
  errorMessage,
  onFeatureChange,
  onPredict,
}) {
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);

  if (!selectedRegionId) {
    return (
      <aside className="region-panel empty-panel">
        <div className="empty-panel-content">
          <div className="empty-panel-icon">🗺️</div>
          <h3>No Region Selected</h3>
          <p>Select a region on the map to enter environmental data.</p>
        </div>
      </aside>
    );
  }

  // Get current region's feature values or fallback to medians
  const currentValues = regionValues || DEFAULT_FEATURE_MEDIANS;

  const handleInputChange = (key, valueStr) => {
    const num = valueStr === '' ? '' : parseFloat(valueStr);
    onFeatureChange(selectedRegionId, key, isNaN(num) ? valueStr : num);
  };

  const getRiskBadgeClass = (risk) => {
    switch (risk?.toLowerCase()) {
      case 'low':
        return 'risk-badge risk-low';
      case 'moderate':
        return 'risk-badge risk-moderate';
      case 'high':
        return 'risk-badge risk-high';
      case 'critical':
        return 'risk-badge risk-critical';
      default:
        return 'risk-badge';
    }
  };

  const probabilityPercent =
    prediction && prediction.probability !== undefined
      ? Math.round(prediction.probability * 100)
      : null;

  return (
    <aside className="region-panel">
      <div className="region-panel-header">
        <div>
          <span className="panel-subtitle">Region Details</span>
          <h2>{selectedRegionId}</h2>
        </div>
        <span className="region-active-tag">Selected</span>
      </div>

      <div className="region-panel-body">
        {/* Prediction Results Banner if evaluated */}
        {prediction && (
          <div className="prediction-results-card">
            <div className="prediction-header">
              <span className="prediction-title">Risk Assessment</span>
              <span className={getRiskBadgeClass(prediction.risk)}>
                {prediction.risk} Risk
              </span>
            </div>
            <div className="prediction-metric">
              <span className="metric-label">Landslide Probability:</span>
              <span className="metric-value">{probabilityPercent}%</span>
            </div>
            <div className="probability-bar-bg">
              <div
                className={`probability-bar-fill ${prediction.risk?.toLowerCase()}`}
                style={{ width: `${Math.min(Math.max(probabilityPercent, 2), 100)}%` }}
              />
            </div>
          </div>
        )}

        {/* Error message banner */}
        {errorMessage && (
          <div className="prediction-error-banner">
            ⚠️ <strong>Error:</strong> {errorMessage}
          </div>
        )}

        {/* Predict Action Button */}
        <div className="predict-action-section">
          <button
            type="button"
            className="predict-btn"
            onClick={() => onPredict(selectedRegionId)}
            disabled={isLoading}
            id="predict-risk-btn"
          >
            {isLoading ? (
              <span className="btn-loading-state">
                <span className="spinner" /> Evaluating Risk...
              </span>
            ) : (
              <span>⚡ Predict Risk</span>
            )}
          </button>
        </div>

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
