// src/components/EVMap.jsx
import React, { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

const EVMap = ({ origin, stations = [], nearest, setList, onRouteData }) => {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);

  // ✅ Helper: fetch route + draw line + send distance/ETA back
  async function getRoute(map, origin, destination) {
    const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${origin.lng},${origin.lat};${destination.lng},${destination.lat}?geometries=geojson&access_token=${mapboxgl.accessToken}`;

    const res = await fetch(url);
    const data = await res.json();
    const route = data.routes[0].geometry;
    const distance = data.routes[0].distance; // in meters
    const duration = data.routes[0].duration; // in seconds

    // ✅ pass data back to parent (EVTracker)
    if (onRouteData) {
      onRouteData({ distance, duration });
    }

    const geojson = {
      type: "Feature",
      properties: {},
      geometry: route,
    };

    if (map.getSource("route")) {
      map.getSource("route").setData(geojson);
    } else {
      map.addSource("route", { type: "geojson", data: geojson });

      map.addLayer({
        id: "route",
        type: "line",
        source: "route",
        layout: {
          "line-join": "round",
          "line-cap": "round",
        },
        paint: {
          "line-color": "#3b82f6",
          "line-width": 5,
        },
      });
    }
  }

  // ✅ Initialize map once
  useEffect(() => {
    mapRef.current = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/mapbox/streets-v11",
      center: origin ? [origin.lng, origin.lat] : [73.8652, 18.4575],
      zoom: 15,
    });

    mapRef.current.addControl(new mapboxgl.NavigationControl(), "top-right");

    return () => mapRef.current?.remove();
  }, []);

  // ✅ Fly to user when origin changes
  useEffect(() => {
    if (origin && mapRef.current) {
      mapRef.current.flyTo({
        center: [origin.lng, origin.lat],
        zoom: 15,
        essential: true,
      });
    }
  }, [origin]);

  // ✅ Render user + stations markers
  useEffect(() => {
    if (!mapRef.current) return;

    // clear markers
    document.querySelectorAll(".mapboxgl-marker").forEach((el) => el.remove());

    // User marker
    if (origin) {
      new mapboxgl.Marker({ color: "red" })
        .setLngLat([origin.lng, origin.lat])
        .setPopup(new mapboxgl.Popup().setText("You are here"))
        .addTo(mapRef.current);
    }

    // Station markers
    stations.forEach((s) => {
      new mapboxgl.Marker({ color: "green" })
        .setLngLat([s.lng, s.lat])
        .setPopup(new mapboxgl.Popup().setText(s.name))
        .addTo(mapRef.current);
    });
  }, [stations, origin]);

  // ✅ Draw route when origin + nearest selected
  useEffect(() => {
    if (!mapRef.current || !origin || !nearest) return;
    getRoute(mapRef.current, origin, nearest);
  }, [origin, nearest]);

  return <div ref={mapContainerRef} style={{ height: "70vh", width: "100%" }} />;
};

export default EVMap;
