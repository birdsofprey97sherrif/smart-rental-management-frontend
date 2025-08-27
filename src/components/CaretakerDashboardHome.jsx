import React, { useEffect, useState, useCallback } from "react";
import axios from "../utils/axiosInstance";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { Pie, Line } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip as ChartTooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement } from "chart.js";
import { Link } from "react-router-dom";

ChartJS.register(ArcElement, ChartTooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement);

export default function CaretakerDashboardHome() {
  const { token } = useAuth();
  const { showToast } = useToast();

  // ===== States =====
  const [stats, setStats] = useState(null); // Dashboard summary stats
  const [logs, setLogs] = useState([]); // Activity logs
  const [type, setType] = useState(""); // Filter for logs
  const [page, setPage] = useState(1);
  const [limit] = useState(5);
  const [total, setTotal] = useState(0);

  const [maintenance, setMaintenance] = useState([]); // Maintenance requests
  const [relocations, setRelocations] = useState([]); // Recent relocations

  // ===== API: Fetch Stats =====
  const fetchDashboardStats = useCallback(async () => {
    try {
      const res = await axios.get("/caretaker/dashboard", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setStats(res.data);
    } catch {
      showToast("Failed to load dashboard stats", "error");
    }
  }, [token, showToast]);

  // ===== API: Fetch Activity Logs =====
  const fetchLogs = useCallback(async () => {
    try {
      const skip = (page - 1) * limit;
      const res = await axios.get(`/caretaker/dashboard/activity`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { type, skip, limit }
      });
      setLogs(res.data.logs);
      setTotal(res.data.total);
    } catch {
      showToast("Failed to load activity logs", "error");
    }
  }, [type, page, limit, token, showToast]);

  // ===== API: Fetch Maintenance + Relocations =====
  const fetchOtherData = useCallback(async () => {
    try {
      const [maintRes, relocRes] = await Promise.all([
        axios.get("/maintenance/my-houses", { headers: { Authorization: `Bearer ${token}` } }),
        axios.get("/relocations/my-houses", { params: { limit: 5 }, headers: { Authorization: `Bearer ${token}` } })
      ]);
      setMaintenance(maintRes.data.requests || []);
      setRelocations(relocRes.data.relocations || []);
    } catch {
      showToast("Failed to load maintenance/relocations", "error");
    }
  }, [token, showToast]);

  // ===== CSV Export =====
  const exportLogs = () => {
    const csvContent = [
      ["Type", "House", "Tenant/Landlord", "Status", "Date"],
      ...logs.map(l => [l.type, l.house, l.person, l.status, new Date(l.date).toLocaleDateString()])
    ].map(e => e.join(",")).join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "caretaker_activity_logs.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // ===== Auto Refresh Every 30s =====
  useEffect(() => {
    fetchDashboardStats();
    fetchLogs();
    fetchOtherData();

    const interval = setInterval(() => {
      fetchDashboardStats();
      fetchLogs();
      fetchOtherData();
    }, 30000);

    return () => clearInterval(interval);
  }, [fetchDashboardStats, fetchLogs, fetchOtherData]);

  if (!stats) return <p>Loading dashboard...</p>;

  // ===== Recharts Maintenance Bar Data =====
  const maintenanceChartData = Object.entries(stats.maintenance?.monthlyData || {})
    .map(([month, count]) => ({ month, count }))
    .slice(-6);

  // ===== Chart.js Pie Data =====
  const statusCounts = {
    pending: maintenance.filter(m => m.status === "pending").length,
    "in-progress": maintenance.filter(m => m.status === "in-progress").length,
    completed: maintenance.filter(m => m.status === "completed").length
  };
  const pieData = {
    labels: ["Pending", "In Progress", "Completed"],
    datasets: [
      {
        data: [statusCounts.pending, statusCounts["in-progress"], statusCounts.completed],
        backgroundColor: ["#fbbf24", "#3b82f6", "#10b981"]
      }
    ]
  };

  // ===== Chart.js Line Data =====
  const months = [...new Set(maintenance.map(m => new Date(m.createdAt).toLocaleString("default", { month: "short" })))];
  const monthCounts = months.map(month => maintenance.filter(m => new Date(m.createdAt).toLocaleString("default", { month: "short" }) === month).length);
  const lineChartData = {
    labels: months,
    datasets: [
      {
        label: "Requests",
        data: monthCounts,
        borderColor: "#3b82f6",
        backgroundColor: "#93c5fd",
        tension: 0.3
      }
    ]
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Caretaker Dashboard</h1>

      {/* ===== Summary Cards ===== */}
      <div className="row mb-4">
        <Card title="Houses Managed" value={stats?.housesManaged} />
        <Card title="Pending Visits" value={stats?.visitsPending} />
        <Card title="Pending Relocations" value={stats?.relocationsPending} />
        <Card title="Pending Maintenance" value={stats?.maintenance?.pending} />
      </div>


      {/* ===== Combined Charts ===== */}
      <div className="grid md:grid-cols-3 gap-4 mb-6">
        {/* Recharts Bar Chart */}
        <div className="bg-white p-4 rounded shadow col-span-1">
          <h3 className="text-lg font-semibold mb-4">Maintenance (Last 6 Months)</h3>
          {maintenanceChartData.length === 0 ? (
            <p>No data available.</p>
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={maintenanceChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#3B82F6" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Chart.js Pie */}
        <div className="bg-white p-4 rounded shadow col-span-1">
          <h3 className="text-lg font-semibold mb-2">Maintenance Status Distribution</h3>
          <Pie data={pieData} />
        </div>

        {/* Chart.js Line */}
        <div className="bg-white p-4 rounded shadow col-span-1">
          <h3 className="text-lg font-semibold mb-2">Monthly Trends</h3>
          <Line data={lineChartData} />
        </div>
      </div>

      {/* ===== Recent Relocations ===== */}
      <div className="bg-white rounded shadow overflow-hidden mb-6">
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="text-lg font-semibold">Recent Relocations</h3>
          <Link to="/caretaker/relocations" className="text-blue-500 hover:underline text-sm">View All</Link>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-3 text-left">Tenant</th>
              <th className="p-3 text-left">House</th>
              <th className="p-3 text-left">Status</th>
              <th className="p-3 text-left">Maintenance Status</th>
            </tr>
          </thead>
          <tbody>
            {relocations.length === 0 ? (
              <tr><td colSpan="4" className="p-4 text-center text-gray-500">No relocations found.</td></tr>
            ) : (
              relocations.map(r => (
                <tr key={r._id} className="border-t">
                  <td className="p-3">{r.tenantId?.fullName}</td>
                  <td className="p-3">{r.houseId?.title}</td>
                  <td className="p-3 capitalize">{r.status}</td>
                  <td className="p-3 capitalize">{r.maintenanceStatus || "N/A"}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ===== Activity Logs ===== */}
      <div className="bg-white p-4 rounded shadow mt-6">
        <div className="flex justify-between items-center mb-4 sticky top-0 bg-white z-10 py-2">
          <h3 className="text-lg font-semibold">Recent Activity</h3>
          <button onClick={exportLogs} className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600">
            Export CSV
          </button>
        </div>

        {/* Filters */}
        <div className="mb-4 space-x-2 sticky top-10 bg-white z-10 py-2">
          <FilterButton label="All" active={type === ""} onClick={() => setType("")} />
          <FilterButton label="Visits" active={type === "visit"} onClick={() => setType("visit")} />
          <FilterButton label="Relocations" active={type === "relocation"} onClick={() => setType("relocation")} />
          <FilterButton label="Maintenance" active={type === "maintenance"} onClick={() => setType("maintenance")} />
        </div>

        {/* Logs List */}
        {logs.length === 0 ? (
          <p>No activity found.</p>
        ) : (
          <ul>
            {logs.map((log, idx) => (
              <li key={idx} className="border-b py-2 flex justify-between hover:bg-gray-50 transition">
                <div>
                  <span className="mr-2">
                    {log.type === "Visit Request" ? "🏠" :
                      log.type === "Relocation" ? "🚚" : "🔧"}
                  </span>
                  <span className="font-bold">{log.type}</span> – {log.house} ({log.person})
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
    </div>
  );
}

// ===== Reusable Components =====
function Card({ title, value }) {
  return (
    <div className="col-md-6 col-lg-3 mb-4">
      <div className="card shadow-sm border-start border-primary border-4 h-100 text-center">
        <div className="card-body">
          <p className="fs-4 fw-bold mb-1">{value}</p>
          <p className="text-muted small mb-0">{title}</p>
        </div>
      </div>
    </div>
  );
}


function FilterButton({ label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1 rounded ${active ? "bg-blue-500 text-white" : "bg-gray-200 hover:bg-gray-300"}`}
    >
      {label}
    </button>
  );
}
