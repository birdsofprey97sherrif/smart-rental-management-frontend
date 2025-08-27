import React, { useEffect, useState } from "react";
import axios from "../utils/axiosInstance";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

export default function Agreements() {
  const { token } = useAuth();
  const { showToast } = useToast();
  const [agreements, setAgreements] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchAgreements = React.useCallback( async () => {
    try {
      setLoading(true);
      const res = await axios.get("/agreements/landlord", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAgreements(res.data || []);
    } catch (err) {
      showToast("Failed to load agreements", "error");
    } finally {
      setLoading(false);
    }
  }, [token, showToast]);

  const signAgreement = async (id) => {
    try {
      await axios.patch(`/agreements/${id}/sign`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      showToast("Agreement signed", "success");
      fetchAgreements();
    } catch (err) {
      showToast("Failed to sign agreement", "error");
    }
  };

  const terminateAgreement = async (id) => {
    if (!window.confirm("Are you sure you want to terminate this agreement?")) return;
    try {
      await axios.delete(`/agreements/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      showToast("Agreement terminated", "success");
      fetchAgreements();
    } catch (err) {
      showToast("Failed to terminate agreement", "error");
    }
  };

  useEffect(() => {
    fetchAgreements();
  }, [fetchAgreements]);

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Rental Agreements</h2>
      {loading ? (
        <p>Loading...</p>
      ) : agreements.length === 0 ? (
        <p>No agreements found.</p>
      ) : (
        <table className="w-full border">
          <thead className="bg-gray-200">
            <tr>
              <th className="p-2">Tenant</th>
              <th className="p-2">Phone</th>
              <th className="p-2">House</th>
              <th className="p-2">Lease</th>
              <th className="p-2">Rent</th>
              <th className="p-2">Signed</th>
              <th className="p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {agreements.map((ag) => (
              <tr key={ag._id} className="border-b">
                <td className="p-2">{ag.tenantId?.fullName}</td>
                <td className="p-2">{ag.tenantId?.phone}</td>
                <td className="p-2">{ag.houseId?.title}</td>
                <td className="p-2">
                  {new Date(ag.leaseStart).toLocaleDateString()} →{" "}
                  {new Date(ag.leaseEnd).toLocaleDateString()}
                </td>
                <td className="p-2">KES {ag.monthlyRent}</td>
                <td className="p-2">{ag.isSigned ? "✅" : "❌"}</td>
                <td className="p-2 flex gap-2">
                  {!ag.isSigned && (
                    <button
                      onClick={() => signAgreement(ag._id)}
                      className="bg-blue-600 text-white px-3 py-1 rounded"
                    >
                      Sign
                    </button>
                  )}
                  <button
                    onClick={() => terminateAgreement(ag._id)}
                    className="bg-red-600 text-white px-3 py-1 rounded"
                  >
                    Terminate
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
