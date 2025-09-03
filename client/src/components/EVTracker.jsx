// src/components/EVTracker.jsx
import React, { useEffect, useRef, useState } from "react";
import EVMap from "./EVMap";

const POLL_MS = 5000;

export default function EVTracker() {
  const [status, setStatus] = useState("Idle");
  const [origin, setOrigin] = useState(null); // user’s current location
  const [stations, setStations] = useState([]); // stations near searched place
  const [selected, setSelected] = useState(null); // station user clicks
  const [searchResults, setSearchResults] = useState([]);
  const [routeInfo, setRouteInfo] = useState(null);
  const timerRef = useRef(null); // ✅ now defined properly

  // ✅ Get user’s current location once
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setOrigin({ lat: pos.coords.latitude, lng: pos.coords.longitude });
      },
      (err) => console.error("Location error:", err),
      { enableHighAccuracy: true }
    );
  }, []);

  // ✅ Polling to keep updating user location
  const tick = async () => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setOrigin({ lat: pos.coords.latitude, lng: pos.coords.longitude });
      },
      (err) => console.error("Location error:", err),
      { enableHighAccuracy: true }
    );
  };

  const start = () => {
    if (!("geolocation" in navigator)) {
      setStatus("Geolocation not supported");
      return;
    }
    setStatus("Tracking…");
    tick();
    timerRef.current = setInterval(tick, POLL_MS);
  };

  const stop = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setStatus("Stopped");
  };

  useEffect(() => {
    return () => stop(); // cleanup on unmount
  }, []);

  // ✅ Search places (Mapbox Geocoding API)
  const handleSearch = async (e) => {
    const query = e.target.value;
    if (query.length < 3) {
      setSearchResults([]);
      return;
    }

    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
      query
    )}.json?access_token=${import.meta.env.VITE_MAPBOX_TOKEN}&limit=5`;

    const res = await fetch(url);
    const data = await res.json();
    setSearchResults(data.features || []);
  };

  // ✅ When user selects a place → fetch nearby stations from backend
  const handlePlaceSelect = async (place) => {
    const [lng, lat] = place.center;

    setStatus(`Searching stations near ${place.text}...`);

    try {
      const res = await fetch(
        `${
          import.meta.env.VITE_API_URL || "http://localhost:3002"
        }/api/ev/stations?lat=${lat}&lng=${lng}&radius=5000`
      );
      const data = await res.json();
      setStations(data);
      setSearchResults([]); // hide search dropdown
      setStatus(`Found ${data.length} stations near ${place.text}`);
    } catch (err) {
      console.error(err);
      setStatus("Failed to fetch stations");
    }
  };

  const fmtKm = (m) => (m == null ? "—" : (m / 1000).toFixed(2) + " km");
  const fmtMin = (s) => (s == null ? "—" : Math.round(s / 60) + " min");

  return (
    <div className="p-4">
      {/* Buttons */}
      <div className="mb-3">
        <button onClick={start} className="btn btn-primary me-2">
          Start Tracking
        </button>
        <button onClick={stop} className="btn btn-outline-secondary">
          Stop
        </button>
      </div>

      {/* Search bar */}
      <input
        type="text"
        placeholder="Search a place (e.g. Katraj Lake)"
        className="form-control mb-2"
        onKeyUp={handleSearch}
      />

      {/* Autocomplete dropdown */}
      {searchResults.length > 0 && (
        <ul className="list-group mb-3">
          {searchResults.map((place) => (
            <li
              key={place.id}
              className="list-group-item list-group-item-action"
              style={{ cursor: "pointer" }}
              onClick={() => handlePlaceSelect(place)}
            >
              {place.place_name}
            </li>
          ))}
        </ul>
      )}

      <div className="mb-2">
        <strong>Status:</strong> {status}
      </div>

      {/* Map */}
      <EVMap
        origin={origin}
        stations={stations}
        nearest={selected}
        setList={setStations}
        onRouteData={setRouteInfo} // ✅ capture route info
      />

      {/* Stations list */}
      {stations.length > 0 && (
        <div className="mt-3">
          <h4>Stations near searched place</h4>
          <ul className="list-group">
            {stations.map((st) => (
              <li
                key={st.id}
                className="list-group-item list-group-item-action"
                style={{ cursor: "pointer" }}
                onClick={() => setSelected(st)} // user clicks → route drawn
              >
                {st.name} ({st.lat.toFixed(4)}, {st.lng.toFixed(4)})
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Info for selected station */}
      {selected && routeInfo && (
        <div className="mb-4 mt-3">
          <h4>Selected EV station</h4>
          <div>
            <strong>{selected.name}</strong>
          </div>
          <div>
            Coords: {selected.lat.toFixed(5)}, {selected.lng.toFixed(5)}
          </div>
          <div>Road distance: {(routeInfo.distance / 1000).toFixed(2)} km</div>
          <div>ETA: {Math.round(routeInfo.duration / 60)} min</div>
        </div>
      )}
    </div>
  );
}
