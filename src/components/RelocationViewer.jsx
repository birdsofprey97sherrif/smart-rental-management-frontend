import React, { useEffect, useState, useCallback } from 'react';
import axios from '../utils/axiosInstance';
import { useToast } from '../context/ToastContext';

export default function RelocationViewer() {
  const [requests, setRequests] = useState([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [dateRange, setDateRange] = useState({ from: '', to: '' });
  const { showToast } = useToast();

  const fetchRequests = useCallback(async () => {
    try {
      const params = {};
      if (statusFilter) params.status = statusFilter;
      if (dateRange.from) params.from = dateRange.from;
      if (dateRange.to) params.to = dateRange.to;

      const { data } = await axios.get('/relocations/admin', { params });
      setRequests(Array.isArray(data) ? data : data.requests || []);

    } catch (err) {
      showToast('Failed to fetch relocation requests', 'error');
    }
  }, [statusFilter, dateRange, showToast]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const handleMarkComplete = async (id) => {
    try {
      const confirmed = window.confirm('Are you sure you want to mark this as complete?');
      if (!confirmed) return;

      await axios.patch(`/relocations/${id}/complete`);
      showToast('Marked as completed');
      fetchRequests();
    } catch {
      showToast('Failed to complete relocation', 'error');
    }
  };

  const handleAssignDriver = async (id) => {
    try {
      const driverId = prompt('Enter Driver ID:'); // Replace with modal later
      if (!driverId) return;
      await axios.patch(`/relocations/${id}/assign-driver`, { driverId });
      showToast('Driver assigned');
      fetchRequests();
    } catch {
      showToast('Failed to assign driver', 'error');
    }
  };

  return (
    <div className="p-4">
      <h3>Relocation Requests</h3>

      {/* Filters */}
      <div className="d-flex flex-wrap gap-3 my-3">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="form-select"
        >
          <option value="">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="assigned">Driver Assigned</option>
          <option value="completed">Completed</option>
        </select>

        <input
          type="date"
          value={dateRange.from}
          onChange={(e) => setDateRange((prev) => ({ ...prev, from: e.target.value }))}
          className="form-control"
        />

        <input
          type="date"
          value={dateRange.to}
          onChange={(e) => setDateRange((prev) => ({ ...prev, to: e.target.value }))}
          className="form-control"
        />
      </div>

      {/* Table */}
      {requests.length === 0 ? (
        <p className="mt-4">No relocation requests found.</p>
      ) : (
        <div className="table-responsive mt-3">
          <table className="table table-bordered table-hover">
            <thead className="table-light">
              <tr>
                <th>Tenant</th>
                <th>New House</th>
                <th>Status</th>
                <th>Caretaker</th>
                <th>Rating</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((req) => (
                <tr key={req._id}>
                  <td>{req.tenant?.fullName || 'N/A'}</td>
                  <td>{req.requestedHouse?.name || 'N/A'}</td>
                  <td>{req.status}</td>
                  <td>{req.approvedBy?.fullName || '-'}</td>
                  <td>{req.rating || '-'}</td>
                  <td className="d-flex gap-2">
                    {req.status === 'approved' && (
                      <button
                        className="btn btn-sm btn-outline-primary"
                        onClick={() => handleAssignDriver(req._id)}
                      >
                        Assign Driver
                      </button>
                    )}
                    {req.status === 'assigned' && (
                      <button
                        className="btn btn-sm btn-outline-success"
                        onClick={() => handleMarkComplete(req._id)}
                      >
                        Mark Completed
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
