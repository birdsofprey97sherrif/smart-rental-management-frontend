import React, { useEffect, useState } from 'react';
import axios from '../utils/axiosInstance';
import { useToast } from '../context/ToastContext';
import { Link } from 'react-router-dom';
export default function AdminStaffPage() {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  const fetchStaff = React.useCallback(async () => {
    try {
      const { data } = await axios.get('/admin/staff');
      setStaff(data);
    } catch (err) {
      showToast('Failed to load staff list', 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchStaff();
  }, [fetchStaff]);

  const toggleStatus = async (userId, currentStatus) => {
    try {
      await axios.patch(`/admin/suspend-user/${userId}`, {
        isSuspended: !currentStatus,
      });
      setStaff((prevStaff) => {
        return prevStaff.map((user) => {
          if (user._id === userId) {
            return { ...user, isSuspended: !user.isSuspended };
          }
          return user;
        });
      });
      showToast('User status updated', 'success');
      fetchStaff(); // refresh the list
    } catch (err) {
      showToast('Update failed', 'error');
    }
  };

   <div className="d-flex justify-content-end gap-2 mb-3">
  <Link to="/admin/register-staff" className="btn btn-outline-primary">
    ➕ Register Staff
  </Link>
</div>

  return (
    <div className="container mt-4">
      <h2 className="mb-3 fw-bold text-success">Manage Staff</h2>
      {loading ? (
        <div>Loading staff...</div>
      ) : (
        <table className="table table-bordered table-striped">
          <thead className="table-success">
            <tr>
              <th>#</th>
              <th>Name</th>
              <th>Email/Phone</th>
              <th>Role</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {staff.map((user, index) => (
              <tr key={user._id}>
                <td>{index + 1}</td>
                <td>{user.fullName || user.name}</td>
                <td>{user.email || user.phone}</td>
                <td className="text-capitalize">{user.role}</td>
                <td>
                  <span className={`badge ${user.isSuspended ? 'bg-danger' : 'bg-success'}`}>
                    {user.isSuspended ? 'Suspended' : 'Active'}
                  </span>
                </td>
                <td>
                  <button
                    className={`btn btn-sm ${user.isSuspended ? 'btn-success' : 'btn-warning'}`}
                    onClick={() => toggleStatus(user._id, user.isSuspended)}
                  >
                    {user.isSuspended ? 'Unsuspend' : 'Suspend'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
