import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import styles from "./bookingdashboard.module.css";
import EVTracker from "./evTracker";

function BookingDashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const selectedStation = location.state?.station; // station from previous page

  const [formData, setFormData] = useState({
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
      const bookingData = {
        ...formData,
        stationName: selectedStation?.name || "Unknown",
      };

      const res = await fetch(
        `${
          import.meta.env.VITE_API_URL || "http://localhost:3002"
        }/user/booking`,
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

      // ✅ Navigate to EVTracker after successful booking
      navigate("/map");

    } catch (err) {
      setMessage(`❌ ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
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

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className={styles.button}
        >
          {loading ? "Booking..." : "Book Slot"}
        </button>
      </form>
    </div>
  );
}

export default BookingDashboard;
