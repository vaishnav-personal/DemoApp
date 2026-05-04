import express from "express";
import multer from "multer";
import { requireAuth } from "../middlewares/auth.middleware.js";

const router = express.Router();

// Upload config
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) =>
    cb(null, Date.now() + "-" + file.originalname),
});

const upload = multer({ storage });

// ----------------------------
// GET Owner Station Profile
// ----------------------------
router.get("/station", requireAuth, async (req, res) => {
  try {
    const db = req.app.locals.db;
    const ownerEmail = req.tokenData.email;

    const data = await db
      .collection("StationApplications")
      .findOne({ ownerEmail });

    if (!data) return res.json(null);

    res.json(data);
  } catch (err) {
    console.error("🔥 GET /owner/station error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// ----------------------------
// UPDATE Owner Station Profile
// ----------------------------
router.put(
  "/station/update",
  requireAuth,
  upload.single("documents"),
  async (req, res) => {
    try {
      const db = req.app.locals.db;
      const ownerEmail = req.tokenData.email;

      const updates = { ...req.body };

      // Fix array fields
      ["chargerTypes", "amenities"].forEach((field) => {
        if (updates[field] && !Array.isArray(updates[field])) {
          updates[field] = [updates[field]];
        }
      });

      // If file uploaded
      if (req.file) {
        updates.documentUrl = `/uploads/${req.file.filename}`;
      }

      const updated = await db.collection("StationApplications").findOneAndUpdate(
        { ownerEmail },
        { $set: updates },
        { returnDocument: "after" }
      );

      res.json(updated.value);
    } catch (err) {
      console.error("🔥 PUT /owner/station/update error:", err);
      res.status(500).json({ error: "Failed to update profile" });
    }
  }
);

export default router;
