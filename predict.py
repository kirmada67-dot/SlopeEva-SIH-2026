#!/usr/bin/env python3
import joblib as jb

model = jb.load("models/baseline_rf/landslide_baseline_rf.pkl")
FEATURE_ORDER = jb.load("models/baseline_rf/landslide_features.pkl")
RISK_BOUNDARIES = jb.load("models/baseline_rf/risk_boundaries_baseline_rf.pkl")

def predict_landslide(input_data):
	input_data = input_data[FEATURE_ORDER]
	prob = model.predict_proba(input_data)[0, 1]
	return prob

def classify_landslide(prob, risk_boundaries):
	if risk_boundaries["Low"] > prob:
		return "Low"
	elif risk_boundaries["Moderate"] > prob:
		return "Moderate"
	elif risk_boundaries["High"] > prob:
		return "High"
	else:
		return "Critical"
