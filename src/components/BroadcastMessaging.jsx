import React, { useState, useEffect } from "react";
import axios from "../utils/axiosInstance";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

export default function BroadcastMessaging() {
  const { token } = useAuth();
  const { showToast } = useToast();

  const [form, setForm] = useState({
    recipients: "tenants",
    subject: "",
    message: "",
  });
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  const sendBroadcast = async () => {
    if (!form.subject || !form.message) {
      showToast("Subject and message are required", "error");
      return;
    }
    try {
      setLoading(true);
      await axios.post("/messages/send", form, {
        headers: { Authorization: `Bearer ${token}` },
      });
      showToast("Message sent successfully", "success");
      setForm({ recipients: "tenants", subject: "", message: "" });
      fetchHistory();
    } catch {
      showToast("Failed to send message", "error");
    } finally {
      setLoading(false);
    }
  };

  const fetchHistory = React.useCallback( async () => {
    try {
      const res = await axios.get("/messages/history", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setHistory(res.data.messages || []);
    } catch {
      showToast("Failed to load message history", "error");
    }
  }, [token, showToast]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Broadcast Messaging</h2>

      {/* Form */}
      <div className="bg-white p-4 rounded shadow mb-6 space-y-4">
        <div>
          <label className="block font-semibold mb-1">Recipients</label>
          <select
            value={form.recipients}
            onChange={(e) => setForm({ ...form, recipients: e.target.value })}
            className="border p-2 rounded w-full"
          >
            <option value="tenants">All Tenants</option>
            <option value="caretakers">All Caretakers</option>
            <option value="all">All (Tenants + Caretakers)</option>
          </select>
        </div>

        <div>
          <label className="block font-semibold mb-1">Subject</label>
          <input
            type="text"
            value={form.subject}
            onChange={(e) => setForm({ ...form, subject: e.target.value })}
            className="border p-2 rounded w-full"
            placeholder="Enter subject"
          />
        </div>

        <div>
          <label className="block font-semibold mb-1">Message</label>
          <textarea
            value={form.message}
            onChange={(e) => setForm({ ...form, message: e.target.value })}
            className="border p-2 rounded w-full"
            rows={4}
            placeholder="Type your message..."
          />
        </div>

        <button
          onClick={sendBroadcast}
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          {loading ? "Sending..." : "Send Broadcast"}
        </button>
      </div>

      {/* History */}
      <h3 className="text-xl font-semibold mb-2">Sent Broadcasts</h3>
      {history.length === 0 ? (
        <p>No broadcast history available.</p>
      ) : (
        <table className="w-full border">
          <thead className="bg-gray-200">
            <tr>
              <th className="p-2">Recipients</th>
              <th className="p-2">Subject</th>
              <th className="p-2">Message</th>
              <th className="p-2">Date</th>
            </tr>
          </thead>
          <tbody>
            {history.map((msg) => (
              <tr key={msg._id} className="border-b">
                <td className="p-2 capitalize">{msg.recipients}</td>
                <td className="p-2">{msg.subject}</td>
                <td className="p-2">{msg.message}</td>
                <td className="p-2">
                  {new Date(msg.createdAt).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
