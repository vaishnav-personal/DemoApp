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
router.post("/", requireAuth, upload.single("file"), async (req, res) => {
  try {
    const db = req.app.locals.db;
    if (!db) {
      return res.status(500).json({ error: "Database not connected" });
    }

    // Get email from token (not from client body)
    const ownerEmail = req.tokenData.email;
    console.log("owner email: ",ownerEmail)

    const obj = {
      stationName: req.body.stationName,
      location: req.body.location,
      ownerEmail: req.tokenData.email,   // ✅ always correct
      status: "pending",
      createdAt: new Date(),
      documentUrl: req.file ? `/uploads/${req.file.filename}` : null,
    };

    console.log("📥 Saving application:", obj);

    const result = await db.collection("Applications").insertOne(obj);
    const newApp = { ...obj, _id: result.insertedId };

    // Real-time notify admins
    if (req.app.locals.io) {
      req.app.locals.io.emit("newApplication", newApp);
    }

    res.status(201).json(newApp);
  } catch (err) {
    console.error("🔥 ownersetting POST error:", err);
    res.status(500).json({ error: err.message || "Internal Server Error" });
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

    // Fetch application to get ownerEmail
    const application = await OwnerSettingService.getApplicationById(req.params.id);

    if (req.body.status === "approved") {
      // send approval email to owner
      await emailjs.send(
        process.env.EMAILJS_SERVICE,
        process.env.EMAILJS_TEMPLATE_APPROVED,
        {
          stationName: application.stationName,
          location: application.location,
          to_email: application.ownerEmail,
        },
        process.env.EMAILJS_PUBLIC_KEY
      );
    }

    if (req.body.status === "rejected") {
      // send rejection email
      await emailjs.send(
        process.env.EMAILJS_SERVICE,
        process.env.EMAILJS_TEMPLATE_REJECTED,
        {
          stationName: application.stationName,
          location: application.location,
          to_email: application.ownerEmail,
        },
        process.env.EMAILJS_PUBLIC_KEY
      );
    }

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
