const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';

export async function checkHealth() {
  const response = await fetch(`${API_BASE_URL}/health`);
  if (!response.ok) {
    throw new Error(`Health check failed: ${response.statusText}`);
  }
  return response.json();
}

export async function predictLandslide(features) {
  const response = await fetch(`${API_BASE_URL}/predict`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(features),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || `Prediction failed: ${response.statusText}`);
  }

  return response.json();
}

/**
 * regions: Array of { region_id, risk, south, north, west, east }
 * Returns a GeoJSON FeatureCollection of road segments passing through
 * High/Critical regions.
 */
export async function fetchRiskyRoads(regions) {
  const response = await fetch(`${API_BASE_URL}/roads`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ regions }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || `Road fetch failed: ${response.statusText}`);
  }

  return response.json();
}
