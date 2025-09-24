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
          console.log("HELLO RESPONSE:", data);
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

  // ✅ Handle owner status
  if (owner?.status === "hold") {
    // Calculate if 24h has passed since appliedAt
    const appliedAt = new Date(owner.appliedAt);
    const now = new Date();
    const hoursPassed = Math.floor((now - appliedAt) / (1000 * 60 * 60));

    return (
      <div className="container mt-5 text-center">
        <h3>Welcome, {owner.email}</h3>
        <p>Your account is currently on hold.</p>
        {hoursPassed < 24 ? (
          <p>
            Your request has been sent to the admin. Please wait up to 24 hours
            for approval.
          </p>
        ) : (
          <p>
            24 hours have passed since your request. Please contact support if
            you have not received approval.
          </p>
        )}
      </div>
    );
  }

  if (owner?.status === "pending") {
    return (
      <div className="container mt-5 text-center">
        <h3>Welcome, {owner.email}</h3>
        <p>Your application is under review by the admin.</p>
      </div>
    );
  }

  if (owner?.status === "rejected") {
    return (
      <div className="container mt-5 text-center">
        <h3>Welcome, {owner.email}</h3>
        <p className="text-danger">
          Unfortunately, your application was rejected. Please contact support
          or reapply with correct details.
        </p>
      </div>
    );
  }

  if (owner?.status === "approved") {
    return (
      <div className="container mt-5">
        <h2>Owner Dashboard</h2>
        <p>Welcome, {owner.email}!</p>

        {/* Owner features */}
        <ul>
          <li>Manage your charging stations</li>
          <li>View booking requests</li>
          <li>Update your profile</li>
        </ul>
      </div>
    );
  }

  return (
    <div className="container mt-5 text-center">
      <p>No application found. Please apply to open a station.</p>
    </div>
  );
};

export default OwnerDashboard;
