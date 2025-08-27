import React, { useEffect, useState } from "react";
import axios from "../utils/axiosInstance";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

export default function VisitRequests() {
  const { token } = useAuth();
  const { showToast } = useToast();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch visit requests
  const fetchRequests = React.useCallback( async () => {
    try {
      setLoading(true);
      const res = await axios.get("/visits/for-me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRequests(res.data.visits || []);
    } catch (err) {
      showToast("Failed to load visit requests", "error");
    } finally {
      setLoading(false);
    }
  }, [token, showToast]);

  // Approve / Decline request
  const respondToVisit = async (id, action) => {
    try {
      await axios.patch(`/visits/${id}/respond`, { action }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      showToast(`Visit ${action}d successfully`, "success");
      fetchRequests();
    } catch (err) {
      showToast(`Failed to ${action} visit`, "error");
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Visit Requests</h2>
      {loading ? (
        <p>Loading...</p>
      ) : requests.length === 0 ? (
        <p>No visit requests found.</p>
      ) : (
        <table className="w-full border">
          <thead className="bg-gray-200">
            <tr>
              <th className="p-2">Tenant</th>
              <th className="p-2">Phone</th>
              <th className="p-2">Email</th>
              <th className="p-2">House</th>
              <th className="p-2">Location</th>
              <th className="p-2">Status</th>
              <th className="p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {requests.map((visit) => (
              <tr key={visit._id} className="border-b">
                <td className="p-2">{visit.tenantId?.fullName}</td>
                <td className="p-2">{visit.tenantId?.phone}</td>
                <td className="p-2">{visit.tenantId?.email}</td>
                <td className="p-2">{visit.houseId?.title}</td>
                <td className="p-2">{visit.houseId?.location}</td>
                <td className="p-2 capitalize">{visit.status}</td>
                <td className="p-2 flex gap-2">
                  {visit.status === "pending" && (
                    <>
                      <button
                        onClick={() => respondToVisit(visit._id, "approve")}
                        className="bg-green-600 text-white px-3 py-1 rounded"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => respondToVisit(visit._id, "decline")}
                        className="bg-red-600 text-white px-3 py-1 rounded"
                      >
                        Decline
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
