// src/pages/LoginPage.jsx
import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const rememberedLogin = localStorage.getItem('rememberedLogin') || '';
  const [form, setForm] = useState({ identifier: rememberedLogin, password: '', remember: !!rememberedLogin });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);


  const { showToast } = useToast();
  const { login } = useAuth();
  const navigate = useNavigate();
  const inputRef = useRef();

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const isEmail = (input) => /\S+@\S+\.\S+/.test(input);
  const isPhone = (input) => /^[0-9]{10,}$/.test(input);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { identifier, password } = form;

    if (!identifier || !password) {
      showToast('Please fill in all fields', 'error');
      return;
    }

    const payload = { emailOrPhone: identifier, password };

    if (isEmail(identifier)) payload.emailOrPhone = identifier;
    if (isPhone(identifier)) payload.emailOrPhone = identifier;

    if (!payload.emailOrPhone && !isEmail(identifier) && !isPhone(identifier)) {
      showToast('Enter a valid email or phone number', 'error');
      return;
    }

    try {
      setLoading(true);
      const response = await login(payload);
      const { token, user } = response;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      showToast('Login successful!', 'success');

      if (form.remember) {
        localStorage.setItem('rememberedLogin', identifier);
      } else {
        localStorage.removeItem('rememberedLogin');
      }

      navigate(response.redirectTo || '/');
    } catch (err) {
      showToast(err.response?.data?.message || 'Login failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    if (!forgotEmail) {
      showToast("Please enter your email", "error");
      return;
    }
    try {
      setForgotLoading(true);
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/auth/requestPasswordReset`,
        { email: forgotEmail }
      );
      showToast(res.data.message, "success");
      setShowForgotModal(false);
      setForgotEmail("");
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to send reset link", "error");
    } finally {
      setForgotLoading(false);
    }
  };


  return (
    <div className="container-fluid min-vh-100 d-flex align-items-center bg-light">
      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="modal fade show" style={{ display: "block" }} tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Reset Password</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowForgotModal(false)}
                ></button>
              </div>
              <form onSubmit={handleForgotPassword}>
                <div className="modal-body">
                  <p className="small text-muted">
                    Enter your registered email address. We’ll send you a link to reset your password.
                  </p>
                  <input
                    type="email"
                    className="form-control"
                    placeholder="Enter your email"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowForgotModal(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-success" disabled={forgotLoading}>
                    {forgotLoading ? (
                      <div>
                        <span className="spinner-border spinner-border-sm me-2"></span>
                        Sending...
                      </div>
                    ) : (
                      "Send Reset Link"
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
          {/* Modal backdrop */}
          <div
            className="modal-backdrop fade show"
            onClick={() => setShowForgotModal(false)}
          ></div>
        </div>
      )}

      <div className="row w-100 shadow-lg rounded overflow-hidden">
        <div className="col-md-6 p-5 bg-white">
          <h2 className="mb-4 text-success fw-bold">Welcome Back</h2>
          <form onSubmit={handleSubmit}>
            {/* Identifier */}
            <div className="mb-3">
              <label className="form-label">Email or Phone</label>
              <input
                type="text"
                name="identifier"
                className="form-control"
                placeholder="Enter email or phone"
                value={form.identifier}
                onChange={handleChange}
                ref={inputRef}
                required
              />
            </div>

            {/* Password */}
            <div className="mb-3">
              <label className="form-label">Password</label>
              <div className="input-group">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  className="form-control"
                  placeholder="Enter your password"
                  value={form.password}
                  onChange={handleChange}
                  required
                />
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={() => setShowPassword((prev) => !prev)}
                >
                  <i className={`bi ${showPassword ? 'bi-eye-slash' : 'bi-eye'}`}></i>
                </button>
              </div>
            </div>

            {/* Remember + Forgot */}
            <div className="d-flex justify-content-between align-items-center mb-3">
              <div className="form-check">
                <input
                  type="checkbox"
                  id="remember"
                  name="remember"
                  checked={form.remember}
                  onChange={handleChange}
                  className="form-check-input"
                />
                <label htmlFor="remember" className="form-check-label">Remember me</label>
              </div>
              <a href="/reset-password" className="text-decoration-none small text-secondary">Forgot Password?</a>
            </div>

            {/* Button */}
            <button type="submit" className="btn btn-success w-100" disabled={loading}>
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2"></span>
                  Logging in...
                </>
              ) : (
                'Login'
              )}
            </button>
            <button
              type="button"
              className="btn btn-link text-decoration-none small text-secondary p-0"
              onClick={() => setShowForgotModal(true)}
            >
              Forgot Password?
            </button>

          </form>
          do not have an account? <a href="/register" className="text-decoration-none text-success">Sign up</a>
        </div>

        {/* Promo */}
        <div className="col-md-6 d-flex flex-column justify-content-center align-items-center bg-success text-white p-5">
          <h2 className="fw-bold mb-3">Smart Rental Management</h2>
          <p className="lead text-center mb-4">
            Sign in to manage houses, tenants, defaulters, and more from one smart platform.
          </p>
          <img src="/images/smart-rentals-illustration.svg" alt="Smart Rentals" className="img-fluid" style={{ maxWidth: '400px' }} />
        </div>
      </div>
    </div>
  );
}
