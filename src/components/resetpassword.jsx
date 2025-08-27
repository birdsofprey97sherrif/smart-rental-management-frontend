import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "../utils/axiosInstance";
import { useToast } from "../context/ToastContext";

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [form, setForm] = useState({ password: "", confirm: "" });
  const [loading, setLoading] = useState(false);

  const isStrongPassword = (pwd) =>
    /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d).{8,}$/.test(pwd);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleReset = async (e) => {
    e.preventDefault();
    if (!token) return showToast("Invalid or missing token.", "error");

    if (!isStrongPassword(form.password)) {
      return showToast("Password must be at least 8 characters, include uppercase, lowercase, and a number.", "error");
    }
    if (form.password !== form.confirm) {
      return showToast("Passwords do not match", "error");
    }

    try {
      setLoading(true);
      await axios.post(`/auth/reset-password/${token}`, { newPassword: form.password });
      showToast("Password successfully reset!", "success");
      navigate("/login");
    } catch {
      showToast("Reset failed or token expired.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-20 p-6 border rounded">
      <h2 className="text-xl mb-4 font-semibold">Reset Your Password</h2>
      <form onSubmit={handleReset}>
        <input
          type="password"
          name="password"
          placeholder="New password"
          className="w-full p-2 border mb-3"
          value={form.password}
          onChange={handleChange}
          required
        />
        <input
          type="password"
          name="confirm"
          placeholder="Confirm new password"
          className="w-full p-2 border mb-4"
          value={form.confirm}
          onChange={handleChange}
          required
        />
        <button
          type="submit"
          className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700"
          disabled={loading}
        >
          {loading ? "Resetting..." : "Reset Password"}
        </button>
      </form>
    </div>
  );
}
