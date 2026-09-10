#!/usr/bin/env python3
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
import numpy as np

df = pd.read_csv("../../src/landslide_demo_v1.csv")

print(df.shape)
df.head()
df.info()
df.describe()

sns.countplot(x="Landslide", data=df)

plt.title("Landslide Class Distribution")
plt.xlabel("Landslide")
plt.ylabel("Count")
plt.show()

df.hist(figsize=(16, 12), bins=30)

plt.tight_layout()
plt.show()

fig, axes = plt.subplots(1, 3, figsize=(15, 5))

sns.boxplot(x="Landslide", y="Rainfall_24h_mm", data=df, ax=axes[0])
axes[0].set_title("24h Rainfall vs Landslide")

sns.boxplot(x="Landslide", y="Slope_Angle_deg", data=df, ax=axes[1])
axes[1].set_title("Slope vs Landslide")

sns.boxplot(x="Landslide", y="NDVI_Index", data=df, ax=axes[2])
axes[2].set_title("NDVI vs Landslide")

plt.tight_layout()
plt.show()

fig, axes = plt.subplots(1, 3, figsize=(15, 5))

sns.boxplot(x="Landslide", y="Clay_Content_pct", data=df, ax=axes[0])
axes[0].set_title("Clay Content vs Landslide")

sns.boxplot(x="Landslide", y="Sand_Content_pct", data=df, ax=axes[1])
axes[1].set_title("Sand Content vs Landslide")

sns.boxplot(x="Landslide", y="Silt_Content_pct", data=df, ax=axes[2])
axes[2].set_title("Silt Content vs Landslide")

plt.tight_layout()
plt.show()

corr = df.corr(numeric_only=True)

plt.figure(figsize=(16, 12))

sns.heatmap(
    corr,
    annot=True,
    fmt=".2f",
    cmap="coolwarm"
)

plt.title("Feature Correlation Heatmap")
plt.show()

print(df.corr(numeric_only=True)["Landslide"].sort_values(ascending=False))

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
