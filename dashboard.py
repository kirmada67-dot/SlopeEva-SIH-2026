#!/usr/bin/env python3
import streamlit as st
import folium
from streamlit_folium import st_folium

regions = {
    "Region A": [30.3165, 78.0322],
    "Region B": [31.1048, 77.1734],
    "Region C": [27.3389, 88.6065],
    "Region D": [32.2190, 76.3234],
    "Region E": [28.2180, 94.7278],
}

m = folium.Map(
    location=[20.5937, 78.9629],
    zoom_start=5
)

for name, location in regions.items():
    folium.Marker(
        location=location,
        tooltip=name,
        popup=name
    ).add_to(m)

st_folium(m)
