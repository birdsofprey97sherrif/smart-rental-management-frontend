import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from '../utils/axiosInstance';
import { useToast } from '../context/ToastContext';

export default function EditStaffPage() {
  const { id } = useParams();
  const [staff, setStaff] = useState(null);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStaff = async () => {
      try {
        const { data } = await axios.get(`/admin/profile/${id}`);
        setStaff(data.user);
      } catch (err) {
        showToast('Failed to load staff data', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchStaff();
  }, [id, showToast]);

  const handleChange = (e) => {
    setStaff({ ...staff, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.patch(`/admin/profile/${id}`, staff);
      showToast('Staff updated successfully', 'success');
      navigate('/admin/staff');
    } catch (err) {
      showToast('Update failed', 'error');
    }
  };

  if (loading) return <div>Loading staff info...</div>;
  if (!staff) return <div className="alert alert-danger">Staff not found</div>;

  return (
    <div className="container mt-4">
      <h2 className="text-primary fw-bold mb-4">Edit Staff</h2>
      <form onSubmit={handleSubmit} className="card p-4 shadow-sm">
        <div className="mb-3">
          <label className="form-label">Full Name</label>
          <input type="text" name="fullName" className="form-control"
            value={staff.fullName} onChange={handleChange} required />
        </div>

        <div className="mb-3">
          <label className="form-label">Phone</label>
          <input type="tel" name="phone" className="form-control"
            value={staff.phone} onChange={handleChange} required />
        </div>

        <div className="mb-3">
          <label className="form-label">Role</label>
          <select name="role" className="form-select" value={staff.role} onChange={handleChange}>
            <option value="admin">Admin</option>
            <option value="landlord">Landlord</option>
            <option value="caretaker">Caretaker</option>
          </select>
        </div>

        <div className="form-check mb-3">
          <input
            type="checkbox"
            className="form-check-input"
            id="suspendCheck"
            checked={staff.isSuspended}
            onChange={() => setStaff({ ...staff, isSuspended: !staff.isSuspended })}

          />
          <label className="form-check-label" htmlFor="suspendCheck">Suspend Account</label>
        </div>

        <button type="submit" className="btn btn-success">Update Staff</button>
      </form>
    </div>
  );
}


