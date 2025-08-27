import React, { useEffect, useState } from "react";
import axios from "../utils/axiosInstance";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

export default function Relocations() {
  const { token } = useAuth();
  const { showToast } = useToast();
  const [relocations, setRelocations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [driverId, setDriverId] = useState(""); // For assigning driver

  const fetchRelocations = React.useCallback( async () => {
    try {
      setLoading(true);
      const res = await axios.get("/relocations/all", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRelocations(res.data.requests || []);
    } catch (err) {
      showToast("Failed to load relocation requests", "error");
    } finally {
      setLoading(false);
    }
  }, [token, showToast]);

  const updateStatus = async (id, status) => {
    try {
      await axios.patch(`/relocations/update/${id}`, { status }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      showToast(`Relocation ${status}`, "success");
      fetchRelocations();
    } catch (err) {
      showToast("Failed to update relocation status", "error");
    }
  };

  const assignDriver = async (requestId) => {
    if (!driverId) {
      showToast("Enter a driver ID", "error");
      return;
    }
    try {
      await axios.post("/relocations/assign-driver", { requestId, driverId }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      showToast("Driver assigned successfully", "success");
      setDriverId("");
      fetchRelocations();
    } catch (err) {
      showToast("Failed to assign driver", "error");
    }
  };

  useEffect(() => {
    fetchRelocations();
  }, [fetchRelocations]);

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Relocation Requests</h2>
      {loading ? (
        <p>Loading...</p>
      ) : relocations.length === 0 ? (
        <p>No relocation requests found.</p>
      ) : (
        <table className="w-full border">
          <thead className="bg-gray-200">
            <tr>
              <th className="p-2">Tenant</th>
              <th className="p-2">Phone</th>
              <th className="p-2">House</th>
              <th className="p-2">Distance (km)</th>
              <th className="p-2">Floor</th>
              <th className="p-2">Size</th>
              <th className="p-2">Est. Cost</th>
              <th className="p-2">Status</th>
              <th className="p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {relocations.map((req) => (
              <tr key={req._id} className="border-b">
                <td className="p-2">{req.tenantId?.fullName}</td>
                <td className="p-2">{req.tenantId?.phone}</td>
                <td className="p-2">{req.houseId?.title}</td>
                <td className="p-2">{req.distanceKm}</td>
                <td className="p-2">{req.floorNumber}</td>
                <td className="p-2">{req.houseSize}</td>
                <td className="p-2">KES {req.estimatedCost}</td>
                <td className="p-2 capitalize">{req.status}</td>
                <td className="p-2 flex flex-col gap-2">
                  {req.status === "pending" && (
                    <>
                      <button
                        onClick={() => updateStatus(req._id, "approved")}
                        className="bg-green-600 text-white px-3 py-1 rounded"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => updateStatus(req._id, "declined")}
                        className="bg-red-600 text-white px-3 py-1 rounded"
                      >
                        Decline
                      </button>
                    </>
                  )}

                  {req.status === "approved" && (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Driver ID"
                        value={driverId}
                        onChange={(e) => setDriverId(e.target.value)}
                        className="border p-1 rounded w-28"
                      />
                      <button
                        onClick={() => assignDriver(req._id)}
                        className="bg-blue-600 text-white px-3 py-1 rounded"
                      >
                        Assign Driver
                      </button>
                    </div>
                  )}

                  {req.status === "assigned" && (
                    <span className="text-sm text-gray-600">Driver Assigned</span>
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
