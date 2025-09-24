const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { ObjectId } = require("mongodb");

const router = express.Router();

// ✅ Admin Login
router.post("/login", async (req, res) => {
  try {

    const { email, password } = req.body;
    const db = req.app.locals.db; // Use single DB
    console.log(db);
    const admin = await db.collection("Admin").findOne({ email, role: "admin" });
    console.log(admin);
    if (!admin) {
      return res.status(401).json({ error: "Wrong email or not an admin" });
    }

    const validPassword = await bcrypt.compare(password, admin.passwordHash);
    if (!validPassword) {
      return res.status(401).json({ error: "Wrong password" });
    }

    const token = jwt.sign(
      { _id: admin._id.toString(), role: "admin", email: admin.email },
      process.env.SECRET_KEY || "dev_secret",
      { expiresIn: "1h" }
    );

    res.cookie("token", token, {
      httpOnly: true,
      sameSite: "Lax",
      secure: false,
      maxAge: 1000 * 60 * 60,
    });

    return res.json({
      message: "Login success",
      admin: { email: admin.email, role: "admin" },
    });

  } catch (err) {
    console.error("Admin login error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// ✅ Fetch Owner Applications
router.get("/applications", async (req, res) => {
  try {
    const db = req.app.locals.db;
    const apps = await db.collection("Applications").find().toArray();
    res.json(apps);
  } catch (err) {
    console.error("Fetch applications error:", err);
    res.status(500).json({ error: "Failed to fetch applications" });
  }
});

// ✅ Approve / Reject Application

router.put("/applications/:id", async (req, res) => {
  try {
    const db = req.app.locals.db;
    const { status } = req.body;

    // 1. Update the status of the application
    const result = await db.collection("Applications").updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set: { status, updatedAt: new Date() } }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: "Application not found" });
    }

    // 2. If approved → also update Owner record
    if (status === "approved") {
      const application = await db.collection("Applications").findOne({
        _id: new ObjectId(req.params.id),
      });

      console.log("found application:", application);

      if (application) {
        await db.collection("Owners").updateOne(
          { emailId: application.ownerEmail },   // ✅ fix field name
          { $set: { status: "approved" } }
        );
        console.log("changing owner record")
      }
    }

    res.json({ message: `Application ${status}` });
  } catch (err) {
    console.error("Update application error:", err);
    res.status(500).json({ error: "Failed to update application" });
  }
});


// ✅ Check Admin Authentication
router.get("/hello", (req, res) => {
  const token = req.cookies?.token;
  if (!token) return res.status(401).json({ error: "Unauthorized" });

  try {
    const decoded = jwt.verify(token, process.env.SECRET_KEY || "dev_secret");

    if (decoded.role !== "admin") {
      return res.status(403).json({ error: "Forbidden" });
    }

    res.json({ _id: decoded._id, role: "admin", email: decoded.email });
  } catch {
    res.status(401).json({ error: "Invalid token" });
  }
});

module.exports = router;
