#!/usr/bin/env python3
import pandas as pd
#from sklearn.ensemble import RandomForestClassifier
#from sklearn.linear_model import LogisticRegression
#from sklearn.model_selection import train_test_split
import matplotlib.pyplot as plt
import seaborn as sns
import numpy as np

df = pd.read_csv("src/landslide_demo_v1.csv")

print(df["Landslide"].value_counts(normalize=True))
sns.countplot(x="Landslide", data=df)

plt.title("Landslide Class Distribution")
plt.xlabel("Landslide")
plt.ylabel("Count")
plt.show()


