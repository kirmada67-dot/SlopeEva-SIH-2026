import React from 'react';
import slopeEvaLogo from '../assets/slopeeva-icon-accent.png';

export default function HomeScreen({ onNavigate }) {
  return (
    <div className="home-screen">
      {/* Hero Header */}
      <header className="home-hero">
        <div className="home-hero-glow" aria-hidden="true" />
        <div className="home-logo-wrapper">
          <img
            src={slopeEvaLogo}
            alt="SlopeEva Logo"
            className="home-logo-icon"
          />
        </div>
        <h1 className="home-title">SlopeEva</h1>
        <p className="home-subtitle">AI-Powered Landslide Risk Evaluation Platform</p>
        <div className="home-region-tag">
          <span className="home-region-dot" aria-hidden="true" />
          Sohra · Cherrapunji, Meghalaya · North-East India
        </div>
      </header>

      {/* Navigation Cards */}
      <main className="home-cards-section" aria-label="Dashboard selection">
        <p className="home-cards-label">Select your dashboard to continue</p>
        <div className="home-cards-grid">
          {/* Public Dashboard Card */}
          <button
            className="home-nav-card home-nav-card--public"
            onClick={() => onNavigate('public')}
            id="home-public-btn"
            aria-label="Open Public Dashboard"
          >
            <div className="home-card-icon-wrap home-card-icon-wrap--public">
              <svg viewBox="0 0 32 32" fill="none" aria-hidden="true" width="32" height="32">
                <circle cx="16" cy="16" r="13" stroke="currentColor" strokeWidth="2" />
                <path
                  d="M3 16 Q8 10 16 16 Q24 22 29 16"
                  stroke="currentColor"
                  strokeWidth="1.75"
                  fill="none"
                  strokeLinecap="round"
                />
                <line x1="16" y1="3" x2="16" y2="29" stroke="currentColor" strokeWidth="1.5" strokeDasharray="2 2" />
              </svg>
            </div>
            <div className="home-card-body">
              <span className="home-card-tag">Public Access</span>
              <h2 className="home-card-title">Public Dashboard</h2>
              <p className="home-card-desc">
                View the Sohra landslide risk map. Select any location to
                receive a risk assessment based on the nearest monitored zone.
              </p>
              <ul className="home-card-features">
                <li>🗺️ Interactive Sohra risk map</li>
                <li>📍 10 monitored reference zones</li>
                <li>🎯 Location risk lookup</li>
              </ul>
            </div>
            <div className="home-card-arrow" aria-hidden="true">→</div>
          </button>

          {/* Officials Dashboard Card */}
          <button
            className="home-nav-card home-nav-card--officials"
            onClick={() => onNavigate('officials')}
            id="home-officials-btn"
            aria-label="Open Officials Dashboard"
          >
            <div className="home-card-icon-wrap home-card-icon-wrap--officials">
              <svg viewBox="0 0 32 32" fill="none" aria-hidden="true" width="32" height="32">
                <rect x="3" y="5" width="26" height="22" rx="2" stroke="currentColor" strokeWidth="2" />
                <line x1="3" y1="11" x2="29" y2="11" stroke="currentColor" strokeWidth="1.5" />
                <rect x="7" y="15" width="5" height="4" rx="1" fill="currentColor" opacity="0.6" />
                <rect x="14" y="15" width="5" height="8" rx="1" fill="currentColor" opacity="0.8" />
                <rect x="21" y="13" width="5" height="10" rx="1" fill="currentColor" />
              </svg>
            </div>
            <div className="home-card-body">
              <span className="home-card-tag home-card-tag--officials">Officials Only</span>
              <h2 className="home-card-title">Officials Dashboard</h2>
              <p className="home-card-desc">
                Full analytical platform. Configure evaluation grids, input
                environmental parameters, run ML predictions and evaluate
                high-risk road infrastructure.
              </p>
              <ul className="home-card-features">
                <li>⚡ ML-powered risk prediction</li>
                <li>🏗️ Custom spatial grid creation</li>
                <li>🛣️ Risk-affected road evaluation</li>
                <li>📊 Advanced geo &amp; soil parameters</li>
              </ul>
            </div>
            <div className="home-card-arrow" aria-hidden="true">→</div>
          </button>
        </div>
      </main>

      {/* Footer */}
      <footer className="home-footer">
        <span>SlopeEva · SIH 2026 · Sohra Landslide Risk Demonstration System</span>
      </footer>
    </div>
  );
}
