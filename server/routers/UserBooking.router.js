const express = require("express");
const router = express.Router();
const BookingService = require("../services/userbooking.service");
const { ObjectId } = require("mongodb");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const app=express();
app.use(cookieParser());


// ================= MIDDLEWARE =================
function requireAuth(req, res, next) {
  const token = req.cookies?.token;
  // console.log("Token from cookies:", token);
  if (!token) return res.status(401).json({ error: "Unauthorized" });

  try {
    const decoded = jwt.verify(token, process.env.SECRET_KEY || "dev_secret");
    req.tokenData = decoded;
    
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid token" });
  }
}

function allowToAdminOnly(req, res, next) {
  if (!req.tokenData) return res.status(401).json({ message: "Unauthorized" });
  if (req.tokenData.role === "admin") return next();
  return res.status(403).json({ message: "Forbidden" });
}

// ================= ROUTES =================

// Get all bookings (admin only)
router.get("/", requireAuth, allowToAdminOnly, async (req, res, next) => {
  try {
    const list = await BookingService.getAllBooking();
    console.log("stations are: ", list)
    res.status(200).json(list);

  } catch (err) {
    next(err);
  }
});

// Get booking by ID 
router.get("/:id", requireAuth, async (req, res, next) => {
  try {
    const booking = await BookingService.getBookingById(req.params.id);
    if (!booking) return res.status(404).json({ message: "Booking not found" });
    res.status(200).json(booking);
  } catch (err) {
    next(err);
  }
});

// Get booking by station
router.get("/station/:stationName", requireAuth, async (req, res, next) => {
  try {
    const bookings = await BookingService.getBookingByStation(req.params.stationName);
    res.status(200).json(bookings);
  } catch (err) {
    next(err);
  }
});

// Add booking (with availability check)
router.post("/", requireAuth, async (req, res, next) => {
  try {
    const { batteryType, chargerType,date,  time,stationName } = req.body;
    // console.log( batteryType, chargerType,date,  time,stationName );
    const obj = {
      batteryType,
      chargerType,
      date,
      time,stationName ,
      userId: req.tokenData._id,
      isbooked: true,
      createdAt: new Date()
    };
      console.log("the object is",obj)
    // Check if slot already booked
    const existing = await BookingService.isBooking(obj);
    
    if (existing) {
      console.log("yes exist");
      return res.status(409).json({ message: "Slot already booked" });
    }
    const booking = await BookingService.addBooking(obj);
    res.status(201).json({ message: "Booking created", booking });
  } catch (err) {
    next(err);
  }
});


// Delete booking
router.delete("/:id", requireAuth, async (req, res, next) => {
  try {
    const result = await BookingService.deleteBooking(req.params.id);
    if (result.deletedCount === 0) {
      return res.status(404).json({ message: "Booking not found" });
    }
    res.status(200).json({ message: "Booking deleted" });
  } catch (err) {
    next(err);
  }
});

// ================= EXPORT =================
module.exports = router;
