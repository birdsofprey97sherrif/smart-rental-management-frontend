import React, { useEffect, useState } from 'react';
import axios from "../utils/axiosInstance";
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function AdminDashboardPage() {
  useAuth(); // Ensure user is authenticated
  const { showToast } = useToast();

  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = React.useCallback( async () => {
    setLoading(true);
    try {
      

      const { data } = await axios.get('/admin/admin/analytics', {
        
      });
      console.log("Fetched stats:", data);

      setStats(data);
    } catch (err) {
      console.error(err);
      showToast('Failed to load dashboard data.', 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center p-5">
        <div className="spinner-border text-primary me-3" role="status" />
        <span>Loading admin dashboard...</span>
      </div>
    );
  }

  if (!stats) {
    return <div className="alert alert-danger mt-4">Unable to load dashboard data.</div>;
  }

  return (
    <div className="container-fluid mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold text-success">Admin Dashboard</h2>
        <button className="btn btn-outline-primary btn-sm" onClick={fetchStats}>
          🔄 Refresh Stats
        </button>
      </div>

      <div className="row g-4">
        {/* Users Breakdown */}
        <div className="col-md-6 col-lg-3">
          <div className="card shadow-sm border-start border-success border-4 h-100">
            <div className="card-body">
              <h5 className="card-title">👥 Users</h5>
              <h3 className="fw-bold">{stats.users?.total ?? 'N/A'}</h3>
              <p className="text-muted mb-2">All registered users</p>
              <ul className="list-unstyled small">
                <li>👤 Tenants: <strong>{stats.users?.tenants ?? 0}</strong></li>
                <li>🧑‍💼 Landlords: <strong>{stats.users?.landlords ?? 0}</strong></li>
                <li>🧹 Caretakers: <strong>{stats.users?.caretakers ?? 0}</strong></li>
              </ul>
            </div>
          </div>
        </div>

        {/* Houses */}
        <div className="col-md-6 col-lg-3">
          <div className="card shadow-sm border-start border-primary border-4 h-100">
            <div className="card-body">
              <h5 className="card-title">🏠 Houses</h5>
              <h3 className="fw-bold">{stats.houses ?? 'N/A'}</h3>
              <p className="text-muted mb-0">Properties listed in the system</p>
            </div>
          </div>
        </div>

        {/* Relocation Requests */}
        <div className="col-md-6 col-lg-3">
          <div className="card shadow-sm border-start border-warning border-4 h-100">
            <div className="card-body">
              <h5 className="card-title">🚚 Relocations</h5>
              <h3 className="fw-bold">{stats.relocationRequests ?? 'N/A'}</h3>
              <p className="text-muted mb-0">Relocation requests submitted</p>
            </div>
          </div>
        </div>

        {/* Defaulters */}
        <div className="col-md-6 col-lg-3">
          <div className="card shadow-sm border-start border-danger border-4 h-100">
            <div className="card-body">
              <h5 className="card-title">💸 Defaulters</h5>
              <h3 className="fw-bold">{stats.Defaulters ?? 'N/A'}</h3>
              <p className="text-muted mb-0">This month's defaulters</p>
            </div>
          </div>
        </div>
      </div>

      {/* Future sections like charts, tables or summaries can go here */}
    </div>
  );
}
