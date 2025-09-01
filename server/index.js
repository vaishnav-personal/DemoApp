const express = require("express");
var cookieParser = require("cookie-parser");//parsing cookies of users
const jwt = require("jsonwebtoken");//decode it
const dotenv = require("dotenv").config();
const { app } = require("./init.js");//connedction to mongoclient
var cors = require("cors");//Without it, browsers block requests from other origins (domains, ports, or protocols) due to the same-origin policy.
const authenticateUser = require("./authenticateUser.js");
const productRouter = require("./routers/product.router.js");
const userRouter = require("./routers/user.router.js");
const categoryRouter = require("./routers/category.router.js");
const customerRouter = require("./routers/customer.router.js");
const fileRouter = require("./routers/file.router.js");
const specialRouter = require("./routers/special.router.js");
const LocationRouter =require("./routers/LocationRouter.js");
const  orsRouter =require("./routers/ors.js");
const logger = require("./logger");
const errorLogger = require("./errorLogger");
app.use(
  cors({
    origin: process.env.ORIGIN,
    credentials: true,
    exposedHeaders: ["Content-Disposition"],
  })
); // allow cookies
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: false }));
// Activity logging middleware

app.use(authenticateUser);
app.use(logActivity);//middleware for every incoming request.”
app.use("/api", orsRouter);

app.use("/specials", specialRouter); // authentication not required
app.use("/users", userRouter); // authentication done inside this file
app.use("/products", checkAuthority, productRouter);
app.use("/categories", checkAuthority, categoryRouter);
app.use("/customers", checkAuthority, customerRouter);
app.use("/api/location",LocationRouter);
app.use("/files", fileRouter);
app.use("/uploadedImages", express.static("uploads"));
app.use(errorLogger); // This should be the last middleware.


/**
 * GET /api/ev/nearby?lat=..&lng=..&radius=5000&limit=10
 * - Overpass: find charging stations around user
 * - Haversine: rank quickly
 * - OSRM: fetch road distance & duration for top N
 */
app.get("/api/ev/nearby", async (req, res) => {
  try {
    const lat = parseFloat(req.query.lat);
    const lng = parseFloat(req.query.lng);
    const radius = parseInt(req.query.radius || "5000", 10); // meters
    const limit = parseInt(req.query.limit || "10", 10);     // top N for OSRM

    if (Number.isNaN(lat) || Number.isNaN(lng)) {
      return res.status(400).json({ error: "lat and lng are required numbers" });
    }

    // 1) Overpass: EV charging stations near user
    const overpass = `https://overpass-api.de/api/interpreter?data=[out:json];
      node["amenity"="charging_station"](around:${radius},${lat},${lng});
      out;`.replace(/\s+/g, " ");

    const ovRes = await fetch(overpass);
    const ovJson = await ovRes.json();

    const stations = (ovJson.elements || [])
      .filter(e => typeof e.lat === "number" && typeof e.lon === "number")
      .map(e => ({
        id: e.id,
        name: (e.tags && e.tags.name) || "Unnamed Station",
        lat: e.lat,
        lng: e.lon,
      }));

    // 2) Haversine (fast) to shortlist
    const toRad = (x) => (x * Math.PI) / 180;
    const haversine = (aLat, aLng, bLat, bLng) => {
      const R = 6371e3;
      const dLat = toRad(bLat - aLat);
      const dLng = toRad(bLng - aLng);
      const A =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(toRad(aLat)) * Math.cos(toRad(bLat)) * Math.sin(dLng / 2) ** 2;
      return 2 * R * Math.atan2(Math.sqrt(A), Math.sqrt(1 - A)); // meters
    };

    const ranked = stations
      .map(s => ({ ...s, straight_distance_m: haversine(lat, lng, s.lat, s.lng) }))
      .sort((a, b) => a.straight_distance_m - b.straight_distance_m);

    const shortlist = ranked.slice(0, Math.max(1, limit));

    // 3) OSRM: road distance & duration (one call per destination)
    // (Public server; be polite with requests)
    const withRouting = [];
    for (const s of shortlist) {
      const osrmUrl = `https://router.project-osrm.org/route/v1/driving/${lng},${lat};${s.lng},${s.lat}?overview=false`;
      try {
        const r = await fetch(osrmUrl);
        const j = await r.json();
        const route = j?.routes?.[0];
        withRouting.push({
          ...s,
          road_distance_m: route?.distance ?? null,
          duration_s: route?.duration ?? null,
        });
      } catch {
        withRouting.push({ ...s, road_distance_m: null, duration_s: null });
      }
    }

    // return: shortlist with routing + also include the rest (only straight-line) if you want
    res.json({
      origin: { lat, lng },
      radius_m: radius,
      candidates: withRouting, // top N with time & road distance
      total_found: stations.length,
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to fetch nearby EV stations" });
  }
});

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