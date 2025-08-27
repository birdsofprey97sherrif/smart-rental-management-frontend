import React, { useState, useEffect } from "react";
import axios from "../utils/axiosInstance";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

export default function ActivityLog() {
  const { token } = useAuth();
  const { showToast } = useToast();

  const [logs, setLogs] = useState([]);
  const [type, setType] = useState(""); // "", "visit", "relocation", "maintenance"
  const [page, setPage] = useState(1);
  const [limit] = useState(5);
  const [total, setTotal] = useState(0);

  const fetchLogs = React.useCallback( async () => {
    try {
      const skip = (page - 1) * limit;
      const res = await axios.get(`/landlord/dashboard/activity`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { type, skip, limit }
      });
      setLogs(res.data.logs);
      setTotal(res.data.total);
    } catch {
      showToast("Failed to load activity log", "error");
    }
  }, [type, page, limit, token, showToast]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  return (
    <div className="bg-white p-4 rounded shadow mt-6">
      <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>

      {/* Filters */}
      <div className="mb-4 space-x-2">
        <button onClick={() => setType("")} className={`px-3 py-1 rounded ${type === "" ? "bg-blue-500 text-white" : "bg-gray-200"}`}>
          All
        </button>
        <button onClick={() => setType("visit")} className={`px-3 py-1 rounded ${type === "visit" ? "bg-blue-500 text-white" : "bg-gray-200"}`}>
          Visits
        </button>
        <button onClick={() => setType("relocation")} className={`px-3 py-1 rounded ${type === "relocation" ? "bg-blue-500 text-white" : "bg-gray-200"}`}>
          Relocations
        </button>
        <button onClick={() => setType("maintenance")} className={`px-3 py-1 rounded ${type === "maintenance" ? "bg-blue-500 text-white" : "bg-gray-200"}`}>
          Maintenance
        </button>
      </div>

      {/* Log Table */}
      {logs.length === 0 ? (
        <p>No activity found.</p>
      ) : (
        <ul>
          {logs.map((log, idx) => (
            <li key={idx} className="border-b py-2 flex justify-between">
              <div>
                <span className="font-bold">{log.type}</span> – {log.house} ({log.tenant})
              </div>
              <div className="text-sm text-gray-500">
                {log.status} | {new Date(log.date).toLocaleDateString()}
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* Pagination */}
      <div className="flex justify-between items-center mt-4">
        <button
          onClick={() => setPage((p) => Math.max(p - 1, 1))}
          disabled={page === 1}
          className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
        >
          Prev
        </button>
        <span>Page {page}</span>
        <button
          onClick={() => {
            if (page * limit < total) setPage((p) => p + 1);
          }}
          disabled={page * limit >= total}
          className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
}
