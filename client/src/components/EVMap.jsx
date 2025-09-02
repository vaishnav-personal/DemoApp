import React, { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

const EVMap = ({ origin, stations = [], nearest }) => {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const markersRef = useRef([]);

  // Initialize map once
  useEffect(() => {
    if (!mapContainerRef.current) return;

    mapRef.current = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/mapbox/streets-v11",
      center: [77.5946, 12.9716], // default: Bangalore
      zoom: 12,
    });

    mapRef.current.addControl(new mapboxgl.NavigationControl(), "top-right");

    return () => mapRef.current?.remove();
  }, []);

  // Recenter on user location
  useEffect(() => {
    if (origin && mapRef.current) {
      mapRef.current.flyTo({
        center: [origin.lng, origin.lat],
        zoom: 14,
        essential: true,
      });
    }
  }, [origin]);

  // Update markers
  useEffect(() => {
    if (!mapRef.current) return;

    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    if (origin) {
      const userMarker = new mapboxgl.Marker({ color: "red" })
        .setLngLat([origin.lng, origin.lat])
        .setPopup(new mapboxgl.Popup().setText("You are here"))
        .addTo(mapRef.current);
      markersRef.current.push(userMarker);
    }

    stations.forEach((station) => {
      const stMarker = new mapboxgl.Marker({ color: "green" })
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
      markersRef.current.push(stMarker);
    });
  }, [origin, stations]);

  // Update route
  useEffect(() => {
    async function drawRoute(origin, nearest) {
      if (!origin || !nearest || !mapRef.current) return;

      const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${origin.lng},${origin.lat};${nearest.lng},${nearest.lat}?geometries=geojson&access_token=${mapboxgl.accessToken}`;
      const res = await fetch(url);
      const data = await res.json();
      const route = data.routes[0].geometry;

      const map = mapRef.current;

      if (map.getSource("route")) {
        map.getSource("route").setData({
          type: "Feature",
          geometry: route,
        });
      } else {
        map.addSource("route", {
          type: "geojson",
          data: {
            type: "Feature",
            geometry: route,
          },
        });

        map.addLayer({
          id: "route",
          type: "line",
          source: "route",
          layout: { "line-join": "round", "line-cap": "round" },
          paint: { "line-color": "#3b82f6", "line-width": 5 },
        });
      }
    }

    drawRoute(origin, nearest);
  }, [origin, nearest]);

  return <div ref={mapContainerRef} style={{ height: "70vh", width: "100%" }} />;
};

export default EVMap;
