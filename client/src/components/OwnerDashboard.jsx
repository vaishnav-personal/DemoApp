//this page will see the owner request and send it to the admin 
//is owner in hold state=>24 hrs after login
//otherwise show him interface
// src/components/OwnerDashboard.jsx
import React, { useEffect, useState } from "react";

const OwnerDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [owner, setOwner] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOwner = async () => {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_URL || "http://localhost:3002"}/owner/hello`,
          { credentials: "include" } // send cookies (JWT)
        );
        if (!res.ok) throw new Error("Not authenticated");
        const data = await res.json();
        setOwner(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOwner();
  }, []);

  if (loading) return <p>Loading...</p>;
  if (error) return <p className="text-danger">Error: {error}</p>;

  // Check hold state
  if (owner?.status === "hold") {
    return (
      <div className="container mt-5 text-center">
        <h3>Welcome, {owner.name}</h3>
        <p>Your account is currently on hold.</p>
        <p>
          Your request has been sent to the admin. Please wait up to 24 hours
          for approval.
        </p>
      </div>
    );
  }

  // Otherwise show owner interface
  return (
    <div className="container mt-5">
      <h2>Owner Dashboard</h2>
      <p>Welcome, {owner?.name}!</p>

      {/* Here you can add features like: */}
      <ul>
        <li>Manage your charging stations</li>
        <li>View booking requests</li>
        <li>Update your profile</li>
      </ul>
    </div>
  );
};

export default OwnerDashboard;
