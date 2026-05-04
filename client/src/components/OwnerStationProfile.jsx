import React, { useEffect, useState } from "react";
import axios from "axios";

const OwnerStationProfile = () => {
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    stationName: "",
    ownerName: "",
    contactNumber: "",
    email: "",
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

  // Fetch existing station data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_API_URL}/owner/station`,
          { withCredentials: true }
        );

        if (res.data) {
          setFormData({
            ...res.data,
            documents: null, // avoid storing file path in file input
          });
        }
      } catch (err) {
        console.error("❌ Error loading profile:", err);
      }
      setLoading(false);
    };

    fetchData();
  }, []);

  // Handle input field change
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle checkbox for arrays
  const handleMultiSelect = (e, field) => {
    const value = e.target.value;
    const checked = e.target.checked;

    if (checked) {
      setFormData({ ...formData, [field]: [...formData[field], value] });
    } else {
      setFormData({
        ...formData,
        [field]: formData[field].filter((item) => item !== value),
      });
    }
  };

  // File upload (documents)
  const handleFileChange = (e) => {
    setFormData({ ...formData, documents: e.target.files[0] });
  };

  // Update Profile
  const handleSave = async () => {
    const data = new FormData();

    Object.keys(formData).forEach((key) => {
      if (Array.isArray(formData[key])) {
        formData[key].forEach((item) => data.append(key, item));
      } else {
        data.append(key, formData[key]);
      }
    });

    try {
      await axios.put(
        `${import.meta.env.VITE_API_URL}/owner/station/update`,
        data,
        { withCredentials: true }
      );

      alert("✅ Station Profile Updated Successfully!");

    } catch (err) {
      console.error("❌ Update error:", err);
      alert("Failed to update station profile.");
    }
  };

  if (loading) return <p>Loading profile...</p>;

  return (
    <div className="container mt-4">
      <h2>Station Profile</h2>

      <div className="card p-4 mt-3">
        
        {/* Basic Information */}
        <label className="mt-2">Station Name</label>
        <input className="form-control" name="stationName" value={formData.stationName} onChange={handleChange} />

        <label className="mt-2">Owner Name</label>
        <input className="form-control" name="ownerName" value={formData.ownerName} onChange={handleChange} />

        <label className="mt-2">Contact Number</label>
        <input className="form-control" name="contactNumber" value={formData.contactNumber} onChange={handleChange} />

        <label className="mt-2">Email</label>
        <input className="form-control" name="email" value={formData.email} onChange={handleChange} />

        {/* Address */}
        <label className="mt-3 fw-bold">Address Details</label>

        <input className="form-control mt-1" placeholder="Address" name="address" value={formData.address} onChange={handleChange} />
        <input className="form-control mt-1" placeholder="City" name="city" value={formData.city} onChange={handleChange} />
        <input className="form-control mt-1" placeholder="State" name="state" value={formData.state} onChange={handleChange} />
        <input className="form-control mt-1" placeholder="Pincode" name="pincode" value={formData.pincode} onChange={handleChange} />

        {/* Coordinates */}
        <label className="mt-3 fw-bold">Coordinates</label>
        <input className="form-control mt-1" placeholder="Latitude" name="latitude" value={formData.latitude} onChange={handleChange} />
        <input className="form-control mt-1" placeholder="Longitude" name="longitude" value={formData.longitude} onChange={handleChange} />

        {/* Charger Types */}
        <label className="mt-3 fw-bold">Charger Types</label>
        <div>
          {["Type-1", "Type-2", "CCS", "CHAdeMO", "GB/T"].map((type) => (
            <div key={type}>
              <input
                type="checkbox"
                value={type}
                checked={formData.chargerTypes.includes(type)}
                onChange={(e) => handleMultiSelect(e, "chargerTypes")}
              />{" "}
              {type}
            </div>
          ))}
        </div>

        <label className="mt-3">Number of Chargers</label>
        <input className="form-control" name="numChargers" value={formData.numChargers} onChange={handleChange} />

        <label className="mt-3">Power Capacity (kW)</label>
        <input className="form-control" name="powerCapacity" value={formData.powerCapacity} onChange={handleChange} />

        <label className="mt-3">Operating Hours</label>
        <input className="form-control" name="operatingHours" value={formData.operatingHours} onChange={handleChange} />

        <label className="mt-3">Pricing Model</label>
        <input className="form-control" name="pricingModel" value={formData.pricingModel} onChange={handleChange} />

        {/* Amenities */}
        <label className="mt-3 fw-bold">Amenities</label>
        <div>
          {["Parking", "Washroom", "Restaurant", "Wifi", "Rest Area"].map((item) => (
            <div key={item}>
              <input
                type="checkbox"
                value={item}
                checked={formData.amenities.includes(item)}
                onChange={(e) => handleMultiSelect(e, "amenities")}
              />{" "}
              {item}
            </div>
          ))}
        </div>

        <label className="mt-3">License ID</label>
        <input className="form-control" name="licenseId" value={formData.licenseId} onChange={handleChange} />

        <label className="mt-2">GST Number</label>
        <input className="form-control" name="gstNumber" value={formData.gstNumber} onChange={handleChange} />

        {/* Documents Upload */}
        <label className="mt-3">Upload Station Documents</label>
        <input type="file" className="form-control" onChange={handleFileChange} />

        <button className="btn btn-primary mt-4" onClick={handleSave}>
          Save Profile
        </button>

      </div>
    </div>
  );
};

export default OwnerStationProfile;
