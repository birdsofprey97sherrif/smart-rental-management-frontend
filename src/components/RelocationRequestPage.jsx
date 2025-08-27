import React, { useEffect, useState } from 'react';
import axios from '../utils/axiosInstance';
import { useToast } from '../context/ToastContext';

export default function RelocationRequestPage() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  const fetchRequests = React.useCallback(async () => {
    try {
      const { data } = await axios.get('/relocations/admin');
      setRequests(data);
    } catch (err) {
      showToast('Failed to load relocation requests', 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  return (
    <div className="container mt-4">
      <h2 className="fw-bold text-success mb-3">Relocation Requests</h2>

      {loading ? (
        <div>Loading requests...</div>
      ) : requests.length === 0 ? (
        <div className="alert alert-info">No relocation requests found.</div>
      ) : (
        <table className="table table-striped table-bordered">
          <thead className="table-success">
            <tr>
              <th>#</th>
              <th>Tenant</th>
              <th>Phone</th>
              <th>Current House</th>
              <th>Requested House</th>
              <th>Reason</th>
              <th>Status</th>
              <th>Requested On</th>
            </tr>
          </thead>
          <tbody>
            {requests.map((req, index) => (
              <tr key={req._id}>
                <td>{index + 1}</td>
                <td>{req.tenantName || 'N/A'}</td>
                <td>{req.phone || 'N/A'}</td>
                <td>{req.currentHouse || 'N/A'}</td>
                <td>{req.requestedHouse || 'N/A'}</td>
                <td>{req.reason || '-'}</td>
                <td>
                  <span className={`badge ${req.status === 'approved' ? 'bg-success' : req.status === 'rejected' ? 'bg-danger' : 'bg-secondary'}`}>
                    {req.status}
                  </span>
                </td>
                <td>{new Date(req.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
