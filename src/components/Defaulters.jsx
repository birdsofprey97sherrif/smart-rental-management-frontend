import React, { useEffect, useState } from "react";
import axios from "../utils/axiosInstance";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

export default function Defaulters() {
  const { token } = useAuth();
  const { showToast } = useToast();
  const [defaulters, setDefaulters] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchDefaulters = React.useCallback( async () => {
    try {
      setLoading(true);
      const res = await axios.get("/defaulters/rent-defaulters", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDefaulters(res.data.defaulters || []);
    } catch (err) {
      showToast("Failed to load defaulters", "error");
    } finally {
      setLoading(false);
    }
  }, [token, showToast]);

  const notifyDefaulter = async (id) => {
    try {
      await axios.post(`/defaulters/defaulters-notify/${id}`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      showToast("Defaulter notified", "success");
    } catch (err) {
      showToast("Failed to notify defaulter", "error");
    }
  };

  const sendAllReminders = async () => {
    try {
      await axios.post("/defaulters/send-defaulters-sms", {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      showToast("Reminders sent to all defaulters", "success");
    } catch (err) {
      showToast("Failed to send reminders", "error");
    }
  };

  useEffect(() => {
    fetchDefaulters();
  }, [fetchDefaulters]);

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Defaulters</h2>
      <div className="flex justify-end mb-4">
        <button
          onClick={sendAllReminders}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Send All Reminders
        </button>
      </div>
      {loading ? (
        <p>Loading...</p>
      ) : defaulters.length === 0 ? (
        <p>No defaulters found.</p>
      ) : (
        <table className="w-full border">
          <thead className="bg-gray-200">
            <tr>
              <th className="p-2">Tenant</th>
              <th className="p-2">Phone</th>
              <th className="p-2">Email</th>
              <th className="p-2">House</th>
              <th className="p-2">Monthly Rent</th>
              <th className="p-2">Lease</th>
              <th className="p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {defaulters.map((d) => (
              <tr key={d.tenant?._id} className="border-b">
                <td className="p-2">{d.tenant?.fullName}</td>
                <td className="p-2">{d.tenant?.phone}</td>
                <td className="p-2">{d.tenant?.email}</td>
                <td className="p-2">{d.house?.title}</td>
                <td className="p-2">KES {d.monthlyRent}</td>
                <td className="p-2">
                  {new Date(d.leaseStart).toLocaleDateString()} →{" "}
                  {new Date(d.leaseEnd).toLocaleDateString()}
                </td>
                <td className="p-2">
                  <button
                    onClick={() => notifyDefaulter(d.tenant?._id)}
                    className="bg-yellow-600 text-white px-3 py-1 rounded"
                  >
                    Notify
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
