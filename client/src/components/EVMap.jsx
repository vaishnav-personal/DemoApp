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
      center: origin ? [origin.lng, origin.lat] : [73.8652, 18.4575], // default Pune Katraj
      zoom: 13,
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
      const marker = new mapboxgl.Marker({ color: "green", draggable: true }) // draggable for update
        .setLngLat([s.lng, s.lat])
        .setPopup(
          new mapboxgl.Popup().setHTML(`
            <div>
              <strong>${s.name}</strong><br/>
              <button onclick="editStation(${s.id})">Edit</button>
              <button onclick="deleteStation(${s.id})">Delete</button>
            </div>
          `)
        )
        .addTo(mapRef.current);

      // Drag to update coords
      marker.on("dragend", async () => {
        const { lng, lat } = marker.getLngLat();
        await fetch(
          `${import.meta.env.VITE_API_URL || "http://localhost:3002"}/api/ev/stations/${s.id}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ...s, lat, lng }),
          }
        );
        setList((prev) =>
          prev.map((st) => (st.id === s.id ? { ...st, lat, lng } : st))
        );
      });
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

  // Edit station (bind to window for demo)
  window.editStation = async (id) => {
    const newName = prompt("Enter new station name:");
    if (!newName) return;

    const station = stations.find((s) => s.id === id);
    if (!station) return;

    await fetch(
      `${import.meta.env.VITE_API_URL || "http://localhost:3002"}/api/ev/stations/${id}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...station, name: newName }),
      }
    );

    setList((prev) =>
      prev.map((s) => (s.id === id ? { ...s, name: newName } : s))
    );
  };
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
