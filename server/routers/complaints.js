// backend/routes/complaints.js
const express = require("express");
const router = express.Router();
const Complaint = require("../services/complaints.service");

router.post("/", async (req, res) => {
  try {
    const { name, email, message } = req.body;

    // Add complaint with default status
    const complaint = await Complaint.addComplaints({
      name,
      email,
      message,
      status: "Pending", // default status
    });

    console.log("Complaint saved:", complaint);

    res.status(201).json({
      success: true,
      message: "Complaint submitted successfully",
      complaint,
    });
  } catch (err) {
    console.error("Error adding complaint:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
