#!/usr/bin/env python3

import streamlit as st
import folium
from streamlit_folium import st_folium
from shapely.geometry import box
from pyproj import Transformer


if "selected_location" not in st.session_state:
    st.session_state.selected_location = None

if "selected_cell" not in st.session_state:
    st.session_state.selected_cell = None

if "map_center" not in st.session_state:
    st.session_state.map_center = [17.69374533038975, 73.99566650390626]

if "map_zoom" not in st.session_state:
    st.session_state.map_zoom = 12


def create_grid(lat, lng, cell_size=1000):
    zone = int((lng + 180) / 6) + 1
    epsg = 32600 + zone

    to_meters = Transformer.from_crs(
        "EPSG:4326",
        f"EPSG:{epsg}",
        always_xy=True
    )

    to_latlng = Transformer.from_crs(
        f"EPSG:{epsg}",
        "EPSG:4326",
        always_xy=True
    )

    x, y = to_meters.transform(lng, lat)

    half = cell_size * 1.5

    grid = []

    for row in range(3):
        for col in range(3):
            min_x = x - half + col * cell_size
            min_y = y - half + row * cell_size

            cell = box(
                min_x,
                min_y,
                min_x + cell_size,
                min_y + cell_size
            )

            coordinates = [
                to_latlng.transform(px, py)
                for px, py in cell.exterior.coords
            ]

            grid.append(coordinates)

    return grid


m = folium.Map(
    location=st.session_state.map_center,
    zoom_start=st.session_state.map_zoom
)


if st.session_state.selected_location:

    grid = create_grid(*st.session_state.selected_location)

    for i, cell in enumerate(grid):

        cell_name = f"Cell {i + 1}"

        if cell_name == st.session_state.selected_cell:
            weight = 5
            line_color = "black"
        else:
            weight = 2
            line_color = "blue"

        folium.Polygon(
            locations=[[lat, lng] for lng, lat in cell],
            weight=weight,
            color=line_color,
            fill=True,
            fill_opacity=0.1,
            tooltip=cell_name
        ).add_to(m)


map_col, panel_col = st.columns([2, 1])

with map_col:
    map_data = st_folium(
        m,
        width=None,
        height=600,
        key="main_map"
    )

with panel_col:
    if st.session_state.selected_cell:
        st.subheader("Selected Cell")
        st.write(st.session_state.selected_cell)
    else:
        st.subheader("Cell Details")
        st.write("Click a grid cell to select it.")


if map_data.get("center"):
    st.session_state.map_center = [
        map_data["center"]["lat"],
        map_data["center"]["lng"]
    ]

if map_data.get("zoom") is not None:
    st.session_state.map_zoom = map_data["zoom"]


cell_clicked = map_data.get("last_object_clicked_tooltip")

if cell_clicked:

    if cell_clicked != st.session_state.selected_cell:
        st.session_state.selected_cell = cell_clicked
        st.rerun()

else:

    clicked = map_data.get("last_clicked")

    if clicked:

        new_location = (
            clicked["lat"],
            clicked["lng"]
        )

        if new_location != st.session_state.selected_location:
            st.session_state.selected_location = new_location
            st.session_state.selected_cell = None
            st.session_state.map_center = [
                clicked["lat"],
                clicked["lng"]
            ]
            st.rerun()
