
import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import styles from "./bookingdashboard.module.css";

export default function bookingDashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const selectedStation = location.state?.station;

  const backgroundStyle = {
    backgroundImage: `url(https://images.unsplash.com/photo-1666919643134-d97687c1826c?q=80&w=871&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D)`,
    backgroundSize: "cover",
    backgroundRepeat: "no-repeat",
    backgroundPosition: "center",
    minHeight: "100vh",
    width: "100%",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: "20px",
    color: "white",
  };

  const [formData, setFormData] = useState({
    stationName: selectedStation?.name || "",
    batteryType: "Li-ion",
    chargerType: "CCS2",
    date: "",
    time: "",
  });

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const bookingData = { ...formData };

      const res = await fetch(
        `${import.meta.env.VITE_API_URL || "http://localhost:3002"}/user/booking`,
        {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(bookingData),
        }
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Booking failed");

      setMessage(
        `✅ Slot booked at ${bookingData.stationName} on ${formData.date} at ${formData.time}`
      );

      navigate("/map");
    } catch (err) {
      setMessage(`❌ ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={backgroundStyle}>
      <div className={styles.bookingContainer}>
        <h2 className={styles.heading}>Book a Charging Slot</h2>

        {message && (
          <div
            className={`${styles.message} ${
              message.startsWith("✅") ? styles.success : styles.error
            }`}
          >
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className={styles.form}>
          {/* Station Name */}
          <div>
            <label className={styles.label}>Station Name</label>
            <input
              type="text"
              name="stationName"
              value={formData.stationName}
              onChange={handleChange}
              placeholder="Enter station name"
              className={styles.input}
              required
            />
          </div>

          {/* Battery Type */}
          <div>
            <label className={styles.label}>Battery Type</label>
            <select
              name="batteryType"
              value={formData.batteryType}
              onChange={handleChange}
              className={styles.input}
            >
              <option value="Li-ion">Li-ion</option>
              <option value="Lead-acid">Lead-acid</option>
              <option value="NiMH">NiMH</option>
            </select>
          </div>

          {/* Charger Type */}
          <div>
            <label className={styles.label}>Charger Type</label>
            <select
              name="chargerType"
              value={formData.chargerType}
              onChange={handleChange}
              className={styles.input}
            >
              <option value="CCS2">CCS2</option>
              <option value="CHAdeMO">CHAdeMO</option>
              <option value="Type2 AC">Type2 AC</option>
              <option value="Bharat AC/DC">Bharat AC/DC</option>
            </select>
          </div>

          {/* Date */}
          <div>
            <label className={styles.label}>Date</label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              required
              className={styles.input}
            />
          </div>

          {/* Time */}
          <div>
            <label className={styles.label}>Time Slot</label>
            <input
              type="time"
              name="time"
              value={formData.time}
              onChange={handleChange}
              required
              className={styles.input}
            />
          </div>

          {/* Buttons */}
          <button type="submit" disabled={loading} className={styles.button}>
            {loading ? "Booking..." : "Book Slot"}
          </button>
          <button
            type="button"
            className="btn btn-light btn-lg mt-2 px-5"
            onClick={() => navigate("/")}
          >
            ⬅ Back to Home
          </button>
        </form>
      </div>
    </div>
  );
}



