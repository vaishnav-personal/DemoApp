import React, { useState, useEffect } from "react";
import SignupLoginOwner from "./SignupLoginOwner";
import OwnerDashboard from "./OwnerDashboard";
import StationApplicationForm from "./StationApplicationForm";

const OwnerMain = () => {
  const [step, setStep] = useState("loading"); // auth → application → hold → dashboard
  const [owner, setOwner] = useState(null);

  // Check owner session + status
  useEffect(() => {
    const fetchOwner = async () => {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_URL || "http://localhost:3002"}/owner/hello`,
          { credentials: "include" }
        );

        if (!res.ok) {
          setStep("auth");
          return;
        }

        const data = await res.json();
        setOwner(data);

        if (!data.hasApplied) {
          setStep("application"); // must fill form
        } else if (data.status === "hold") {
          setStep("hold"); // waiting for admin approval
        } else if (data.status === "approved") {
          setStep("dashboard"); // approved users go to dashboard
        } else {
          setStep("application"); // fallback
        }
      } catch (err) {
        console.error("Error fetching owner:", err);
        setStep("auth");
      }
    };

    fetchOwner();
  }, []);

  // After login/signup → re-run check
  const handleAuthSuccess = () => {
    setStep("loading"); // triggers useEffect
  };

  const handleApplicationSubmit = () => {
    setStep("hold"); // directly show hold after submitting
  };

  if (step === "loading") return <p>Loading...</p>;
  if (step === "auth") return <SignupLoginOwner onAuthSuccess={handleAuthSuccess} />;
  if (step === "application") return <StationApplicationForm onSubmit={handleApplicationSubmit} />;
  if (step === "hold")
    return (
      <div className="container mt-5 text-center">
        <h3>Application Under Review</h3>
        <p>Your request has been sent to admin. Please wait up to 24 hours.</p>
      </div>
    );
  if (step === "dashboard"){
    return <OwnerDashboard />;
    
  } 

  return null;
};

export default OwnerMain;
