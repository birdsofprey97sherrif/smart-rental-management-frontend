import { useEffect, useState, useCallback } from 'react';
import axios from "../utils/axiosInstance";
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { useToast } from '../context/ToastContext';

export default function TenantMaintenancePage() {
  const [houseId, setHouseId] = useState('');
  const [issue, setIssue] = useState('');
  const [requests, setRequests] = useState([]);
  const [houses, setHouses] = useState([]);
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);

 useEffect(() => {
  const fetchData = async () => {
    try {
      const [reqRes, housesRes] = await Promise.all([
        axios.get('/maintenance/maintenance'),
        axios.get('/houses/'),
      ]);
      setRequests(reqRes.data.requests);
      setHouses(housesRes.data);
    } catch {
      showToast('Failed to load maintenance data', 'error');
    }
  };

  fetchData();
}, [showToast]);

  const fetchRequests = useCallback(async () => {
    try {
      const res = await axios.get('/maintenance/maintenance');
      setRequests(res.data.requests);
    } catch {
      showToast('Failed to load maintenance requests', 'error');
    }
  }, [showToast]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!houseId || !issue) {
      return showToast('Please select a house and describe the issue', 'warning');
    }

    setLoading(true);
    try {
      const res = await axios.post('/maintenance/maintenance', { houseId, issue });
      showToast(res.data.message, 'success');
      setHouseId('');
      setIssue('');
      fetchRequests();
    } catch {
      showToast('Failed to submit request', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-4 space-y-4">
          <h2 className="text-xl font-bold">🔧 Submit Maintenance Request</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <select
              className="border px-3 py-2 rounded"
              value={houseId}
              onChange={(e) => setHouseId(e.target.value)}
            >
              <option value="">Select a house</option>
              {houses.map(h => (
                <option key={h._id} value={h._id}>
                  {h.title} - {h.location}
                </option>
              ))}
            </select>

            <input
              type="text"
              placeholder="Describe the issue"
              className="border px-3 py-2 rounded"
              value={issue}
              onChange={(e) => setIssue(e.target.value)}
            />

            <div className="md:col-span-2">
              <Button type="submit" disabled={loading}>
                {loading ? 'Submitting...' : 'Submit Request'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4 overflow-auto">
          <h2 className="text-xl font-bold mb-4">📋 My Maintenance Requests</h2>
          {requests.length === 0 ? (
            <p className="text-gray-500">No maintenance issues reported yet.</p>
          ) : (
            <table className="w-full text-sm border">
              <thead className="bg-gray-100 text-left">
                <tr>
                  <th className="p-2">House</th>
                  <th className="p-2">Issue</th>
                  <th className="p-2">Status</th>
                  <th className="p-2">Submitted</th>
                </tr>
              </thead>
              <tbody>
                {requests.map(r => (
                  <tr key={r._id} className="border-t hover:bg-gray-50">
                    <td className="p-2">{r.houseId?.title}</td>
                    <td className="p-2">{r.issue}</td>
                    <td className="p-2 capitalize">{r.status || 'pending'}</td>
                    <td className="p-2">{new Date(r.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
