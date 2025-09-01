// ors.js
const express = require("express");
const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));

const router = express.Router();

const ORS_API_KEY = process.env.ORS_API_KEY; // Make sure this is in your .env

// Route: /api/route?start=lng,lat&end=lng,lat
router.get("/route", async (req, res) => {
  try {
    const { start, end } = req.query;
    if (!start || !end) {
      return res.status(400).json({ error: "Missing start or end query params" });
    }

    const url = `https://api.openrouteservice.org/v2/directions/driving-car?api_key=${ORS_API_KEY}&start=${start}&end=${end}`;
    console.log("Fetching ORS URL:", url);

    const response = await fetch(url);
    if (!response.ok) {
      const errText = await response.text();
      console.error("ORS API error:", errText);
      return res.status(response.status).json({ error: "ORS API error", details: errText });
    }

    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error("ORS fetch failed:", err);
    res.status(500).json({ error: "ORS fetch failed", message: err.message });
  }
});

module.exports = router;
