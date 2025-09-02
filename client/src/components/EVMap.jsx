// src/components/EVMap.jsx
import React, { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

const EVMap = ({ origin, stations = [], setList }) => {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);

  // Initialize map once
  useEffect(() => {
    mapRef.current = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/mapbox/streets-v11",
      center: origin ? [origin.lng, origin.lat] : [77.5946, 12.9716],
    });

    mapRef.current.addControl(new mapboxgl.NavigationControl(), "top-right");

    // Add new station on click
    mapRef.current.on("click", async (e) => {
      const lng = e.lngLat.lng;
      const lat = e.lngLat.lat;
      const name = prompt("Enter station name:");
      if (!name) return;

      const res = await fetch(
        `${import.meta.env.VITE_API_URL || "http://localhost:3002"}/api/ev/stations`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, lat, lng }),
        }
      );
      const newStation = await res.json();
      setList((prev) => [...prev, newStation]);
    });

    // Cleanup
    return () => mapRef.current?.remove();
  }, []);

  // Fly to user location when origin updates
  useEffect(() => {
    if (origin && mapRef.current) {
      mapRef.current.flyTo({
        center: [origin.lng, origin.lat],
        zoom: 14,
        essential: true,
      });
    }
  }, [origin]);

  // Render markers
  useEffect(() => {
    if (!mapRef.current) return;

    // clear old markers
    document.querySelectorAll(".mapboxgl-marker").forEach((el) => el.remove());

    // User marker
    if (origin) {
      new mapboxgl.Marker({ color: "red" })
        .setLngLat([origin.lng, origin.lat])
        .setPopup(new mapboxgl.Popup().setText("You are here"))
        .addTo(mapRef.current);
    }

    // Stations
    stations.forEach((s) => {
      new mapboxgl.Marker({ color: "green" })
        .setLngLat([s.lng, s.lat])
        .setPopup(
          new mapboxgl.Popup().setHTML(`
            <div>
              <strong>${s.name}</strong><br/>
              <button onclick="deleteStation(${s.id})">Delete</button>
            </div>
          `)
        )
        .addTo(mapRef.current);
    });
  }, [stations, origin]);

  // Delete station (bind to window for demo)
  window.deleteStation = async (id) => {
    await fetch(
      `${import.meta.env.VITE_API_URL || "http://localhost:3002"}/api/ev/stations/${id}`,
      { method: "DELETE" }
    );
    setList((prev) => prev.filter((s) => s.id !== id));
  };

  return <div ref={mapContainerRef} style={{ height: "70vh", width: "100%" }} />;
};

export default EVMap;
