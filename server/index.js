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

// ✅ Nearby EV stations endpoint
app.get("/api/ev/nearby", async (req, res) => {
  try {
    const { lat, lng, radius = 6000, limit = 6 } = req.query;

    // 1. Overpass API query
    const overpassQuery = `
      [out:json][timeout:25];
      node["amenity"="charging_station"](around:${radius},${lat},${lng});
      out;
    `;
    const ovRes = await axios.post("https://overpass-api.de/api/interpreter", overpassQuery, {
      headers: { "Content-Type": "text/plain" },
    });
    const ovJson = ovRes.data;

    // 2. Extract stations
    const stations = (ovJson.elements || [])
      .filter((e) => typeof e.lat === "number" && typeof e.lon === "number")
      .map((e) => ({
        id: e.id,
        name: (e.tags && e.tags.name) || "Unnamed Station",
        lat: e.lat,
        lng: e.lon,
      }));

    // 3. Straight-line distance
    const toRad = (x) => (x * Math.PI) / 180;
    const haversine = (aLat, aLng, bLat, bLng) => {
      const R = 6371e3;
      const dLat = toRad(bLat - aLat);
      const dLng = toRad(bLng - aLng);
      const A =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(toRad(aLat)) * Math.cos(toRad(bLat)) * Math.sin(dLng / 2) ** 2;
      return 2 * R * Math.atan2(Math.sqrt(A), Math.sqrt(1 - A));
    };

    const ranked = stations
      .map((s) => ({
        ...s,
        straight_distance_m: haversine(lat, lng, s.lat, s.lng),
      }))
      .sort((a, b) => a.straight_distance_m - b.straight_distance_m);

    const shortlist = ranked.slice(0, Math.max(1, limit));

    // 4. Routing distance (OSRM)
    const withRouting = [];
    for (const s of shortlist) {
      const osrmUrl = `https://router.project-osrm.org/route/v1/driving/${lng},${lat};${s.lng},${s.lat}?overview=false`;
      try {
        const r = await axios.get(osrmUrl);
        const route = r.data?.routes?.[0];
        withRouting.push({
          ...s,
          road_distance_m: route?.distance ?? null,
          duration_s: route?.duration ?? null,
        });
      } catch {
        withRouting.push({ ...s, road_distance_m: null, duration_s: null });
      }
    }

    // 5. Send response
    res.json({
      origin: { lat, lng },
      radius_m: radius,
      candidates: withRouting,
      total_found: stations.length,
    });
  } catch (e) {
    console.error("Error in /api/ev/nearby:", e.message);
    res.status(500).json({ error: "Failed to fetch nearby EV stations" });
  }
});

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
