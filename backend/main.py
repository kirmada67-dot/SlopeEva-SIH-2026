import os
import sys
import json
from pathlib import Path
from typing import List

# Ensure project root is in sys.path and current working directory is project root
ROOT_DIR = Path(__file__).resolve().parent.parent
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))
os.chdir(ROOT_DIR)

import requests as http_requests
import pandas as pd
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from shapely.geometry import shape, box as shapely_box, mapping, LineString
from shapely.ops import unary_union

# Import existing prediction functions directly from predict.py without modifications
from predict import predict_landslide, classify_landslide, RISK_BOUNDARIES

OVERPASS_ENDPOINTS = [
    "https://overpass-api.de/api/interpreter",
    "https://overpass.kumi.systems/api/interpreter",
    "https://overpass.private.coffee/api/interpreter",
    "https://maps.mail.ru/osm/tools/overpass/api/interpreter",
]
OVERPASS_HEADERS = {
    "User-Agent": "Slope-EVA-Landslide-Demo/1.0 (contact: contact@slope-eva.internal)",
    "Accept": "application/json",
}
# Road types to query from OSM
ROAD_TAGS = (
    "motorway|trunk|primary|secondary|tertiary|"
    "unclassified|residential|service|track|path|footway"
)

app = FastAPI(title="SlopeEva API", version="1.0.0")

# CORS middleware for local frontend development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class LandslideFeatures(BaseModel):
    Rainfall_24h_mm: float
    Rainfall_3Day_mm: float
    Rainfall_7Day_mm: float
    Slope_Angle_deg: float
    Elevation_m: float
    Aspect_deg: float
    Soil_Saturation: float
    Vegetation_Cover: float
    NDVI_Index: float
    Distance_to_Water_m: float
    Distance_to_Road_m: float
    Temperature_C: float
    Humidity_percent: float
    Clay_Content_pct: float
    Sand_Content_pct: float
    Silt_Content_pct: float
    Soil_Erosion_Rate_t_ha_yr: float
    Pore_Water_Pressure_kPa: float
    Soil_Moisture_Content: float
    Earthquake_Activity: float


class PredictionResponse(BaseModel):
    probability: float
    risk: str


class RegionBBox(BaseModel):
    """Bounding box of a single evaluated region with its risk classification."""
    region_id: str
    risk: str          # Low | Moderate | High | Critical
    south: float
    north: float
    west: float
    east: float


class RoadsRequest(BaseModel):
    regions: List[RegionBBox]


def extract_linework(geom):
    """Extracts LineString or MultiLineString geometries from an intersection result."""
    if geom.is_empty:
        return None
    if geom.geom_type in ("LineString", "MultiLineString"):
        return geom
    if geom.geom_type == "GeometryCollection":
        lines = [g for g in geom.geoms if g.geom_type in ("LineString", "MultiLineString")]
        if not lines:
            return None
        return unary_union(lines)
    return None


@app.get("/health")
def health_check():
    return {"status": "ok"}


@app.post("/predict", response_model=PredictionResponse)
def predict(features: LandslideFeatures):
    try:
        # Convert request data into a one-row pandas DataFrame
        input_df = pd.DataFrame([features.model_dump()])
        prob = float(predict_landslide(input_df))
        risk = classify_landslide(prob, RISK_BOUNDARIES)
        return PredictionResponse(probability=round(prob, 4), risk=risk)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/roads")
def get_risky_roads(payload: RoadsRequest):
    """
    Accepts the evaluated 3x3 grid regions with their risk levels.
    Fetches roads from Overpass API for the full grid bbox,
    then spatially intersects them with High/Critical regions.
    Returns a GeoJSON FeatureCollection of matching road segments.
    """
    risky_regions = [
        r for r in payload.regions
        if r.risk.lower() in ("high", "critical")
    ]

    if not risky_regions:
        # No risky regions – return empty FeatureCollection
        return {"type": "FeatureCollection", "features": []}

    # Compute the bounding box that covers the entire grid
    all_regions = payload.regions
    min_south = min(r.south for r in all_regions)
    max_north = max(r.north for r in all_regions)
    min_west  = min(r.west  for r in all_regions)
    max_east  = max(r.east  for r in all_regions)

    # Build Shapely polygons for High/Critical regions
    risky_shapes = [
        shapely_box(r.west, r.south, r.east, r.north)
        for r in risky_regions
    ]
    risky_union = unary_union(risky_shapes)

    # Query Overpass for roads inside the grid bbox
    overpass_query = f"""
    [out:json][timeout:25];
    way[highway~"{ROAD_TAGS}"]
      ({min_south},{min_west},{max_north},{max_east});
    (._;>;);
    out body;
    """

    osm_data = None
    last_error = None
    for endpoint in OVERPASS_ENDPOINTS:
        try:
            resp = http_requests.get(
                endpoint,
                params={"data": overpass_query},
                headers=OVERPASS_HEADERS,
                timeout=20,
            )
            if resp.status_code == 200:
                osm_data = resp.json()
                break
            else:
                last_error = f"{endpoint} returned status {resp.status_code}"
        except Exception as e:
            last_error = str(e)
            continue

    if osm_data is None:
        raise HTTPException(
            status_code=502,
            detail=f"Failed to fetch OSM road data from Overpass mirrors. Last error: {last_error}"
        )

    # Build a node-id → (lon, lat) lookup
    node_coords = {}
    for element in osm_data.get("elements", []):
        if element["type"] == "node":
            node_coords[element["id"]] = (element["lon"], element["lat"])

    # Build GeoJSON features for roads that intersect risky regions
    features = []
    for element in osm_data.get("elements", []):
        if element["type"] != "way":
            continue
        node_ids = element.get("nodes", [])
        coords = [node_coords[nid] for nid in node_ids if nid in node_coords]
        if len(coords) < 2:
            continue

        road_line = LineString(coords)
        if not road_line.intersects(risky_union):
            continue

        # Clip the road line to the risky region(s)
        clipped = road_line.intersection(risky_union)
        linework = extract_linework(clipped)
        if linework is None or linework.is_empty:
            continue

        tags = element.get("tags", {})
        features.append({
            "type": "Feature",
            "geometry": mapping(linework),
            "properties": {
                "osm_id": element["id"],
                "highway": tags.get("highway", "unknown"),
                "name": tags.get("name", ""),
                "ref": tags.get("ref", ""),
            },
        })

    return {"type": "FeatureCollection", "features": features}
