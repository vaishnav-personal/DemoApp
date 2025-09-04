const express = require("express");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const { ObjectId } = require("mongodb");
const OwnerSettingService = require("../services/ownersetting.service");

const router = express.Router();

// Multer config
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "./uploads"),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + "-" + file.originalname);
  },
});
const upload = multer({ storage });   // 👈 define it here




// Middleware: require authentication
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

// Middleware: allow only admins
function allowToAdminOnly(req, res, next) {
  if (!req.tokenData || req.tokenData.role !== "admin") {
    return res.status(401).json({ message: "Unauthorized" });
  }
  next();
}

// ================== ROUTES ==================

// Submit new application (Owner only)
router.post("/", requireAuth, upload.single("documents"), async (req, res) => {
  try {
    const ownerId = req.tokenData._id;
    const obj = {
      ownerId: new ObjectId(ownerId),
      stationName: req.body.stationName,
      location: req.body.location,
      documentPath: req.file 
  ? `${req.protocol}://${req.get("host")}/uploadedImages/${req.file.filename}`
  : null,
      status: "pending",
      createdAt: new Date(),
    };

    const result = await OwnerSettingService.addApplication(obj);
    res.status(201).json(result);
  } catch (error) {
    console.error("❌ Add application error:", error);
    res.status(500).json({ error: error.message || "Internal Server Error" });
  }
});

// Admin: get all applications
router.get("/", requireAuth, allowToAdminOnly, async (req, res, next) => {
  try {
    const list = await OwnerSettingService.getAllApplications();
    res.status(200).json(list);
  } catch (error) {
    next(error);
  }
});

// Admin: get application by ID
router.get("/:id", requireAuth, allowToAdminOnly, async (req, res, next) => {
  try {
    const result = await OwnerSettingService.getApplicationById(req.params.id);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
});

// Admin: get application by station name
router.get("/station/:stationName", requireAuth, allowToAdminOnly, async (req, res, next) => {
  try {
    const result = await OwnerSettingService.getApplicationByStationName(req.params.stationName);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
});

// Admin: get application by location
router.get("/location/:location", requireAuth, allowToAdminOnly, async (req, res, next) => {
  try {
    const result = await OwnerSettingService.getApplicationByLocation(req.params.location);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
});

// Admin: get applications by state
router.get("/state/:state", requireAuth, allowToAdminOnly, async (req, res, next) => {
  try {
    const result = await OwnerSettingService.getApplicationsByState(req.params.state);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
});

// Admin: update application
router.put("/:id", requireAuth, allowToAdminOnly, async (req, res, next) => {
  try {
    const result = await OwnerSettingService.updateApplication(req.params.id, req.body);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
});

// Admin: delete application
router.delete("/:id", requireAuth, allowToAdminOnly, async (req, res, next) => {
  try {
    const result = await OwnerSettingService.deleteApplication(req.params.id);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
