import React, { useState } from "react";
import axios from "../utils/axiosInstance";
import { useToast } from "../context/ToastContext";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  const isValidEmail = (value) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isValidEmail(email)) {
      return showToast("Please enter a valid email address", "error");
    }

    try {
      setLoading(true);
      await axios.post("/auth/reset-password", { email: email.trim() });
      showToast("Reset link sent to your email", "success");
      setEmail("");
    } catch {
      showToast("Failed to send reset link. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container d-flex align-items-center justify-content-center min-vh-100 bg-light">
      <div className="card shadow p-4" style={{ maxWidth: 450, width: "100%" }}>
        <h4 className="text-center mb-4 text-success fw-bold">Forgot Password</h4>
        <form onSubmit={handleSubmit}>
          <label className="form-label">Email Address</label>
          <input
            type="email"
            className="form-control mb-3"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <button type="submit" className="btn btn-success w-100" disabled={loading}>
            {loading ? <><span className="spinner-border spinner-border-sm me-2"></span>Sending...</> : "Send Reset Link"}
          </button>
        </form>
      </div>
    </div>
  );
}
