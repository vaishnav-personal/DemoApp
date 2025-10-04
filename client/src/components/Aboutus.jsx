import React from "react";
import { useNavigate } from "react-router-dom";

export default function Aboutus() {
  const navigate = useNavigate();

  const backgroundStyle = {
    backgroundImage: `url(https://images.unsplash.com/photo-1666919643134-d97687c1826c?q=80&w=871&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D)`,
    backgroundSize: "cover",
    backgroundRepeat: "no-repeat",
    backgroundPosition: "center",
    minHeight: "100vh",
    color: "white",
  };

  return (
    <div
      style={backgroundStyle}
      className="d-flex align-items-center justify-content-center p-4"
    >
      <div className="col-lg-7 col-md-9 col-sm-11 p-5 bg-light bg-opacity-50 rounded-4 shadow-lg text-center animate__animated animate__fadeInDown">
        <h1 className="fw-bold text-dark mb-4">
          About Our EV Booking Platform ⚡
        </h1>
        <p className="fs-5 mb-3 text-dark">
          Welcome to our Electric Vehicle (EV) slot booking platform! Our
          mission is to make EV charging seamless, fast, and reliable. Whether
          you’re commuting daily or planning a long trip, our system helps you:
        </p>
        <ul className="text-start mx-auto fs-5 text-dark" style={{ maxWidth: "600px" }}>
          <li>🔋 Find the nearest charging station in real-time.</li>
          <li>⏱️ Book slots in advance to avoid waiting lines.</li>
          <li>💳 Manage secure payments for hassle-free charging.</li>
          <li>📊 Track your charging history and expenses.</li>
          <li>🌱 Contribute to a greener future by driving electric.</li>
        </ul>
        <p className="fs-6 mt-4 text-dark">
          Our platform is built with modern technology to ensure accuracy,
          security, and a smooth user experience.
        </p>
        <button
          className="btn btn-light btn-lg mt-4 px-5 text-dark"
          onClick={() => navigate("/")}
        >
          ⬅ Back to Home
        </button>
      </div>
    </div>
  );
}
