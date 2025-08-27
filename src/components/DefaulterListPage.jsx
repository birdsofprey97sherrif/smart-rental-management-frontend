import React, { useEffect, useState, useCallback } from 'react';
import axios from '../utils/axiosInstance';
import { useToast } from '../context/ToastContext';
import { CSVLink } from "react-csv";

export default function DefaulterListPage() {
  const [defaulters, setDefaulters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notifying, setNotifying] = useState(false);
  const [view, setView] = useState('user'); // 'user' or 'tenant'
  const { showToast } = useToast();

  // CSV headers for tenant view
  const csvHeaders = [
    { label: "Tenant Name", key: "tenantName" },
    { label: "House", key: "houseName" },
    { label: "Month", key: "month" },
    { label: "Amount (KES)", key: "amount" }
  ];

  const fetchDefaulters = useCallback(async () => {
    try {
      const { data } = await axios.get('/admin/defaulters');
      setDefaulters(data.defaulters || []);

    } catch (err) {
      showToast('Failed to fetch defaulters', 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchDefaulters();

    const interval = setInterval(() => {
      fetchDefaulters();
    }, 30000); // Poll every 30 seconds

    return () => clearInterval(interval);
  }, [fetchDefaulters]);

  const notifyUser = async (userId) => {
    try {
      await axios.post(`/admin/defaulters/notify`, { userId });
      showToast('Notification sent', 'success');
    } catch {
      showToast('Notification failed', 'error');
    }
  };

  const notifyDefaulter = async (tenantId) => {
    try {
      await axios.post(`/admin/defaulters/notify`, { tenantId });
      showToast('Defaulter notified successfully', 'success');
    } catch {
      showToast('Failed to notify defaulter', 'error');
    }
  };

  const notifyAll = async () => {
    if (!defaulters.length) return;
    try {
      setNotifying(true);
      await Promise.all(
        defaulters.map((d) =>
          axios.post(`/admin/defaulters/notify`, { userId: d._id })
        )
      );
      showToast('All defaulters notified', 'success');
    } catch {
      showToast('Bulk notification failed', 'error');
    } finally {
      setNotifying(false);
    }
  };

  if (loading) return <div className="text-center mt-4">Loading defaulters...</div>;

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2 className="fw-bold text-danger">Monthly Defaulters</h2>
        <div className="d-flex gap-2 flex-wrap">
          <button
            className="btn btn-sm btn-outline-secondary"
            onClick={() => setView(view === 'user' ? 'tenant' : 'user')}
          >
            {view === 'user' ? 'Switch to Tenant View' : 'Switch to User View'}
          </button>

          {view === 'user' && (
            <button
              className="btn btn-sm btn-outline-danger"
              onClick={notifyAll}
              disabled={notifying || defaulters.length === 0}
            >
              {notifying ? 'Notifying All...' : 'Notify All'}
            </button>
          )}

          <button
            className="btn btn-sm btn-warning"
            onClick={fetchDefaulters}
            disabled={loading}
          >
            🔁 Refresh Now
          </button>

          <CSVLink
            data={defaulters}
            headers={view === 'tenant' ? csvHeaders : undefined}
            filename="defaulters.csv"
            className="btn btn-sm btn-outline-success"
          >
            📥 Export CSV
          </CSVLink>
        </div>
      </div>

      {view === 'user' ? (
        <table className="table table-bordered table-striped">
          <thead className="table-danger">
            <tr>
              <th>#</th>
              <th>Name</th>
              <th>Phone</th>
              <th>House</th>
              <th>Last Payment</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {Array.isArray(defaulters) && defaulters.map((user, index) => (
              <tr key={user._id}>
                <td>{index + 1}</td>
                <td>{user.fullName || 'Unknown'}</td>
                <td>{user.phone}</td>
                <td>{user.houseName || '-'}</td>
                <td>{user.lastPaymentDate || 'Never'}</td>
                <td>
                  <button
                    className="btn btn-sm btn-warning"
                    onClick={() => notifyUser(user._id)}
                  >
                    Notify
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <table className="table table-bordered table-striped">
          <thead className="table-warning">
            <tr>
              <th>#</th>
              <th>Tenant</th>
              <th>House</th>
              <th>Month</th>
              <th>Amount</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {Array.isArray(defaulters) && defaulters.map((d, index) => (
              <tr key={index}>
                <td>{index + 1}</td>
                <td>{d.tenantName}</td>
                <td>{d.houseName}</td>
                <td>{d.month}</td>
                <td>KES {d.amount}</td>
                <td>
                  <button
                    className="btn btn-sm btn-danger"
                    onClick={() => notifyDefaulter(d.tenantId)}
                  >
                    Notify
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
