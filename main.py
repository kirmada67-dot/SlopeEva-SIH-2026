#!/usr/bin/env python3

import pandas as pn
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report, confusion_matrix


df = pn.read_csv("src/landslide_demo_v1.csv")
x = df.drop("Landslide", axis=1)
y = df["Landslide"]

train_x, test_x, train_y, test_y = train_test_split(x, y, test_size=0.2, random_state=42, stratify=y)

model = RandomForestClassifier(n_estimators=100, random_state=42)
model.fit(train_x, train_y)

pred = model.predict_proba(test_x)[:, 1]

#print(classification_report(test_y, pred))
#print(confusion_matrix(test_y, pred))

#print(model.score(test_x, test_y))
print(pred[:20])
