// OwnerMain.jsx
import React, { useState, useEffect } from "react";
import SignupLoginOwner from "./SignupLoginOwner";
import OwnerDashboard from "./OwnerDashboard";
import StationApplicationForm from "./StationApplicationForm";

const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3002";

const OwnerMain = () => {
  const [step, setStep] = useState("loading");
  const [owner, setOwner] = useState(null);

  // Check if owner session exists
  const fetchOwner = async () => {
  try {
    const res = await fetch(`${apiUrl}/owner/hello`, {
      method: "GET",
      credentials: "include",
    });
console.log(res);
    if (!res.ok) throw new Error("Auth failed");

    const data = await res.json();
    setOwner(data);
    console.log("printing1:",data)
    if (data.status == "new") {
      setStep("application");
      console.log("setting application");
      
    } else if (data.status === "approved") {
      console.log("setting dashboard")
      setStep("dashboard"); // ✅ Show dashboard if approved
    } else {
      console.log("setting hold")
      setStep("hold"); // pending/hold
    }
  } catch (err) {
    console.error("Error fetching owner:", err);
    setStep("auth");
  }
};


  useEffect(() => {
    fetchOwner();
  }, []);

  const handleAuthSuccess = () => {
    fetchOwner();
  };

  const handleApplicationSubmit = () => {
    setStep("hold");
  };

  if (step === "loading") return <p>Loading...</p>;
  if (step === "auth")
    return <SignupLoginOwner onAuthSuccess={handleAuthSuccess} />;
  if (step === "application")
    return <StationApplicationForm onSubmit={handleApplicationSubmit} />;
  if (step === "hold")
    return (
      <div className="container mt-5 text-center">
        <h3>Application Under Review</h3>
        <p>Your request has been sent to admin. Please wait up to 24 hours.</p>
      </div>
    );
  if (step === "dashboard") return <OwnerDashboard />;

  return null;
};

export default OwnerMain;