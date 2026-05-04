const express = require("express");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const emailjs = require("emailjs-com");
const OwnerSettingService = require("../services/ownersetting.service");

const router = express.Router();

// ---------------- Multer Config ----------------
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "./uploads"),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + "-" + file.originalname);
  },
});
const upload = multer({ storage });

// ---------------- Middleware ----------------

// Auth middleware
function requireAuth(req, res, next) {
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ error: "Not authenticated" });

  try {
    req.tokenData = jwt.verify(token, process.env.SECRET_KEY || "dev_secret");
    next();
  } catch {
    return res.status(401).json({ error: "Invalid token" });
  }
}

// Admin only middleware
function allowToAdminOnly(req, res, next) {
  if (!req.tokenData || req.tokenData.role !== "admin") {
    return res.status(401).json({ message: "Unauthorized" });
  }
  next();
}

// ---------------- Routes ----------------



router.post("/", requireAuth, upload.single("documents"), async (req, res) => {
  try {
    const db = req.app.locals.db;
    if (!db) return res.status(500).json({ error: "Database not connected" });

    const ownerEmail = req.tokenData.email;

    const newApplication = {
      stationName: req.body.stationName,
      ownerName: req.body.ownerName,
      contactNumber: req.body.contactNumber,
      ownerEmail,
      address: req.body.address || "",
      city: req.body.city || "",
      state: req.body.state || "",
      pincode: req.body.pincode || "",
      latitude: req.body.latitude || "",
      longitude: req.body.longitude || "",
      chargerTypes: req.body.chargerTypes || [],
      numChargers: req.body.numChargers || "",
      powerCapacity: req.body.powerCapacity || "",
      operatingHours: req.body.operatingHours || "",
      pricingModel: req.body.pricingModel || "",
      amenities: req.body.amenities || [],
      licenseId: req.body.licenseId || "",
      gstNumber: req.body.gstNumber || "",
      documentUrl: req.file ? `/uploads/${req.file.filename}` : null,
      status: "pending",
      createdAt: new Date(),
    };

    const result = await db.collection("Applications").insertOne(newApplication);
    const savedApp = { ...newApplication, _id: result.insertedId };

    // Optional: notify admins via WebSocket
    if (req.app.locals.io) req.app.locals.io.emit("newApplication", savedApp);
    console.log("New application submitted:", savedApp);
    res.status(201).json(savedApp);
  } catch (err) {
    console.error("🔥 ownersetting POST error:", err);
    res.status(500).json({ error: err.message || "Internal Server Error" });
  }
});



// GET: All applications (admin)
router.get("/", requireAuth, allowToAdminOnly, async (req, res, next) => {
  try {
    const list = await OwnerSettingService.getAllApplications();
    res.status(200).json(list);
  } catch (error) {
    next(error);
  }
});

// GET: Application by ID
router.get("/:id", requireAuth, allowToAdminOnly, async (req, res, next) => {
  try {
    const result = await OwnerSettingService.getApplicationById(req.params.id);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
});

// GET: Application by station name
router.get("/station/:stationName", requireAuth, allowToAdminOnly, async (req, res, next) => {
  try {
    const result = await OwnerSettingService.getApplicationByStationName(req.params.stationName);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
});

// GET: Application by location
router.get("/location/:location", requireAuth, allowToAdminOnly, async (req, res, next) => {
  try {
    const result = await OwnerSettingService.getApplicationByLocation(req.params.location);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
});

// GET: Applications by state
router.get("/state/:state", requireAuth, allowToAdminOnly, async (req, res, next) => {
  try {
    const result = await OwnerSettingService.getApplicationsByState(req.params.state);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
});

// PUT: Update application status / info (admin)
router.put("/:id", requireAuth, allowToAdminOnly, async (req, res) => {
  console.log("PUT /ownersetting/:id called with ID:", req.params.id);
  console.log("Body:", req.body);
  try {
    const updatedApp = await OwnerSettingService.updateApplication(req.params.id, req.body);
    console.log("Updated app:", updatedApp);
    res.status(200).json(updatedApp);
  } catch (err) {
    console.error("🔥 PUT error:", err);
    res.status(500).json({ error: err.message });
  }
});

// DELETE: Remove application (admin)
router.delete("/:id", requireAuth, allowToAdminOnly, async (req, res, next) => {
  try {
    const result = await OwnerSettingService.deleteApplication(req.params.id);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
