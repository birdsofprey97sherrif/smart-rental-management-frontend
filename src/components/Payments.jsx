import React, { useEffect, useState } from "react";
import axios from "../utils/axiosInstance";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

export default function Payments() {
  const { token } = useAuth();
  const { showToast } = useToast();
  const [payments, setPayments] = useState([]);
  const [summary, setSummary] = useState({});
  const [loading, setLoading] = useState(false);

  const fetchPayments = React.useCallback( async () => {
    try {
      setLoading(true);
      const res = await axios.get("rents/landlord-view", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPayments(res.data.payments || []);
    } catch (err) {
      showToast("Failed to load payments", "error");
    } finally {
      setLoading(false);
    }
  }, [token, showToast]);

  const fetchSummary = React.useCallback( async () => {
    try {
      const res = await axios.get("rents/landlord-earnings", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSummary(res.data.summary || {});
    } catch (err) {
      showToast("Failed to load summary", "error");
    }
  }, [token, showToast]);

  useEffect(() => {
    fetchPayments();
    fetchSummary();
  }, [fetchPayments, fetchSummary]);

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Payments & Earnings</h2>

      {/* Earnings Summary */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">Monthly Earnings</h3>
        {Object.keys(summary).length === 0 ? (
          <p>No earnings data yet.</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(summary).map(([month, total]) => (
              <div
                key={month}
                className="bg-green-100 p-4 rounded shadow text-center"
              >
                <p className="font-bold">{month}</p>
                <p className="text-green-700 font-semibold">
                  KES {total.toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Payments Table */}
      {loading ? (
        <p>Loading payments...</p>
      ) : payments.length === 0 ? (
        <p>No payments found.</p>
      ) : (
        <table className="w-full border">
          <thead className="bg-gray-200">
            <tr>
              <th className="p-2">Tenant</th>
              <th className="p-2">House</th>
              <th className="p-2">Amount Paid</th>
              <th className="p-2">Payment Method</th>
              <th className="p-2">Payment Date</th>
            </tr>
          </thead>
          <tbody>
            {payments.map((p) => (
              <tr key={p._id} className="border-b">
                <td className="p-2">{p.tenantId?.fullName}</td>
                <td className="p-2">{p.houseId?.title}</td>
                <td className="p-2">KES {p.amountPaid}</td>
                <td className="p-2">{p.paymentMethod}</td>
                <td className="p-2">
                  {new Date(p.paymentDate).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
