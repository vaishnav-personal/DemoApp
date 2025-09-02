import axios from "axios";
import { useState } from "react";

export default function LoginSignupPage({ setLoggedinUser, onCloseLoginSignupPageClose }) {
  const emptyForm = { name: "", emailId: "", password: "", confirmPassword: "" };

  const [formData, setFormData] = useState(emptyForm);
  const [message, setMessage] = useState("");
  const [formType, setFormType] = useState("login");
  const [errors, setErrors] = useState({});

  // Handle input change
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
  };

  // Validation
  const validate = () => {
    let newErrors = {};
    if (!formData.emailId) newErrors.emailId = "Email is required";
    if (formType === "signup" && !formData.name) newErrors.name = "Name is required";
    if (!formData.password) newErrors.password = "Password is required";
    if (formType === "signup" && formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Signup handler
  async function handleSignupFormSubmit() {
    try {
      let response = await axios.post(
        import.meta.env.VITE_API_URL + "/users/signup",
        formData
      );
      showMessage(response.data.message || "Signup successful!");
      setFormData(emptyForm);
    } catch (error) {
      if (error.response) {
        showMessage(error.response.data.error || "Signup failed");
      } else if (error.request) {
        showMessage("No response from server");
      } else {
        showMessage("Unexpected error occurred");
      }
    }
  }

  // Login handler
  async function handleLoginFormSubmit() {
    try {
      let response = await axios.post(
        import.meta.env.VITE_API_URL + "/users/login",
        formData,
        { withCredentials: true } // keep this for cookies/JWT
      );
      showMessage(response.data.message || "Login successful!");
      setLoggedinUser(response.data.user);
    } catch (error) {
      if (error.response) {
        showMessage(error.response.data.error || "Login failed");
      } else if (error.request) {
        showMessage("No response from server");
      } else {
        showMessage("Unexpected error occurred");
      }
    }
  }

  // Show message
  function showMessage(m) {
    setMessage(m);
    setTimeout(() => setMessage(""), 5000);
  }

  // Submit handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    if (formType === "signup") {
      await handleSignupFormSubmit();
    } else {
      await handleLoginFormSubmit();
    }
  };

  // Tab switch
  const switchForm = (type) => {
    setFormType(type);
    setFormData(emptyForm);
    setErrors({});
    setMessage("");
  };

  return (
    <div className="container d-flex align-items-center justify-content-center min-vh-100 bg-light">
      <div className="card shadow w-100" style={{ maxWidth: "400px" }}>
        <div className="card-body">
          <div className="text-end">
            <button className="btn-close" onClick={onCloseLoginSignupPageClose} type="button"></button>
          </div>

          {message && <div className="alert alert-info text-center">{message}</div>}

          <ul className="nav nav-tabs mb-4" role="tablist">
            <li className="nav-item">
              <button
                type="button"
                className={`nav-link ${formType === "login" ? "active" : ""}`}
                onClick={() => switchForm("login")}
              >
                Login
              </button>
            </li>
            <li className="nav-item">
              <button
                type="button"
                className={`nav-link ${formType === "signup" ? "active" : ""}`}
                onClick={() => switchForm("signup")}
              >
                Signup
              </button>
            </li>
          </ul>

          {/* LOGIN FORM */}
          {formType === "login" && (
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <input
                  name="emailId"
                  type="email"
                  className="form-control"
                  placeholder="Email"
                  value={formData.emailId}
                  onChange={handleChange}
                />
                {errors.emailId && <div className="text-danger small">{errors.emailId}</div>}
              </div>
              <div className="mb-3">
                <input
                  name="password"
                  type="password"
                  className="form-control"
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleChange}
                />
                {errors.password && <div className="text-danger small">{errors.password}</div>}
              </div>
              <button type="submit" className="btn btn-primary w-100">
                Login
              </button>
            </form>
          )}

          {/* SIGNUP FORM */}
          {formType === "signup" && (
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <input
                  name="name"
                  type="text"
                  className="form-control"
                  placeholder="Your name"
                  value={formData.name}
                  onChange={handleChange}
                />
                {errors.name && <div className="text-danger small">{errors.name}</div>}
              </div>
              <div className="mb-3">
                <input
                  name="emailId"
                  type="email"
                  className="form-control"
                  placeholder="Email"
                  value={formData.emailId}
                  onChange={handleChange}
                />
                {errors.emailId && <div className="text-danger small">{errors.emailId}</div>}
              </div>
              <div className="mb-3">
                <input
                  name="password"
                  type="password"
                  className="form-control"
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleChange}
                />
                {errors.password && <div className="text-danger small">{errors.password}</div>}
              </div>
              <div className="mb-3">
                <input
                  name="confirmPassword"
                  type="password"
                  className="form-control"
                  placeholder="Confirm Password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                />
                {errors.confirmPassword && (
                  <div className="text-danger small">{errors.confirmPassword}</div>
                )}
              </div>
              <button type="submit" className="btn btn-primary w-100">
                Signup
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
