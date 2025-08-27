import React, { useState } from 'react';
import axios from '../utils/axiosInstance';
import { useToast } from '../context/ToastContext';

export default function BroadcastMessagePage() {
  const [channel, setChannel] = useState('email');
  const [target, setTarget] = useState('all');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!message.trim()) {
      showToast('Message cannot be empty', 'error');
      return;
    }

    try {
      setLoading(true);
      await axios.post('/admin/admin/mass-notify', {
        target, // 'all', 'tenants', 'landlords', 'caretakers'
        channel, // 'email' or 'sms'
        message,
      });
      showToast('Message broadcast sent', 'success');
      setMessage('');
    } catch (err) {
      showToast(err.response?.data?.message || 'Broadcast failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-4">
      <h2 className="text-success fw-bold mb-4">Broadcast Message</h2>

      <form onSubmit={handleSubmit} className="card shadow p-4">
        <div className="row g-3 mb-3">
          <div className="col-md-6">
            <label className="form-label">Channel</label>
            <select className="form-select" value={channel} onChange={(e) => setChannel(e.target.value)}>
              <option value="email">Email</option>
              <option value="sms">SMS</option>
            </select>
          </div>
          <div className="col-md-6">
            <label className="form-label">Target Group</label>
            <select className="form-select" value={target} onChange={(e) => setTarget(e.target.value)}>
              <option value="all">All Users</option>
              <option value="tenants">Tenants</option>
              <option value="landlords">Landlords</option>
              <option value="caretakers">Caretakers</option>
            </select>
          </div>
        </div>

        <div className="mb-3">
          <label className="form-label">Message</label>
          <textarea
            className="form-control"
            rows="5"
            placeholder="Enter your message here..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          ></textarea>
        </div>

        <button type="submit" className="btn btn-success w-100" disabled={loading}>
          {loading ? (
            <>
              <span className="spinner-border spinner-border-sm me-2"></span> Sending...
            </>
          ) : (
            'Send Broadcast'
          )}
        </button>
      </form>
    </div>
  );
}
