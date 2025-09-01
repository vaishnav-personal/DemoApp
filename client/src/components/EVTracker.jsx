// src/components/EVTracker.jsx
import React, { useEffect, useRef, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useNavigate } from "react-router-dom";
const POLL_MS = 5000; // update every 5s

// fix missing default icon in React-Leaflet
import iconUrl from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";
const DefaultIcon = L.icon({ iconUrl, shadowUrl: iconShadow });
L.Marker.prototype.options.icon = DefaultIcon;

export default function EVTracker() {
  const [status, setStatus] = useState("Click to start");
  const [origin, setOrigin] = useState(null); // {lat,lng}
  const [nearest, setNearest] = useState(null); // best station with time
  const [list, setList] = useState([]); // returned shortlist
  const timerRef = useRef(null);

  const fetchNearby = async (lat, lng) => {
    setStatus("Fetching nearby stations…");
    const url = `${
      import.meta.env.VITE_API_URL
    }/api/ev/nearby?lat=${lat}&lng=${lng}&radius=6000&limit=8`;
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
            setList(data.candidates || []);

            const best = [...(data.candidates || [])].sort((a, b) => {
              const da = a.road_distance_m ?? a.straight_distance_m ?? Infinity;
              const db = b.road_distance_m ?? b.straight_distance_m ?? Infinity;
              return da - db;
            })[0];

            setNearest(best || null);
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
    console.log("Navigating with:", { origin, list, nearest });
    navigate("/map", {
      state: {
        origin, // {lat, lng}
        stations: list, // 👈 must be list from fetchNearby
        nearest,
      },
    });
    if (!("geolocation" in navigator)) {
      setStatus("Geolocation not supported");
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

      {/* Map Section */}
      <div style={{ height: "400px", width: "100%", marginBottom: "20px" }}>
        <MapContainer
          center={origin ? [origin.lat, origin.lng] : [20.5937, 78.9629]}
          zoom={origin ? 14 : 5}
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution="&copy; OpenStreetMap contributors"
          />

          {/* User marker */}
          {origin && (
            <Marker position={[origin.lat, origin.lng]}>
              <Popup>You are here</Popup>
            </Marker>
          )}

          {/* Nearest station marker */}
          {nearest && (
            <Marker position={[nearest.lat, nearest.lng]}>
              <Popup>
                <strong>{nearest.name}</strong>
                <br />
                Road: {fmtKm(nearest.road_distance_m)} <br />
                ETA: {fmtMin(nearest.duration_s)}
              </Popup>
            </Marker>
          )}

          {/* Other station markers */}
          {list.map((s) => (
            <Marker key={s.id} position={[s.lat, s.lng]}>
              <Popup>
                {s.name} <br />
                {fmtKm(s.road_distance_m)} / {fmtMin(s.duration_s)}
              </Popup>
            </Marker>
          ))}

          {/* Optional: Draw line from user to nearest */}
          {origin && nearest && (
            <Polyline
              positions={[
                [origin.lat, origin.lng],
                [nearest.lat, nearest.lng],
              ]}
            />
          )}
        </MapContainer>
      </div>

      {/* Info Section */}
      {origin && (
        <div className="mb-3">
          <strong>Your location:</strong> {origin.lat.toFixed(5)},{" "}
          {origin.lng.toFixed(5)}
        </div>
      )}

      {nearest && (
        <div className="mb-4">
          <h4>Nearest EV station</h4>
          <div>
            <div>
              <strong>{nearest.name}</strong>
            </div>
            <div>
              Coords: {nearest.lat.toFixed(5)}, {nearest.lng.toFixed(5)}
            </div>
            <div>Road distance: {fmtKm(nearest.road_distance_m)}</div>
            <div>ETA: {fmtMin(nearest.duration_s)}</div>
            <div>As-the-crow-flies: {fmtKm(nearest.straight_distance_m)}</div>
          </div>
        </div>
      )}

      <h5>Shortlist (top by proximity)</h5>
      <ul>
        {list.map((s) => (
          <li key={s.id}>
            {s.name} — {fmtKm(s.road_distance_m)} ({fmtMin(s.duration_s)})
          </li>
        ))}
      </ul>
    </div>
  );
}
