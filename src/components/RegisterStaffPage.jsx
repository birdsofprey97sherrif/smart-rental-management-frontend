import React, { useState } from 'react';
import axios from '../utils/axiosInstance';
import { useToast } from '../context/ToastContext';

export default function RegisterStaffPage() {
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    role: '',
  });
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.fullName || !form.email || !form.phone || !form.password || !form.role) {
      showToast('Please fill all fields', 'error');
      return;
    }

    try {
      setLoading(true);

      // Match backend field naming (e.g. "name" instead of "fullName")
      await axios.post('/admin/register-staff', {
        fullName: form.fullName,   // ✅ match backend + schema
        email: form.email,
        phone: form.phone,
        password: form.password,
        role: form.role,
      });

      showToast('Staff registered successfully', 'success');

      // Reset the form
      setForm({
        fullName: '',
        email: '',
        phone: '',
        password: '',
        role: '',
      });
    } catch (err) {
      showToast(err.response?.data?.message || 'Registration failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-4">
      <h2 className="text-success fw-bold mb-4">Register New Staff</h2>
      <form onSubmit={handleSubmit} className="card shadow p-4">
        <div className="row g-3">
          <div className="col-md-6">
            <label className="form-label">Full Name</label>
            <input
              type="text"
              className="form-control"
              name="fullName"
              value={form.fullName}
              onChange={handleChange}
              required
            />
          </div>
          <div className="col-md-6">
            <label className="form-label">Email</label>
            <input
              type="email"
              className="form-control"
              name="email"
              value={form.email}
              onChange={handleChange}
              required
            />
          </div>
          <div className="col-md-6">
            <label className="form-label">Phone</label>
            <input
              type="tel"
              className="form-control"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              required
            />
          </div>
          <div className="col-md-6">
            <label className="form-label">Password</label>
            <input
              type="password"
              className="form-control"
              name="password"
              value={form.password}
              onChange={handleChange}
              required
            />
          </div>
          <div className="col-md-6">
            <label className="form-label">Role</label>
            <select
              className="form-select"
              name="role"
              value={form.role}
              onChange={handleChange}
              required
            >
              <option value="">Select role</option>
              <option value="admin">admin</option>
              <option value="landlord">landlord</option>
              <option value="caretaker">caretaker</option>
            </select>
          </div>
        </div>

        <div className="mt-4">
          <button type="submit" className="btn btn-success w-100" disabled={loading}>
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2"></span> Registering...
              </>
            ) : (
              'Register Staff'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
