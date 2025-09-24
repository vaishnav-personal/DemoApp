import React, { useState } from "react";
import axios from "axios";
import emailjs from "emailjs-com";

const StationApplicationForm = ({ onSubmit, ownerEmail }) => {
  const [formData, setFormData] = useState({
    stationName: "",
    location: "",
    documents: null,
  });

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
  };

  const sendEmails = (stationName, location, documentUrl, ownerEmail) => {
    // Send email to Admin
    emailjs.send(
      import.meta.env.VITE_EMAILJS_SERVICE_ID,
      import.meta.env.VITE_EMAILJS_TEMPLATE_ADMIN,
      {
        stationName,
        location,
        ownerEmail,
        documentUrl: documentUrl || "No document uploaded",
      },
      import.meta.env.VITE_EMAILJS_PUBLIC_KEY
    );

    // Send email to Owner
    emailjs.send(
      import.meta.env.VITE_EMAILJS_SERVICE_ID,
      import.meta.env.VITE_EMAILJS_TEMPLATE_OWNER,
      {
        stationName,
        location,
        ownerEmail,
        documentUrl: documentUrl || "No document uploaded",
      },
      import.meta.env.VITE_EMAILJS_PUBLIC_KEY
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const data = new FormData();
    data.append("stationName", formData.stationName);
    data.append("location", formData.location);
    data.append("ownerEmail", ownerEmail);
    if (formData.documents) {
      data.append("file", formData.documents);
    }

    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL || "http://localhost:3002"}/ownersetting`,
        data,
        {
          withCredentials: true,
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      console.log("✅ Application submitted:", res.data);

      // Send notification emails
      sendEmails(
        formData.stationName,
        formData.location,
        res.data.documentUrl,
        ownerEmail
      );

      alert("Application submitted successfully!");
      onSubmit();
    } catch (err) {
      console.error("❌ Error submitting application:", err.response?.data || err.message);
      alert("Failed to submit application.");
    }
  };

  const handleSkip = () => {
    console.log("Application skipped — forcing hold state");
    onSubmit();
  };

  return (
    <div className="container mt-5" style={{ maxWidth: "500px" }}>
      <h3>Station Application Form</h3>
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <input
            type="text"
            name="stationName"
            className="form-control"
            placeholder="Station Name"
            value={formData.stationName}
            onChange={handleChange}
            required
          />
        </div>
        <div className="mb-3">
          <input
            type="text"
            name="location"
            className="form-control"
            placeholder="Location"
            value={formData.location}
            onChange={handleChange}
            required
          />
        </div>
        <div className="mb-3">
          <input
            type="file"
            name="documents"
            className="form-control"
            onChange={handleChange}
            required
          />
        </div>

        <div className="d-flex gap-2">
          <button type="submit" className="btn btn-success w-100">
            Submit Application
          </button>
          <button
            type="button"
            className="btn btn-secondary w-100"
            onClick={handleSkip}
          >
            Skip if already applied
          </button>
        </div>
      </form>
    </div>
  );
};

export default StationApplicationForm;
