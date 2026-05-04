import React, { useState } from "react";
import axios from "axios";
import emailjs from "emailjs-com";


export default function StationApplicationForm({ onSubmit, ownerEmail }) {
  const [formData, setFormData] = useState({
    stationName: "",
    ownerName: "",
    contactNumber: "",
    email: ownerEmail || "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    latitude: "",
    longitude: "",
    chargerTypes: [],
    numChargers: "",
    powerCapacity: "",
    operatingHours: "",
    pricingModel: "",
    amenities: [],
    licenseId: "",
    gstNumber: "",
    documents: null,
  });

  const chargerOptions = ["CCS2", "CHAdeMO", "Type-2 AC", "GB/T"];
  const amenityOptions = ["Parking", "Washrooms", "Food Court", "Lounge", "24/7 Security"];

  const handleChange = (e) => {
    const { name, value, files, type, checked } = e.target;

    if (type === "checkbox") {
      if (amenityOptions.includes(value)) {
        setFormData(prev => ({
          ...prev,
          amenities: checked ? [...prev.amenities, value] : prev.amenities.filter(a => a !== value),
        }));
      } else if (chargerOptions.includes(value)) {
        setFormData(prev => ({
          ...prev,
          chargerTypes: checked ? [...prev.chargerTypes, value] : prev.chargerTypes.filter(c => c !== value),
        }));
      }
    } else {
      setFormData(prev => ({ ...prev, [name]: files ? files[0] : value }));
    }
  };

  const handleSubmit = async (e) => {
  e.preventDefault();

  const data = new FormData();
  Object.keys(formData).forEach((key) => {
    if (Array.isArray(formData[key])) {
      formData[key].forEach((item) => data.append(key, item));
    } else {
      data.append(key, formData[key]);
    }
  });

  console.log("Submitting application with data:", formData);

  try {
    // 1. Submit to backend
    const res = await axios.post(
      `${import.meta.env.VITE_API_URL || "http://localhost:3002"}/ownersetting`,
      data,
      { withCredentials: true }
    );

    console.log("✅ Application submitted:", res.data);

    // 2. Send EmailJS notification to admin
    try {
      await emailjs.send(
        import.meta.env.VITE_EMAILJS_SERVICE_ID,
        import.meta.env.VITE_EMAILJS_TEMPLATE_ADMIN, // single admin template
        {
          stationName: res.data.stationName,
          ownerName: res.data.ownerName,
          contactNumber: res.data.contactNumber,
          email: res.data.ownerEmail,
          address: res.data.address,
          city: res.data.city,
          state: res.data.state,
          pincode: res.data.pincode,
          latitude: res.data.latitude,
          longitude: res.data.longitude,
          chargerTypes: res.data.chargerTypes.join(", "),
          numChargers: res.data.numChargers,
          powerCapacity: res.data.powerCapacity,
          operatingHours: res.data.operatingHours,
          pricingModel: res.data.pricingModel,
          amenities: res.data.amenities.join(", "),
          licenseId: res.data.licenseId,
          gstNumber: res.data.gstNumber,
          documentUrl: res.data.documentUrl || "No document uploaded",
        },
        import.meta.env.VITE_EMAILJS_PUBLIC_KEY
      );
      console.log("📧 Admin notified via EmailJS");
    } catch (emailErr) {
      console.error("⚠️ Failed to send admin email:", emailErr);
    }

    // 3. Optionally, send confirmation email to owner
    try {
      await emailjs.send(
        import.meta.env.VITE_EMAILJS_SERVICE_ID,
        import.meta.env.VITE_EMAILJS_TEMPLATE_OWNER, // another template (or same one with conditional)
        {
          to_email: res.data.ownerEmail,
          ownerName: res.data.ownerName,
          stationName: res.data.stationName,
        },
        import.meta.env.VITE_EMAILJS_PUBLIC_KEY
      );
      console.log("📧 Confirmation email sent to owner");
    } catch (emailErr) {
      console.error("⚠️ Failed to send owner confirmation:", emailErr);
    }

    alert("✅ Application submitted successfully! Wait for admin approval.");
    onSubmit(); // navigate or close modal
  } catch (err) {
    console.error("❌ Error submitting application:", err.response?.data || err.message);
    alert("Failed to submit application.");
  }
};


  return (
    <div className="container mt-5" style={{ maxWidth: "700px" }}>
      <h3 className="mb-4">EV Station Application Form</h3>
      <form onSubmit={handleSubmit}>
        {/* Station Info */}
        <div className="mb-3">
          <input type="text" name="stationName" className="form-control" placeholder="Station Name" value={formData.stationName} onChange={handleChange} required />
        </div>
        <div className="mb-3">
          <input type="text" name="ownerName" className="form-control" placeholder="Owner / Company Name" value={formData.ownerName} onChange={handleChange} required />
        </div>
        <div className="mb-3">
          <input type="tel" name="contactNumber" className="form-control" placeholder="Contact Number" value={formData.contactNumber} onChange={handleChange} required />
        </div>

        {/* Address */}
        <div className="mb-3">
          <input type="text" name="address" className="form-control" placeholder="Street Address" value={formData.address} onChange={handleChange} required />
        </div>
        <div className="row">
          <div className="col-md-4 mb-3">
            <input type="text" name="city" className="form-control" placeholder="City" value={formData.city} onChange={handleChange} required />
          </div>
          <div className="col-md-4 mb-3">
            <input type="text" name="state" className="form-control" placeholder="State" value={formData.state} onChange={handleChange} required />
          </div>
          <div className="col-md-4 mb-3">
            <input type="text" name="pincode" className="form-control" placeholder="Pincode" value={formData.pincode} onChange={handleChange} required />
          </div>
        </div>

        {/* Coordinates */}
        <div className="row">
          <div className="col-md-6 mb-3">
            <input type="text" name="latitude" className="form-control" placeholder="Latitude" value={formData.latitude} onChange={handleChange} />
          </div>
          <div className="col-md-6 mb-3">
            <input type="text" name="longitude" className="form-control" placeholder="Longitude" value={formData.longitude} onChange={handleChange} />
          </div>
        </div>

        {/* Technical Info */}
        <div className="mb-3">
          <label className="form-label fw-bold">Charger Types</label>
          <div className="d-flex flex-wrap gap-3">
            {chargerOptions.map(type => (
              <div key={type} className="form-check">
                <input type="checkbox" name="chargerTypes" value={type} className="form-check-input" onChange={handleChange} />
                <label className="form-check-label">{type}</label>
              </div>
            ))}
          </div>
        </div>
        <div className="row">
          <div className="col-md-6 mb-3">
            <input type="number" name="numChargers" className="form-control" placeholder="Number of Chargers" value={formData.numChargers} onChange={handleChange} required />
          </div>
          <div className="col-md-6 mb-3">
            <input type="text" name="powerCapacity" className="form-control" placeholder="Power Capacity per Charger (kW)" value={formData.powerCapacity} onChange={handleChange} />
          </div>
        </div>

        {/* Operational */}
        <div className="mb-3">
          <input type="text" name="operatingHours" className="form-control" placeholder="Operating Hours" value={formData.operatingHours} onChange={handleChange} />
        </div>
        <div className="mb-3">
          <input type="text" name="pricingModel" className="form-control" placeholder="Pricing Model" value={formData.pricingModel} onChange={handleChange} />
        </div>

        {/* Amenities */}
        <div className="mb-3">
          <label className="form-label fw-bold">Amenities</label>
          <div className="d-flex flex-wrap gap-3">
            {amenityOptions.map(a => (
              <div key={a} className="form-check">
                <input type="checkbox" name="amenities" value={a} className="form-check-input" onChange={handleChange} />
                <label className="form-check-label">{a}</label>
              </div>
            ))}
          </div>
        </div>

        {/* Compliance */}
        <div className="mb-3">
          <input type="text" name="licenseId" className="form-control" placeholder="Government License / Permit ID" value={formData.licenseId} onChange={handleChange} />
        </div>
        <div className="mb-3">
          <input type="text" name="gstNumber" className="form-control" placeholder="GST / Tax ID" value={formData.gstNumber} onChange={handleChange} />
        </div>
        <div className="mb-3">
          <label className="form-label">Upload Documents</label>
          <input type="file" name="documents" className="form-control" onChange={handleChange} multiple />
        </div>

        {/* Submit */}
        <div className="d-flex gap-2">
          <button type="submit" className="btn btn-success w-100">Submit Application</button>
          <button type="button" className="btn btn-secondary w-100" onClick={onSubmit}>Skip</button>
        </div>
      </form>
    </div>
  );
}
