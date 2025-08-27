import React, { useEffect, useState, useCallback } from "react";
import axios from "../utils/axiosInstance";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

const statusOptions = ["pending", "in-progress", "completed"];

export default function LandlordMaintenanceManagement() {
  const { token } = useAuth();
  const { showToast } = useToast();

  const [requests, setRequests] = useState([]);
  const [houses, setHouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    pending: 0,
    inProgress: 0,
    completed: 0,
    thisMonthCount: 0,
    monthlyData: {},
  });
  const [filters, setFilters] = useState({
    status: "",
    houseId: "",
    startDate: "",
    endDate: "",
  });

  /** Fetch Houses */
  const fetchHouses = useCallback(async () => {
    try {
      const res = await axios.get("/houses/search", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setHouses(res.data.houses || []);
    } catch {
      showToast("Failed to load houses", "error");
    }
  }, [token, showToast]);

  /** Fetch Maintenance Requests */
  const fetchRequests = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get("/maintenance/maintenance", {
        headers: { Authorization: `Bearer ${token}` },
        params: filters,
      });
      setRequests(res.data.requests || []);
    } catch {
      showToast("Failed to load maintenance requests", "error");
    } finally {
      setLoading(false);
    }
  }, [token, showToast, filters]);

  /** Fetch Stats */
  const fetchStats = useCallback(async () => {
    try {
      const res = await axios.get("/maintenance/landlord/stats", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setStats(res.data);
    } catch {
      showToast("Failed to load maintenance stats", "error");
    }
  }, [token, showToast]);

  /** Update Status */
  const handleStatusUpdate = async (id, newStatus) => {
    try {
      const res = await axios.patch(
        `/maintenance/maintenance/${id}`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.status !== 200) {
        showToast("Failed to update status", "error");
        return;
      }
      setRequests((prev) =>
        prev.map((r) => (r._id === id ? { ...r, status: newStatus } : r))
      );
      showToast("Status updated!", "success");
      fetchStats(); // refresh stats after status change
    } catch {
      showToast("Failed to update status", "error");
    }
  };

  /** Load Data */
  useEffect(() => {
    fetchHouses();
    fetchRequests();
    fetchStats();
  }, [fetchHouses, fetchRequests, fetchStats]);

  // Prepare chart data
  const chartData = Object.entries(stats.monthlyData || {}).map(
    ([month, count]) => ({ month, count })
  );

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Landlord Maintenance Management</h2>

      {/* Summary Cards */}
      <div className="row mb-4">
        <div className="col-md-6 col-lg-3 mb-3">
          <div className="card text-center shadow-sm border-0 h-100" style={{ backgroundColor: "#FEF9C3" }}>
            <div className="card-body">
              <p className="fs-4 fw-bold mb-1">{stats?.pending}</p>
              <p className="text-muted small mb-0">Pending</p>
            </div>
          </div>
        </div>

        <div className="col-md-6 col-lg-3 mb-3">
          <div className="card text-center shadow-sm border-0 h-100" style={{ backgroundColor: "#DBEAFE" }}>
            <div className="card-body">
              <p className="fs-4 fw-bold mb-1">{stats?.inProgress}</p>
              <p className="text-muted small mb-0">In Progress</p>
            </div>
          </div>
        </div>

        <div className="col-md-6 col-lg-3 mb-3">
          <div className="card text-center shadow-sm border-0 h-100" style={{ backgroundColor: "#DCFCE7" }}>
            <div className="card-body">
              <p className="fs-4 fw-bold mb-1">{stats?.completed}</p>
              <p className="text-muted small mb-0">Completed</p>
            </div>
          </div>
        </div>

        <div className="col-md-6 col-lg-3 mb-3">
          <div className="card text-center shadow-sm border-0 h-100" style={{ backgroundColor: "#EDE9FE" }}>
            <div className="card-body">
              <p className="fs-4 fw-bold mb-1">{stats?.thisMonthCount}</p>
              <p className="text-muted small mb-0">This Month</p>
            </div>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-white p-4 rounded shadow mb-6">
        <h3 className="text-lg font-semibold mb-4">Monthly Maintenance Trends</h3>
        {chartData.length === 0 ? (
          <p>No data available.</p>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#3B82F6" />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded shadow mb-4 flex gap-4 items-end flex-wrap">
        <div>
          <label className="block font-semibold mb-1">Status</label>
          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            className="border p-2 rounded"
          >
            <option value="">All</option>
            {statusOptions.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block font-semibold mb-1">House</label>
          <select
            value={filters.houseId}
            onChange={(e) => setFilters({ ...filters, houseId: e.target.value })}
            className="border p-2 rounded"
          >
            <option value="">All</option>
            {houses.map((h) => (
              <option key={h._id} value={h._id}>
                {h.title}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block font-semibold mb-1">From</label>
          <input
            type="date"
            value={filters.startDate}
            onChange={(e) =>
              setFilters({ ...filters, startDate: e.target.value })
            }
            className="border p-2 rounded"
          />
        </div>
        <div>
          <label className="block font-semibold mb-1">To</label>
          <input
            type="date"
            value={filters.endDate}
            onChange={(e) =>
              setFilters({ ...filters, endDate: e.target.value })
            }
            className="border p-2 rounded"
          />
        </div>
        <button
          onClick={fetchRequests}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Apply Filters
        </button>
      </div>

      {/* Requests Table */}
      <div className="overflow-auto">
        <h3 className="text-lg font-semibold mb-2">Maintenance Requests</h3>
        {loading ? (
          <p>Loading maintenance requests...</p>
        ) : requests.length === 0 ? (
          <p>No maintenance requests found.</p>
        ) : (
          <table className="min-w-full text-sm border shadow-sm">
            <thead className="bg-gray-100 text-left">
              <tr>
                <th className="p-2">Issue</th>
                <th className="p-2">House</th>
                <th className="p-2">Tenant</th>
                <th className="p-2">Status</th>
                <th className="p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((r) => (
                <tr key={r._id} className="border-t">
                  <td className="p-2">{r.issue}</td>
                  <td className="p-2">{r.houseId?.title || "N/A"}</td>
                  <td className="p-2">
                    <div>{r.tenantId?.fullName}</div>
                    <div className="text-xs text-gray-500">
                      {r.tenantId?.phone}
                    </div>
                  </td>
                  <td className="p-2 capitalize">
                    <span
                      className={`inline-block px-2 py-1 rounded text-white ${r.status === "pending"
                          ? "bg-yellow-500"
                          : r.status === "in-progress"
                            ? "bg-blue-500"
                            : "bg-green-600"
                        }`}
                    >
                      {r.status}
                    </span>
                  </td>
                  <td className="p-2">
                    <select
                      value={r.status}
                      onChange={(e) =>
                        handleStatusUpdate(r._id, e.target.value)
                      }
                      className="border rounded px-2 py-1 text-sm"
                    >
                      {statusOptions.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
