const express = require("express");
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv").config();
const { app } = require("./init.js");
const cors = require("cors");
const axios = require("axios");

const authenticateUser = require("./authenticateUser.js");
const productRouter = require("./routers/product.router.js");
const userRouter = require("./routers/user.router.js");
const categoryRouter = require("./routers/category.router.js");
const customerRouter = require("./routers/customer.router.js");
const fileRouter = require("./routers/file.router.js");
const specialRouter = require("./routers/special.router.js");
const LocationRouter = require("./routers/LocationRouter.js");

const logger = require("./logger");
const errorLogger = require("./errorLogger");

app.use(
  cors({
    origin: process.env.ORIGIN,
    credentials: true,
    exposedHeaders: ["Content-Disposition"],
  })
);

app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: false }));

app.use(authenticateUser);
app.use(logActivity);

app.use("/specials", specialRouter);
app.use("/users", userRouter);
app.use("/products", checkAuthority, productRouter);
app.use("/categories", checkAuthority, categoryRouter);
app.use("/customers", checkAuthority, customerRouter);
app.use("/api/location", LocationRouter);
app.use("/files", fileRouter);
app.use("/uploadedImages", express.static("uploads"));
app.use(errorLogger);

//now i want the data comes from backend not overpass api
// ---------------- EV Stations In-Memory CRUD ----------------
let stations = [
  { id: 1, name: "Station A", lat: 18.4575, lng: 73.8652 }, // Katraj Lake
  { id: 2, name: "Station B", lat: 18.4630, lng: 73.8600 }, // Near Bharti Vidyapeeth
  { id: 3, name: "Station C", lat: 18.4520, lng: 73.8700 }, // Katraj Zoo side
  { id: 4, name: "Station D", lat: 18.4650, lng: 73.8750 }, // Towards Bibvewadi
];
// ✅ List all stations
app.get("/api/ev/stations", (req, res) => {
  res.json(stations);
});

// ✅ Add station
app.post("/api/ev/stations", (req, res) => {
  const { name, lat, lng } = req.body;
  const newStation = { id: Date.now(), name, lat, lng };
  stations.push(newStation);
  res.json(newStation);
});

// ✅ Update station
app.put("/api/ev/stations/:id", (req, res) => {
  const { id } = req.params;
  const { name, lat, lng } = req.body;
  stations = stations.map((s) =>
    s.id == id ? { ...s, name, lat, lng } : s
  );
  res.json({ success: true });
});

// ✅ Delete station
app.delete("/api/ev/stations/:id", (req, res) => {
  const { id } = req.params;
  stations = stations.filter((s) => s.id != id);
  res.json({ success: true });
});


































// // ✅ Nearby EV stations endpoint
// app.get("/api/ev/nearby", async (req, res) => {
//   try {
//     const { lat, lng, radius = 6000, limit = 6 } = req.query;

//     // 1. Overpass API query
//     const overpassQuery = `
//       [out:json][timeout:25];
//       node["amenity"="charging_station"](around:${radius},${lat},${lng});
//       out;
//     `;
//     const ovRes = await axios.post("https://overpass-api.de/api/interpreter", overpassQuery, {
//       headers: { "Content-Type": "text/plain" },
//     });
//     const ovJson = ovRes.data;

//     // 2. Extract stations
//     const stations = (ovJson.elements || [])
//       .filter((e) => typeof e.lat === "number" && typeof e.lon === "number")
//       .map((e) => ({
//         id: e.id,
//         name: (e.tags && e.tags.name) || "Unnamed Station",
//         lat: e.lat,
//         lng: e.lon,
//       }));

//     // 3. Straight-line distance
//     const toRad = (x) => (x * Math.PI) / 180;
//     const haversine = (aLat, aLng, bLat, bLng) => {
//       const R = 6371e3;
//       const dLat = toRad(bLat - aLat);
//       const dLng = toRad(bLng - aLng);
//       const A =
//         Math.sin(dLat / 2) ** 2 +
//         Math.cos(toRad(aLat)) * Math.cos(toRad(bLat)) * Math.sin(dLng / 2) ** 2;
//       return 2 * R * Math.atan2(Math.sqrt(A), Math.sqrt(1 - A));
//     };

//     const ranked = stations
//       .map((s) => ({
//         ...s,
//         straight_distance_m: haversine(lat, lng, s.lat, s.lng),
//       }))
//       .sort((a, b) => a.straight_distance_m - b.straight_distance_m);

//     const shortlist = ranked.slice(0, Math.max(1, limit));

//     // 4. Routing distance (OSRM)
//     const withRouting = [];
//     for (const s of shortlist) {
//       const osrmUrl = `https://router.project-osrm.org/route/v1/driving/${lng},${lat};${s.lng},${s.lat}?overview=false`;
//       try {
//         const r = await axios.get(osrmUrl);
//         const route = r.data?.routes?.[0];
//         withRouting.push({
//           ...s,
//           road_distance_m: route?.distance ?? null,
//           duration_s: route?.duration ?? null,
//         });
//       } catch {
//         withRouting.push({ ...s, road_distance_m: null, duration_s: null });
//       }
//     }

//     // 5. Send response
//     res.json({
//       origin: { lat, lng },
//       radius_m: radius,
//       candidates: withRouting,
//       total_found: stations.length,
//     });
//   } catch (e) {
//     console.error("Error in /api/ev/nearby:", e.message);
//     res.status(500).json({ error: "Failed to fetch nearby EV stations" });
//   }
// });

// --- logging + auth helpers ---
function logActivity(req, res, next) {
  let log;
  if (req.role == "Forbidden") {
    log =
      `Forbidden operation -->` + req.method + "--->" + req.baseUrl.slice(1);
    logger.warn(log);
    return res.sendStatus(403);
  } else if (req.role == "guest") {
    if (req.method == "GET") {
      log = `Guest -->` + req.method + "--->" + req.baseUrl.slice(1);
    }
  } else if (req.tokenData.role == "user" || req.tokenData.role == "admin") {
    log =
      req.tokenData.role +
      "(" +
      req.tokenData.name +
      ")" +
      "-->" +
      req.method +
      "--->" +
      req.baseUrl +
      req.path;
  }
  logger.warn(log);
  next();
  }
function checkAuthority(req, res, next) {
   if (!req.tokenData || req.tokenData.role == "guest") {
    // assuming you set req.user after authentication
    res.status(401).json({ message: "Unauthorized" });
  } else {
    next(); // allow
  }
 }
