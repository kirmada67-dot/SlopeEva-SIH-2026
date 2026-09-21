import os
import sys
from pathlib import Path

# Ensure project root is in sys.path and current working directory is project root
ROOT_DIR = Path(__file__).resolve().parent.parent
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))
os.chdir(ROOT_DIR)

import pandas as pd
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

# Import existing prediction functions directly from predict.py without modifications
from predict import predict_landslide, classify_landslide, RISK_BOUNDARIES

app = FastAPI(title="Slope-EVA API", version="1.0.0")

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
