#!/usr/bin/env python3
import pandas as pn
import joblib as jb

model = jb.load("models/baseline_rf/landslide_baseline_rf.pkl")
FEATURE_ORDER = jb.load("models/baseline_rf/landslide_features.pkl")
threshold = jb.load("models/baseline_rf/threshold_baseline_rf.pkl")

def predict_landslide(input_data):
	input_data = input_data[FEATURE_ORDER]
	prob = model.predict_proba(input_data)[0, 1]
	return prob

def classify_landsli8de(prob, threshold):
	

