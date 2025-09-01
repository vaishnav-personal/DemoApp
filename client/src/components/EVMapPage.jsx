import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const blueIcon = new L.Icon({
  iconUrl: "https://maps.google.com/mapfiles/ms/icons/blue-dot.png",
  iconSize: [32, 32],
});
const redIcon = new L.Icon({
  iconUrl: "https://maps.google.com/mapfiles/ms/icons/red-dot.png",
  iconSize: [32, 32],
});

export default function EVMapPage() {
  const { state } = useLocation();
  const { origin, stations, nearest } = state || {};
  const [routeCoords, setRouteCoords] = useState([]);
  const [stationData, setStationData] = useState([]);

  // Fetch route for nearest station
  useEffect(() => {
    async function fetchNearestRoute() {
      if (!origin || !nearest) return;
      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/api/route?start=${origin.lng},${origin.lat}&end=${nearest.lng},${nearest.lat}`
        );
        const data = await res.json();
        if (!data.features || !data.features.length) {
          console.error("ORS route error:", data);
          return;
        }
        const coords = data.features[0].geometry.coordinates.map((c) => [c[1], c[0]]);
        setRouteCoords(coords);
      } catch (err) {
        console.error("Failed to fetch nearest route", err);
      }
    }
    fetchNearestRoute();
  }, [origin, nearest]);

  // Fetch ETA + distance for all stations
  useEffect(() => {
    async function fetchAllStations() {
      if (!origin || !stations?.length) return;
      try {
        const results = await Promise.all(
          stations.map(async (s) => {
            try {
              const res = await fetch(
                `${import.meta.env.VITE_API_URL}/api/route?start=${origin.lng},${origin.lat}&end=${s.lng},${s.lat}`
              );
              const data = await res.json();
              return {
                ...s,
                eta: data.features?.[0]?.properties?.summary?.duration ?? null,
                distance: data.features?.[0]?.properties?.summary?.distance ?? null,
              };
            } catch (err) {
              console.error("Failed for station:", s.name, err);
              return { ...s, eta: null, distance: null };
            }
          })
        );
        setStationData(results);
      } catch (err) {
        console.error("fetchAllStations error:", err);
      }
    }
    fetchAllStations();
  }, [origin, stations]);

  if (!origin || isNaN(origin.lat) || isNaN(origin.lng)) {
    return <div>Loading your location...</div>;
  }

  return (
    <div style={{ height: "100vh", width: "100vw" }}>
      <MapContainer
        center={[parseFloat(origin.lat), parseFloat(origin.lng)]}
        zoom={13}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

        {/* 🔵 User marker */}
        <Marker
          position={[parseFloat(origin.lat), parseFloat(origin.lng)]}
          icon={blueIcon}
        >
          <Popup>You are here</Popup>
        </Marker>

        {/* ⛽ Stations */}
        {stationData.map((s) => {
          const lat = parseFloat(s.lat);
          const lng = parseFloat(s.lng);
          if (isNaN(lat) || isNaN(lng)) return null; // skip bad coords

          return (
            <Marker
              key={s.id}
              position={[lat, lng]}
              icon={nearest && s.id === nearest.id ? redIcon : undefined}
            >
              <Popup>
                <strong>{s.name}</strong>
                <br />
                Distance: {s.distance ? (s.distance / 1000).toFixed(2) + " km" : "—"}
                <br />
                ETA: {s.eta ? Math.round(s.eta / 60) + " min" : "—"}
              </Popup>
            </Marker>
          );
        })}

        {/* 🛣️ Route for nearest */}
        {routeCoords.length > 0 && <Polyline positions={routeCoords} color="blue" />}
      </MapContainer>
    </div>
  );
}
