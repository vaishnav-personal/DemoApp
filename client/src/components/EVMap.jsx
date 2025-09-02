// src/components/EVMap.jsx
import React, { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import MapboxDirections from "@mapbox/mapbox-gl-directions/dist/mapbox-gl-directions";

// ✅ CSS imports (make sure you also import in main.jsx or App.jsx)
import "mapbox-gl/dist/mapbox-gl.css";
import "@mapbox/mapbox-gl-directions/dist/mapbox-gl-directions.css";

// Set token
mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

const EVMap = ({ origin, stations = [], nearest }) => {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Initialize map
    mapRef.current = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/mapbox/streets-v11",
      center: [origin?.lng || 77.5946, origin?.lat || 12.9716],
      zoom: 12,
    });

    // Add navigation controls
    mapRef.current.addControl(new mapboxgl.NavigationControl(), "top-right");

    // Add directions control
    const directions = new MapboxDirections({
      accessToken: mapboxgl.accessToken,
      unit: "metric",
      profile: "mapbox/driving",
    });
    mapRef.current.addControl(directions, "top-left");

    // Add origin marker
    if (origin) {
      new mapboxgl.Marker({ color: "red" })
        .setLngLat([origin.lng, origin.lat])
        .setPopup(new mapboxgl.Popup().setText("You are here"))
        .addTo(mapRef.current);
    }

    // Add station markers
    stations.forEach((station) => {
      new mapboxgl.Marker({ color: "green" })
        .setLngLat([station.lng, station.lat])
        .setPopup(
          new mapboxgl.Popup().setHTML(`
            <div>
              <strong>${station.name}</strong><br/>
              Distance: ${
                station.road_distance_m
                  ? (station.road_distance_m / 1000).toFixed(2) + " km"
                  : "—"
              }
            </div>
          `)
        )
        .addTo(mapRef.current);
    });

    // Auto route to nearest
    if (origin && nearest) {
      directions.setOrigin([origin.lng, origin.lat]);
      directions.setDestination([nearest.lng, nearest.lat]);
    }

    // Cleanup on unmount
    return () => {
      if (mapRef.current) mapRef.current.remove();
    };
  }, [origin, stations, nearest]);

  return <div ref={mapContainerRef} style={{ height: "70vh", width: "100%" }} />;
};

export default EVMap;
