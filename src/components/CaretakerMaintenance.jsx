import React, { useEffect, useState } from "react";
import axios from "../utils/axiosInstance";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { Pie } from "react-chartjs-2";
import { LineChart } from "lucide-react";
export default function CaretakerMaintenance() {
  const { token } = useAuth();
  const { showToast } = useToast();

  const [houses, setHouses] = useState([]);
  const [requests, setRequests] = useState([]);
  const [filters, setFilters] = useState({ status: "", houseId: "", startDate: "", endDate: "" });
  const [page, setPage] = useState(1);
  const [limit] = useState(8);
  const [total, setTotal] = useState(0);
  const [creating, setCreating] = useState(false);
  const [newReq, setNewReq] = useState({ houseId: "", issue: "" });
  const [stats, setStats] = useState({ pending: 0, inProgress: 0, completed: 0, monthlyData: {} });
  // fetch houses managed
  const fetchHouses = React.useCallback(async () => {
    try {
      const res = await axios.get("/caretaker/houses-managed", { headers: { Authorization: `Bearer ${token}` } });
      setHouses(res.data.houses || []);
    } catch {
      showToast("Failed to load houses", "error");
    }
  }, [token, showToast]);

  // fetch maintenance with filters/paging
  const fetchRequests = React.useCallback(async () => {
    try {
      const skip = (page - 1) * limit;
      const params = { skip, limit, ...filters };
      const res = await axios.get("/maintenance/caretaker", { headers: { Authorization: `Bearer ${token}` }, params });
      setRequests(res.data.requests || res.data || []);
      setTotal(res.data.total ?? (res.data.requests ? res.data.total : (res.data.length || 0)));
    } catch {
      showToast("Failed to load maintenance requests", "error");
    }
  }, [page, limit, filters, token, showToast]);

  const fetchStats = React.useCallback(async () => {
    try {
      const res = await axios.get("/maintenance/maintenance", { headers: { Authorization: `Bearer ${token}` } });
      setStats(res.data);
    } catch {
      showToast("Failed to load maintenance stats", "error");
    }
  }, [token, showToast]);

  useEffect(() => {
    fetchHouses();
    fetchRequests();
    fetchStats();
    const interval = setInterval(() => { fetchRequests(); fetchStats(); }, 30000);
    return () => clearInterval(interval);
  }, [fetchHouses, fetchRequests, fetchStats]);

  const createRequest = async () => {
    if (!newReq.houseId || !newReq.issue) return showToast("House and issue are required", "error");
    try {
      await axios.post("/maintenance/maintenance", newReq, { headers: { Authorization: `Bearer ${token}` } });
      showToast("Maintenance request created", "success");
      setCreating(false);
      setNewReq({ houseId: "", issue: "" });
      fetchRequests();
      fetchStats();
    } catch {
      showToast("Failed to create request", "error");
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await axios.patch(`/maintenance/maintenance/${id}`, { status }, { headers: { Authorization: `Bearer ${token}` } });
      showToast("Status updated", "success");
      fetchRequests();
      fetchStats();
    } catch {
      showToast("Failed to update status", "error");
    }
  };

  const deleteRequest = async (id) => {
    if (!window.confirm("Delete this request?")) return;
    try {
      await axios.delete(`/maintenance/maintenance/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      showToast("Request deleted", "success");
      fetchRequests();
      fetchStats();
    } catch {
      showToast("Failed to delete request", "error");
    }
  };

  const exportCSV = () => {
    const rows = [
      ["House", "Tenant", "Issue", "Status", "CreatedAt", "UpdatedAt"],
      ...requests.map(r => [
        r.houseId?.title ?? "",
        r.tenantId?.fullName ?? "",
        r.issue ?? "",
        r.status ?? "",
        r.createdAt ? new Date(r.createdAt).toLocaleString() : "",
        r.updatedAt ? new Date(r.updatedAt).toLocaleString() : ""
      ])
    ];
    const csv = rows.map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "maintenance_requests.csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const chartData = Object.entries(stats.monthlyData || {}).map(([m, c]) => ({ month: m, count: c })).slice(-6);

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Maintenance Management</h2>

      {/* ===== Summary + Chart ===== */}
      <div className="row mb-4">
        <div className="col-md-4 mb-3">
          <div className="card shadow-sm border-0 text-center h-100">
            <div className="card-body">
              <p className="fs-4 fw-bold mb-1">{stats?.pending}</p>
              <p className="text-muted small mb-0">Pending</p>
            </div>
          </div>
        </div>

        <div className="col-md-4 mb-3">
          <div className="card shadow-sm border-0 text-center h-100">
            <div className="card-body">
              <p className="fs-4 fw-bold mb-1">{stats?.inProgress}</p>
              <p className="text-muted small mb-0">In Progress</p>
            </div>
          </div>
        </div>

        <div className="col-md-4 mb-3">
          <div className="card shadow-sm border-0 text-center h-100">
            <div className="card-body">
              <p className="fs-4 fw-bold mb-1">{stats?.completed}</p>
              <p className="text-muted small mb-0">Completed</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-end">
        <button onClick={() => setCreating(true)} className="px-3 py-1 bg-blue-600 text-white rounded">New Request</button>
        <button onClick={exportCSV} className="ml-2 px-3 py-1 bg-green-500 text-white rounded">Export CSV</button>
      </div>

      <div className="bg-white p-4 rounded shadow mb-6">
        <h3 className="font-semibold mb-3">Maintenance Trends</h3>
        {chartData.length === 0 ? <p>No data</p> :
          <ResponsiveContainer width="100%" height={180}><BarChart data={chartData}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="month" /><YAxis /><Tooltip /><Bar dataKey="count" fill="#3B82F6" /></BarChart></ResponsiveContainer>
        }
      </div>

      {/* Sticky filter bar */}
      <div className="bg-white p-3 rounded shadow sticky top-16 z-20 mb-4">
        <div className="flex gap-3 flex-wrap items-end">
          <div>
            <label className="block text-sm text-gray-600">Status</label>
            <select value={filters.status} onChange={(e) => { setPage(1); setFilters({ ...filters, status: e.target.value }) }} className="border px-2 py-1 rounded">
              <option value="">All</option>
              <option value="pending">Pending</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          <div>
            <label className="block text-sm text-gray-600">House</label>
            <select value={filters.houseId} onChange={(e) => { setPage(1); setFilters({ ...filters, houseId: e.target.value }) }} className="border px-2 py-1 rounded min-w-[220px]">
              <option value="">All Houses</option>
              {houses.map(h => <option key={h._id} value={h._id}>{h.title}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm text-gray-600">From</label>
            <input type="date" value={filters.startDate} onChange={(e) => { setPage(1); setFilters({ ...filters, startDate: e.target.value }) }} className="border px-2 py-1 rounded" />
          </div>

          <div>
            <label className="block text-sm text-gray-600">To</label>
            <input type="date" value={filters.endDate} onChange={(e) => { setPage(1); setFilters({ ...filters, endDate: e.target.value }) }} className="border px-2 py-1 rounded" />
          </div>

          <div className="ml-auto text-sm text-gray-500 self-end">Page {page}</div>
        </div>
      </div>

      {/* Requests Table */}
      <div className="bg-white rounded shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 text-sm text-gray-600">
            <tr>
              <th className="p-3 text-left">House</th>
              <th className="p-3 text-left">Tenant</th>
              <th className="p-3 text-left">Issue</th>
              <th className="p-3 text-left">Status</th>
              <th className="p-3 text-left">Created</th>
              <th className="p-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {requests.length === 0 ? (
              <tr><td className="p-4 text-center text-gray-500" colSpan="6">No requests</td></tr>
            ) : requests.map(r => (
              <tr key={r._id} className="border-t hover:bg-gray-50 transition">
                <td className="p-3">{r.houseId?.title}</td>
                <td className="p-3">{r.tenantId?.fullName}</td>
                <td className="p-3">{r.issue}</td>
                <td className="p-3 capitalize">{r.status}</td>
                <td className="p-3">{new Date(r.createdAt).toLocaleString()}</td>
                <td className="p-3 flex gap-2">
                  {r.status !== "in-progress" && <button onClick={() => updateStatus(r._id, "in-progress")} className="px-3 py-1 bg-yellow-500 text-white rounded">Mark In Progress</button>}
                  {r.status !== "completed" && <button onClick={() => updateStatus(r._id, "completed")} className="px-3 py-1 bg-green-600 text-white rounded">Mark Completed</button>}
                  <button onClick={() => deleteRequest(r._id)} className="px-3 py-1 bg-red-600 text-white rounded">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination footer */}
      <div className="flex items-center justify-between mt-3 text-sm text-gray-600">
        <div>{total} results</div>
        <div>
          <button onClick={() => setPage(p => Math.max(p - 1, 1))} disabled={page === 1} className="px-2 py-1 bg-gray-200 rounded mr-2">Prev</button>
          <span>Page {page}</span>
          <button onClick={() => setPage(p => p + 1)} className="px-2 py-1 bg-gray-200 rounded ml-2">Next</button>
        </div>
      </div>

      {/* Create modal */}
      {
        creating && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded shadow w-full max-w-md">
              <h3 className="text-lg font-semibold mb-3">New Maintenance Request</h3>
              <div className="flex flex-col gap-2">
                <select value={newReq.houseId} onChange={(e) => setNewReq({ ...newReq, houseId: e.target.value })} className="border p-2 rounded">
                  <option value="">Select house</option>
                  {houses.map(h => <option key={h._id} value={h._id}>{h.title}</option>)}
                </select>
                <textarea value={newReq.issue} onChange={(e) => setNewReq({ ...newReq, issue: e.target.value })} placeholder="Describe issue" className="border p-2 rounded" rows={4} />
                <div className="flex justify-end gap-2 mt-3">
                  <button onClick={() => setCreating(false)} className="px-3 py-1 bg-gray-200 rounded">Cancel</button>
                  <button onClick={createRequest} className="px-3 py-1 bg-blue-600 text-white rounded">Create</button>
                </div>
              </div>
            </div>
          </div>
        )
      }
    </div >
  );
}

function DashboardCharts({ maintenanceData, lineChartData }) {
  const statusCounts = {
    pending: maintenanceData.filter(m => m.status === "pending").length,
    "in-progress": maintenanceData.filter(m => m.status === "in-progress").length,
    completed: maintenanceData.filter(m => m.status === "completed").length
  };

  const pieData = {
    labels: ["Pending", "In Progress", "Completed"],
    datasets: [
      {
        data: [
          statusCounts.pending,
          statusCounts["in-progress"],
          statusCounts.completed
        ],
        backgroundColor: ["#fbbf24", "#3b82f6", "#10b981"],
        borderWidth: 2,
        hoverOffset: 6
      }
    ]
  };

  return (
    <div className="grid md:grid-cols-2 gap-6 mt-6">
      {/* Status Distribution */}
      <div className="bg-white rounded-xl shadow-md p-5 flex flex-col justify-between h-full">
        <h3 className="text-lg font-semibold text-gray-700 mb-4 border-b pb-2">
          Status Distribution
        </h3>
        <div className="flex justify-center items-center h-64">
          <Pie data={pieData} />
        </div>
      </div>

      {/* Monthly Trends */}
      <div className="bg-white rounded-xl shadow-md p-5 flex flex-col justify-between h-full">
        <h3 className="text-lg font-semibold text-gray-700 mb-4 border-b pb-2">
          Monthly Trends
        </h3>
        <div className="h-64">
          <LineChart
            data={lineChartData}
            options={{ responsive: true, maintainAspectRatio: false }}
          />
        </div>
      </div>
    </div>
  );
}


