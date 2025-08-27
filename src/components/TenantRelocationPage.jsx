import { useEffect, useState, useCallback } from 'react';
import axios from "../utils/axiosInstance";
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { useToast } from '../context/ToastContext';

export default function TenantRelocationPage() {
  const [houseId, setHouseId] = useState('');
  const [distanceKm, setDistanceKm] = useState('');
  const [floorNumber, setFloorNumber] = useState('');
  const [houseSize, setHouseSize] = useState('small');
  const [relocations, setRelocations] = useState([]);
  const [houses, setHouses] = useState([]);
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const [relRes, houseRes] = await Promise.all([
        axios.get('/relocations/mine'),
        axios.get('/houses/vacant'),
      ]);
      setRelocations(relRes.data.requests);
      setHouses(houseRes.data);
    } catch {
      showToast('Failed to fetch data', 'error');
    }
  }, [showToast]);

  useEffect(() => {
    fetchData();
  }, [showToast, fetchData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!houseId || !distanceKm || !floorNumber || !houseSize) {
      return showToast('Please fill all fields', 'warning');
    }

    setLoading(true);
    try {
      const res = await axios.post('/relocations/request', {
        houseId,
        distanceKm: Number(distanceKm),
        floorNumber: Number(floorNumber),
        houseSize,
      });
      showToast(res.data.message, 'success');
      setHouseId('');
      setDistanceKm('');
      setFloorNumber('');
      setHouseSize('small');
      fetchData();
    } catch {
      showToast('Failed to request relocation', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleRate = async (id) => {
    const rating = prompt('Rate this relocation (1-5 stars)');
    const feedback = prompt('Leave a comment (optional)');

    if (!rating || isNaN(rating) || rating < 1 || rating > 5) {
      return showToast('Invalid rating', 'warning');
    }

    try {
      const res = await axios.post('/relocations/rate', {
        requestId: id,
        rating: Number(rating),
        feedback,
      });
      showToast(res.data.message, 'success');
      fetchData();
    } catch {
      showToast('Failed to submit rating', 'error');
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-4 space-y-4">
          <h2 className="text-xl font-bold">📦 Request a Relocation</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <select
              className="border px-3 py-2 rounded"
              value={houseId}
              onChange={(e) => setHouseId(e.target.value)}
            >
              <option value="">Select a house</option>
              {houses.map((h) => (
                <option key={h._id} value={h._id}>
                  {h.title} - {h.location}
                </option>
              ))}
            </select>

            <input
              type="number"
              placeholder="Distance in km"
              className="border px-3 py-2 rounded"
              value={distanceKm}
              onChange={(e) => setDistanceKm(e.target.value)}
            />

            <input
              type="number"
              placeholder="Floor number"
              className="border px-3 py-2 rounded"
              value={floorNumber}
              onChange={(e) => setFloorNumber(e.target.value)}
            />

            <select
              className="border px-3 py-2 rounded"
              value={houseSize}
              onChange={(e) => setHouseSize(e.target.value)}
            >
              <option value="small">Small</option>
              <option value="medium">Medium</option>
              <option value="large">Large</option>
            </select>

            <Button type="submit" disabled={loading}>
              {loading ? 'Requesting...' : 'Request Relocation'}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4 overflow-auto">
          <h2 className="text-xl font-bold mb-4">📜 My Relocation Requests</h2>
          {relocations.length === 0 ? (
            <p className="text-gray-500">No relocations yet.</p>
          ) : (
            <table className="w-full text-sm border">
              <thead className="bg-gray-100 text-left">
                <tr>
                  <th className="p-2">House</th>
                  <th className="p-2">Cost</th>
                  <th className="p-2">Status</th>
                  <th className="p-2">Date</th>
                  <th className="p-2">Rate</th>
                </tr>
              </thead>
              <tbody>
                {relocations.map((r) => (
                  <tr key={r._id} className="border-t hover:bg-gray-50">
                    <td className="p-2">{r.houseId?.title}</td>
                    <td className="p-2">KES {r.estimatedCost}</td>
                    <td className="p-2 capitalize">{r.status}</td>
                    <td className="p-2">
                      {new Date(r.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-2">
                      {r.status === 'completed' && !r.ratedByTenant ? (
                        <Button size="sm" onClick={() => handleRate(r._id)}>
                          ⭐ Rate
                        </Button>
                      ) : r.ratedByTenant ? (
                        <span className="text-green-600">Rated</span>
                      ) : (
                        '-'
                      )}
                    </td>
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
