import React, { useState } from "react";

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

    const endpoint =
      mode === "signup"
        ? "/owner/signup"
        : "/owner/login";

    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL || "http://localhost:3002"}${endpoint}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
           credentials: "include", // ✅ keep session cookie
        }
      );

      if (!res.ok) throw new Error("Auth failed");
      const data = await res.json();
      console.log(data);
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
    <div className="container mt-5" style={{ maxWidth: "400px" }}>
      <h2 className="mb-4 text-center">
        {mode === "signup" ? "Station Owner Signup" : "Station Owner Login"}
      </h2>

      <form onSubmit={handleSubmit}>
        {mode === "signup" && (
          <div className="mb-3">
            <input
              name="name"
              type="text"
              className="form-control"
              placeholder="Your name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>
        )}
        <div className="mb-3">
          <input
            name="emailId"
            type="email"
            className="form-control"
            placeholder="Email"
            value={formData.emailId}
            onChange={handleChange}
            required
          />
        </div>
        <div className="mb-3">
          <input
            name="password"
            type="password"
            className="form-control"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            required
          />
        </div>
        {mode === "signup" && (
          <div className="mb-3">
            <input
              name="confirmPassword"
              type="password"
              className="form-control"
              placeholder="Confirm Password"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />
          </div>
        )}
        <button type="submit" className="btn btn-primary w-100">
          {mode === "signup" ? "Signup" : "Login"}
        </button>
      </form>

      {/* Switch Mode */}
      <div className="mt-3 text-center">
        {mode === "signup" ? (
          <p>
            Already have an account?{" "}
            <button className="btn btn-link p-0" onClick={() => setMode("login")}>
              Login here
            </button>
          </p>
        ) : (
          <p>
            Don’t have an account?{" "}
            <button className="btn btn-link p-0" onClick={() => setMode("signup")}>
              Signup here
            </button>
          </p>
        )}
      </div>
    </div>
  );
};

export default SignupLoginOwner;
