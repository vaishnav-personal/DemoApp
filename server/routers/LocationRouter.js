const express = require("express");
const router = express.Router();

const app=express();
app.use(express.json());

app.post("/", (req, res) => {
  const { latitude, longitude } = req.body;
  console.log("Received location:", latitude, longitude);

  // Example: later call Google Places API using these coords
  res.json({ message: "Location received", latitude, longitude });
});
module.exports=router