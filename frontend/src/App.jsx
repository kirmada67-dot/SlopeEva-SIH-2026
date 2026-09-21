import React from 'react';
import './App.css';

function App() {
  return (
    <div className="app-container">
      <header className="app-header">
        <div>
          <h1>Slope-EVA</h1>
          <p>AI-Powered Landslide Risk Evaluation Platform</p>
        </div>
      </header>

      <section className="controls-panel">
        <button className="control-btn" type="button">
          Create Grid
        </button>
        <span className="control-hint">
          Grid creation and regional risk calculation controls will be configured here.
        </span>
      </section>

      <main className="map-placeholder">
        <h3>Interactive Map Placeholder</h3>
        <p>
          Spatial grid visualization, slope elevation models, and road network overlays will be rendered in this area.
        </p>
      </main>
    </div>
  );
}

export default App;
