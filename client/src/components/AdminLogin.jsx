import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const AdminLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

const handleSubmit = async (e) => {
  e.preventDefault();
  setError(""); // Clear previous errors

  try {
    const res = await axios.post(
      `${import.meta.env.VITE_API_URL || "http://localhost:3002"}/admin/login`,
      { email, password },
      { withCredentials: true } // Important to send cookies (like auth token)
    );
    console.log("Login response:", res.data);
    // ✅ Check if response confirms admin role
    if (res.data?.admin?.role === "admin") {
      navigate("/admin"); // Redirect to Admin Panel
    } else {
      setError("🚫 Not authorized as admin");
    }
  } catch (err) {
    console.error("Login error:", err);

    // Show backend error or fallback message
    setError(err.response?.data?.error || "Login failed");
  }
};


  return (
    <div className="container mt-5" style={{ maxWidth: "400px" }}>
      <h2>Admin Login</h2>
      {error && <div className="alert alert-danger">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label>Email</label>
          <input
            type="email"
            className="form-control"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="mb-3">
          <label>Password</label>
          <input
            type="password"
            className="form-control"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <button type="submit" className="btn btn-primary w-100">
          Login
        </button>
      </form>
    </div>
  );
};

export default AdminLogin;
