import React, { useState } from "react";
import axios from "axios";
import emailjs from "emailjs-com";

const StationApplicationForm = ({ onSubmit }) => {
  const [formData, setFormData] = useState({
    stationName: "",
    location: "",
    documents: null,
  });
  //email service
const sendEmails = (formData, documentUrl, ownerEmail) => {
  // Send to Admin
  emailjs.send(
    import.meta.env.VITE_EMAILJS_SERVICE_ID,
    import.meta.env.VITE_EMAILJS_TEMPLATE_ADMIN,
    {
      stationName: formData.stationName,
      location: formData.location,
      ownerEmail,
      documentUrl: documentUrl || "No document uploaded",
    },
    import.meta.env.VITE_EMAILJS_PUBLIC_KEY
  );

  // Send to Owner
  emailjs.send(
    import.meta.env.VITE_EMAILJS_SERVICE_ID,
    import.meta.env.VITE_EMAILJS_TEMPLATE_OWNER,
    {
      stationName: formData.stationName,
      location: formData.location,
      ownerEmail,
      documentUrl: documentUrl || "No document uploaded",
    },
    import.meta.env.VITE_EMAILJS_PUBLIC_KEY
  );
};

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
  };

const handleSubmit = async (e) => {
  e.preventDefault();

  try {
    const data = new FormData();
    data.append("stationName", formData.stationName);
    data.append("location", formData.location);
    if (formData.documents) {
      data.append("documents", formData.documents);
    }

    const res = await axios.post(
      `${import.meta.env.VITE_API_URL || "http://localhost:3002"}/ownersetting/`,
      data,
      { withCredentials: true }
    );

    console.log("Application submitted successfully:", res.data);

    // 👇 Use res.data safely
    const fileUrl = res.data.documentUrl || "No document uploaded";

    // Ideally replace with logged-in owner email
    const ownerEmail = "owner@example.com";

    sendEmails(formData, fileUrl, ownerEmail);

    onSubmit(); // go to "hold" page
  } catch (err) {
    console.error("Error submitting application:", err.response?.data || err);
    alert("Failed to submit application");
  }
};


  const handleSkip = () => {
    console.log("Application skipped — forcing hold state");
    onSubmit(); // same as submitted → parent will show hold page
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
            Skip this,if already applied
          </button>
        </div>
      </form>
    </div>
  );
};

export default StationApplicationForm;
