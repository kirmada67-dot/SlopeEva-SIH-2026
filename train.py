#!/usr/bin/env python3
import pandas as pn
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report, confusion_matrix
import joblib as jb

df = pn.read_csv("src/landslide_demo_v1.csv")
x = df.drop("Landslide", axis=1)
y = df["Landslide"]
threshold = {"Low": 0.25, "Moderate": 0.50, "High": 0.75} #thresholds are defined manually for demo.

train_x, test_x, train_y, test_y = train_test_split(x, y, test_size=0.2, random_state=42, stratify=y)

model = RandomForestClassifier(n_estimators=100, random_state=42)
model.fit(train_x, train_y)

jb.dump(model, "models/baseline_rf/landslide_baseline_rf.pkl")
jb.dump(threshold, "models/baseline_rf/threshold_baseline_rf.pkl")
jb.dump(list(x.columns), "models/baseline_rf/landslide_features.pkl")

pred = model.predict(test_x)

print(classification_report(test_y, pred))
print(confusion_matrix(test_y, pred))

