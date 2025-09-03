import React, { useState } from "react";

const StationApplicationForm = ({ onSubmit }) => {
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

  const handleSubmit = (e) => {
    e.preventDefault();
    // send to backend here (FormData for file upload)
    console.log("Application submitted", formData);
    onSubmit(); // tell parent
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
        <button type="submit" className="btn btn-success w-100">
          Submit Application
        </button>
      </form>
    </div>
  );
};
export default StationApplicationForm;