import React, { useEffect, useState } from 'react';
import axios from "../utils/axiosInstance";
import { useToast } from '../context/ToastContext';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';

export default function TenantVisitsPage() {
  const [houses, setHouses] = useState([]);
  const [visits, setVisits] = useState([]);
  const [selectedHouseId, setSelectedHouseId] = useState('');
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  // Fetch houses for dropdown
  useEffect(() => {
    axios.get('/houses/vacant')
      .then(res => setHouses(res.data))
      .catch(() => showToast('Failed to load houses', 'error'));
  }, [showToast]);

  // Fetch visit requests
  const loadVisits = () => {
    axios.get('/visits/mine')
      .then(res => setVisits(res.data.visits))
      .catch(() => showToast('Failed to fetch visit requests', 'error'));
  };

  useEffect(loadVisits, [showToast]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedHouseId) return showToast('Select a house first', 'warning');

    setLoading(true);
    try {
      const res = await axios.post('/visits/request', { houseId: selectedHouseId });
      showToast(res.data.message, 'success');
      setSelectedHouseId('');
      loadVisits(); // refresh
    } catch (err) {
      showToast(err?.response?.data?.message || 'Failed to send request', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-4">
          <h2 className="text-xl font-bold mb-2">🏠 Request a Visit</h2>
          <form onSubmit={handleSubmit} className="flex flex-col md:flex-row items-center space-y-3 md:space-y-0 md:space-x-4">
            <select
              className="border rounded px-4 py-2 w-full md:w-1/2"
              value={selectedHouseId}
              onChange={(e) => setSelectedHouseId(e.target.value)}
            >
              <option value="">Select a house...</option>
              {houses.map((house) => (
                <option key={house._id} value={house._id}>
                  {house.title} - {house.location}
                </option>
              ))}
            </select>
            <Button type="submit" disabled={loading}>
              {loading ? 'Sending...' : 'Send Request'}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4 overflow-auto">
          <h2 className="text-xl font-bold mb-4">📅 My Visit Requests</h2>
          {visits.length === 0 ? (
            <p className="text-gray-500">You haven't requested any visits yet.</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-100">
                  <th className="text-left p-2">House</th>
                  <th className="text-left p-2">Location</th>
                  <th className="text-left p-2">Status</th>
                  <th className="text-left p-2">Requested On</th>
                </tr>
              </thead>
              <tbody>
                {visits.map((v) => (
                  <tr key={v._id} className="border-t">
                    <td className="p-2">{v.houseId?.title}</td>
                    <td className="p-2">{v.houseId?.location}</td>
                    <td className="p-2 capitalize">{v.status}</td>
                    <td className="p-2">{new Date(v.createdAt).toLocaleDateString()}</td>
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
