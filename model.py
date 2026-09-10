#!/usr/bin/env python3
import pandas as pd
#from sklearn.ensemble import RandomForestClassifier
#from sklearn.linear_model import LogisticRegression
#from sklearn.model_selection import train_test_split
import matplotlib.pyplot as plt
import seaborn as sns
import numpy as np

df = pd.read_csv("src/landslide_demo_v1.csv")

#print(df.head(), "\n",df.describe(), "\n",df.info(), "\n",df.shape)

top_features = [
    "Rainfall_24h_mm",
    "Slope_Angle_deg",
    "Rainfall_3Day_mm",
    "Soil_Erosion_Rate_t_ha_yr"
]

fig, axes = plt.subplots(2, 2, figsize=(12, 9))

for ax, feature in zip(axes.flat, top_features):
    sns.violinplot(
        x="Landslide",
        y=feature,
        data=df,
        ax=ax
    )
    ax.set_title(f"{feature} vs Landslide")

plt.tight_layout()
plt.show()
