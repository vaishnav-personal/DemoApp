
import React from "react";
import { useNavigate } from "react-router-dom";

export default function Help() {
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
    <div style={backgroundStyle} className="d-flex align-items-center justify-content-center p-4">
      <div className="col-lg-7 col-md-9 col-sm-11 p-5 bg-light bg-opacity-50 rounded-4 shadow-lg text-center animate__animated animate__fadeInDown">
        <h1 className="fw-bold text-info mb-4">Help & Complaints 🙋</h1>
        <p className="fs-5 mb-3 text-dark">
          Need assistance? We’re here to help you with any issues related to EV slot booking, 
          payments, or account management.  
        </p>
        <p className="fs-6 mb-4 text-dark">
          Please use the form below to submit your complaint or feedback.  
          Our support team will get back to you as soon as possible.
        </p>

        <form className="text-start mx-auto" style={{ maxWidth: "500px" }} >
          <div className="mb-3 text-dark">
            <label className="form-label">Your Name</label>
            <input type="text" className="form-control" placeholder="Enter your name" />
          </div>

          <div className="mb-3 text-dark">
            <label className="form-label">Email Address</label>
            <input type="email" className="form-control text-dark" placeholder="Enter your email" />
          </div>

          <div className="mb-3 text-dark">
            <label className="form-label">Message / Complaint</label>
            <textarea className="form-control" rows="4" placeholder="Describe your issue"></textarea>
          </div>

          <button type="submit" className="btn btn-info w-100 mb-3">
            Submit
          </button>
        </form>

        <button
          className="btn btn-light btn-lg mt-2 px-5"
          onClick={() => navigate("/")}
        >
          ⬅ Back to Home
        </button>
      </div>
    </div>
  );
}

