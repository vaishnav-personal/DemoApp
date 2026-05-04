
import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "../app.css";

const SignupLoginOwner = ({ onAuthSuccess }) => {
  const [mode, setMode] = useState("signup"); // "signup" or "login"
  const [formData, setFormData] = useState({
    name: "",
    emailId: "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (mode === "signup" && formData.password !== formData.confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    const endpoint = mode === "signup" ? "/owner/signup" : "/owner/login";

    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL || "http://localhost:3002"}${endpoint}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
          credentials: "include", // keep session cookie
        }
      );
      if (!res.ok) throw new Error("Auth failed");
      const data = await res.json();

      if (mode === "login") {
        alert("Login successful ✅");
        onAuthSuccess?.(data);
      } else {
        alert("Signup successful ✅");
        onAuthSuccess?.(data);
      }
    } catch (err) {
      console.error(err);
      alert("Something went wrong ❌");
    }
  };

  return (
    <div  className="container d-flex align-items-center justify-content-center vh-100 ">
      <div className="row w-100">
        <div className="col-md-6 offset-md-3">
          <div className="card shadow-lg border-0 rounded-4">
            <div className="card-header text-center bg-success text-white">
              <h3 className="mb-0">
                ⚡ {mode === "signup" ? "EV Station Owner Signup" : "EV Station Owner Login"}
              </h3>
            </div>
            <div className="card-body p-4">
              <form onSubmit={handleSubmit}>
                {mode === "signup" && (
                  <div className="mb-3">
                    <label className="form-label">Full Name</label>
                    <input
                      name="name"
                      type="text"
                      className="form-control"
                      placeholder="Enter your full name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                    />
                  </div>
                )}
                <div className="mb-3">
                  <label className="form-label">Email Address</label>
                  <input
                    name="emailId"
                    type="email"
                    className="form-control"
                    placeholder="owner@evstation.com"
                    value={formData.emailId}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Password</label>
                  <input
                    name="password"
                    type="password"
                    className="form-control"
                    placeholder="Enter password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                  />
                </div>
                {mode === "signup" && (
                  <div className="mb-3">
                    <label className="form-label">Confirm Password</label>
                    <input
                      name="confirmPassword"
                      type="password"
                      className="form-control"
                      placeholder="Re-enter password"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      required
                    />
                  </div>
                )}
                <div className="d-grid">
                  <button type="submit" className="btn btn-success">
                    {mode === "signup" ? "Create Account" : "Login"}
                  </button>
                </div>
              </form>
              <div className="mt-3 text-center">
                {mode === "signup" ? (
                  <p>
                    Already have an account?{" "}
                    <button
                      className="btn btn-link p-0 text-success"
                      onClick={() => setMode("login")}
                    >
                      Login here
                    </button>
                  </p>
                ) : (
                  <p>
                    Don’t have an account?{" "}
                    <button
                      className="btn btn-link p-0 text-success"
                      onClick={() => setMode("signup")}
                    >
                      Signup here
                    </button>
                  </p>
                )}
              </div>
            </div>
            <div className="card-footer text-center small text-muted">
              EV Charging Station Owner Portal ⚡
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignupLoginOwner;

