// src/pages/RegisterPage.jsx
import React, { useState } from 'react';
import axios from '../utils/axiosInstance';
import { useNavigate, Link } from 'react-router-dom';
import { useToast } from '../context/ToastContext';

export default function RegisterPage() {
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    role: ''
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const { showToast } = useToast();
  const navigate = useNavigate();

  const validate = () => {
    const errs = {};

    if (!form.fullName.trim()) errs.fullName = 'Full name is required';
    if (!form.email.includes('@') || !/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Valid email is required';
    if (!form.phone.trim()) errs.phone = 'Phone number is required';
    if (form.password.length < 8 || !/[A-Z]/.test(form.password) || !/[0-9]/.test(form.password)) {
      errs.password = 'Password must be at least 8 characters, include a number and uppercase letter';
    }
    if (form.confirmPassword !== form.password) errs.confirmPassword = 'Passwords do not match';
    if (!form.role) errs.role = 'Please select a role';

    return errs;
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length) {
      setErrors(validationErrors);
      return;
    }

    try {
      setLoading(true);
      await axios.post('/auth/register', form);
      showToast('✅ Account created successfully! Check your email.', 'success');
      navigate('/login');
    } catch (err) {
      showToast(err.response?.data?.message || '❌ Registration failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-fluid min-vh-100 d-flex align-items-center bg-light">
      <div className="row w-100 shadow-lg rounded overflow-hidden">
        {/* Registration Form */}
        <div className="col-md-6 p-5 bg-white">
          <h2 className="mb-4 text-success fw-bold">Create Your Account</h2>
          <form onSubmit={handleSubmit} noValidate>
            {[
              { label: 'Full Name', name: 'fullName', type: 'text', placeholder: 'Enter your full name' },
              { label: 'Email', name: 'email', type: 'email', placeholder: 'Enter your email' },
              { label: 'Phone', name: 'phone', type: 'tel', placeholder: 'Enter your phone number' }
            ].map(({ label, name, type, placeholder }) => (
              <div className="mb-3" key={name}>
                <label className="form-label">{label}</label>
                <input
                  type={type}
                  name={name}
                  className={`form-control ${errors[name] ? 'is-invalid' : ''}`}
                  value={form[name]}
                  onChange={handleChange}
                  placeholder={placeholder}
                />
                {errors[name] && <div className="invalid-feedback">{errors[name]}</div>}
              </div>
            ))}

            {/* Password */}
            
            <div className="mb-3">
              <label className="form-label">Password</label>
              <input
                type="password"
                name="password"
                className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                value={form.password}
                onChange={handleChange}
                placeholder="Enter your password"
              />
              {errors.password && <div className="invalid-feedback">{errors.password}</div>}
            </div>

            {/* Confirm Password */}
            <div className="mb-3">
              <label className="form-label">Confirm Password</label>
              <input
                type="password"
                name="confirmPassword"
                className={`form-control ${errors.confirmPassword ? 'is-invalid' : ''}`}
                value={form.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm your password"
              />
              {errors.confirmPassword && <div className="invalid-feedback">{errors.confirmPassword}</div>}
            </div>
            

            {/* Role */}
            <div className="mb-4">
              <label className="form-label">Role</label>
              <select
                name="role"
                className={`form-select ${errors.role ? 'is-invalid' : ''}`}
                value={form.role}
                onChange={handleChange}
              >
                <option value="">Select your role</option>
                <option value="tenant">Tenant</option>
                <option value="landlord">Landlord</option>
                <option value="caretaker">Caretaker</option>
                <option value="admin">Admin</option>
                <option value="agent">Agent</option>
              </select>
              {errors.role && <div className="invalid-feedback">{errors.role}</div>}
            </div>

            <button type="submit" className="btn btn-success w-100 py-2" disabled={loading}>
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2"></span>
                  Creating Account...
                </>
              ) : (
                'Register'
              )}
            </button>
          </form>
          already have an account? <Link to="/login">Login</Link><br />
          <div className="form-check">
          <input className="form-check-input" type="checkbox" id="terms" name="terms" required />
           <label className='form-check-label' htmlFor='terms'>
            I agree to the terms and conditions
          </label>
          </div>
        </div>

        {/* Promo Section */}
        <div className="col-md-6 d-flex flex-column justify-content-center align-items-center bg-success text-white p-5">
          <h2 className="fw-bold mb-3">Smart Rental Management</h2>
          <p className="lead text-center mb-4">
            Streamline property management for tenants, landlords, caretakers, and admins.
            Join our platform today to simplify renting, tracking, and communication.
          </p>
          <img
            src="/images/smart-rentals-illustration.svg"
            alt="Smart Rentals"
            className="img-fluid"
            style={{ maxWidth: '400px' }}
          />
        </div>
      </div>
    </div>
  );
}
