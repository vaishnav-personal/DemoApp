// src/components/EVTracker.jsx
import React, { useEffect, useRef, useState } from "react";
import EVMap from "./EVMap";   // ⬅️ Import Map

const POLL_MS = 5000;

export default function EVTracker() {
  const [status, setStatus] = useState("Click to start");
  const [origin, setOrigin] = useState(null);
  const [nearest, setNearest] = useState(null);
  const [list, setList] = useState([]);
  const timerRef = useRef(null);

  const fetchNearby = async (lat, lng) => {
    setStatus("Fetching nearby stations…");
    const url = `${import.meta.env.VITE_API_URL || "http://localhost:3002"}/api/ev/nearby?lat=${lat}&lng=${lng}&radius=6000&limit=6`;
    const res = await fetch(url);
    if (!res.ok) throw new Error("Backend error");
    return res.json();
  };

  const tick = async () => {
    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          try {
            const lat = pos.coords.latitude;
            const lng = pos.coords.longitude;
            setOrigin({ lat, lng });

            const data = await fetchNearby(lat, lng);
            setList(data.candidates);
            
            const best = [...(data.candidates )].sort((a, b) => {
              const da = a.road_distance_m ?? a.straight_distance_m ?? Infinity;
              const db = b.road_distance_m ?? b.straight_distance_m ?? Infinity;
              return da - db;
            })[0];
            
            setNearest(best);
            
            setStatus("Live");
          } catch (e) {
            console.error(e);
            setStatus("Failed to fetch data");
          }
          resolve();
        },
        (err) => {
          console.error(err);
          setStatus(err.message || "Location error");
          resolve();
        },
        { enableHighAccuracy: true, maximumAge: 0, timeout: 8000 }
      );
    });
  };

  const start = async () => {
    if (!("geolocation" in navigator)) {
      setStatus("Geolocation not supported");
      console.log("here")
      {list}
      return;
    }
    setStatus("Starting…");
    await tick();
    timerRef.current = setInterval(tick, POLL_MS);
  };

  const stop = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = null;
    setStatus("Stopped");
  };

  useEffect(() => {
    return () => stop();
  }, []);

  const fmtKm = (m) => (m == null ? "—" : (m / 1000).toFixed(2) + " km");
  const fmtMin = (s) => (s == null ? "—" : Math.round(s / 60) + " min");

  return (
    <div className="p-4">
      <div className="mb-3">
        <button onClick={start} className="btn btn-primary me-2">
          Start Tracking
        </button>
        <button onClick={stop} className="btn btn-outline-secondary">
          Stop
        </button>
      </div>

      <div className="mb-2">
        <strong>Status:</strong> {status}
      </div>

      {/* ✅ Show Map */}
      
    <EVMap origin={origin} stations={list} nearest={nearest} />

      {nearest && (
        <div className="mb-4 mt-3">
          <h4>Nearest EV station</h4>
          <div>
            <div><strong>{nearest.name}</strong></div>
            <div>Coords: {nearest.lat.toFixed(5)}, {nearest.lng.toFixed(5)}</div>
            <div>Road distance: {fmtKm(nearest.road_distance_m)}</div>
            <div>ETA: {fmtMin(nearest.duration_s)}</div>
          </div>
        </div>
      )}
    </div>
  );
}
