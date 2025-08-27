import React, { useEffect, useState } from "react";
import axios from "../utils/axiosInstance";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

export default function CaretakerRelocations() {
  const { token } = useAuth();
  const { showToast } = useToast();

  const [relocations, setRelocations] = useState([]);
  const [houses, setHouses] = useState([]);
  const [statusFilter, setStatusFilter] = useState("");
  const [houseFilter, setHouseFilter] = useState("");
  const [page, setPage] = useState(1);
  const [limit] = useState(8);
  // const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  const [declineId, setDeclineId] = useState(null);
  const [declineReason, setDeclineReason] = useState("");

  const fetchHouses =  React.useCallback( async () => {
    try {
      const res = await axios.get("/caretaker/houses-managed", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setHouses(res.data.houses || []);
    } catch {
      showToast("Failed to load houses", "error");
    }
  }, [token, showToast]);

  const fetchRelocations = React.useCallback( async () => {
    setLoading(true);
    try {
      const params = { page, limit, status: statusFilter, houseId: houseFilter || undefined };
      const res = await axios.get("/relocations/my-houses", {
        headers: { Authorization: `Bearer ${token}` },
        params
      });
      setRelocations(res.data.relocations || []);
      // setTotal(res.data.total || 0);
    } catch {
      showToast("Failed to load relocation requests", "error");
    } finally {
      setLoading(false);
    }
  }, [page, limit, statusFilter, houseFilter, token, showToast]);

  const approveRelocation = async (id) => {
    try {
      await axios.patch(`/relocations/${id}/approve`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      showToast("Relocation approved", "success");
      fetchRelocations();
    } catch {
      showToast("Failed to approve relocation", "error");
    }
  };

  const declineRelocation = async () => {
    try {
      await axios.patch(`/relocations/${declineId}/decline`, { reason: declineReason }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      showToast("Relocation declined", "success");
      setDeclineId(null);
      setDeclineReason("");
      fetchRelocations();
    } catch {
      showToast("Failed to decline relocation", "error");
    }
  };

  useEffect(() => {
    fetchHouses();
  }, [fetchHouses]);

  useEffect(() => {
    fetchRelocations();
    const interval = setInterval(fetchRelocations, 30000);
    return () => clearInterval(interval);
  }, [fetchRelocations]);

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Relocation Requests</h2>

      {/* Filters */}
      <div className="bg-white p-3 rounded shadow sticky top-16 z-20 mb-4 flex gap-3 flex-wrap">
        <div>
          <label className="block text-sm">Status</label>
          <select value={statusFilter} onChange={(e) => { setPage(1); setStatusFilter(e.target.value); }} className="border rounded px-2 py-1">
            <option value="">All</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="declined">Declined</option>
          </select>
        </div>
        <div>
          <label className="block text-sm">House</label>
          <select value={houseFilter} onChange={(e) => { setPage(1); setHouseFilter(e.target.value); }} className="border rounded px-2 py-1">
            <option value="">All Houses</option>
            {houses.map(h => (
              <option key={h._id} value={h._id}>{h.title} — {h.location}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 text-sm">
            <tr>
              <th className="p-3 text-left">Tenant</th>
              <th className="p-3 text-left">House</th>
              <th className="p-3 text-left">Status</th>
              <th className="p-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="4" className="p-4 text-center">Loading...</td></tr>
            ) : relocations.length === 0 ? (
              <tr><td colSpan="4" className="p-4 text-center text-gray-500">No relocations found.</td></tr>
            ) : (
              relocations.map(r => (
                <tr key={r._id} className="border-t">
                  <td className="p-3">{r.tenantId?.fullName}</td>
                  <td className="p-3">{r.houseId?.title}</td>
                  <td className="p-3 capitalize">{r.status}</td>
                  <td className="p-3">
                    {r.status === "pending" && r.maintenanceStatus === "completed" ? (
                      <button onClick={() => approveRelocation(r._id)} className="px-3 py-1 bg-green-600 text-white rounded mr-2">Approve</button>
                    ) : r.status === "pending" ? (
                      <span className="text-gray-500 text-sm">Maintenance incomplete</span>
                    ) : null}
                    {r.status === "pending" && (
                      <button onClick={() => setDeclineId(r._id)} className="px-3 py-1 bg-red-600 text-white rounded">Decline</button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Decline Modal */}
      {declineId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded p-6 w-96">
            <h3 className="text-lg font-semibold mb-4">Decline Reason</h3>
            <textarea value={declineReason} onChange={(e) => setDeclineReason(e.target.value)} className="w-full border rounded p-2 mb-4" rows={4} />
            <div className="flex justify-end gap-2">
              <button onClick={() => setDeclineId(null)} className="px-3 py-1 bg-gray-300 rounded">Cancel</button>
              <button onClick={declineRelocation} className="px-3 py-1 bg-red-600 text-white rounded">Submit</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
