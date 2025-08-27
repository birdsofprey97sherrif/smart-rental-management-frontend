import React, { useEffect, useState } from "react";
import axios from "../utils/axiosInstance";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

export default function LandlordDashboard() {
  const { token } = useAuth();
  const { showToast } = useToast();
  const [stats, setStats] = useState({});
  const [logs, setLogs] = useState([]);
  const [type, setType] = useState("");
  const [page, setPage] = useState(1);
  const [limit] = useState(5);
  const [total, setTotal] = useState(0);

  const fetchDashboardStats = React.useCallback(async () => {
    console.log("🔄 fetchDashboardStats called with token:", token ? "exists" : "missing");

    try {
      const res = await axios.get("/landlord/dashboard", { // ✅ Use consistent relative URL
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log("✅ Dashboard stats received:", res.data);
      setStats(res.data);
    } catch (error) { // ✅ Capture the actual error
      console.error("❌ Error fetching dashboard stats:", error);
      console.error("Full error object:", error);
      showToast("Failed to load dashboard stats", "error");
    }
  }, [token, showToast]);
  
  const fetchLogs = React.useCallback(async () => {
    console.log("🔄 fetchLogs called");

    try {
      const skip = (page - 1) * limit;
      const res = await axios.get(`/landlord/activity`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { type, skip, limit }
      });
      console.log("✅ Activity logs received:", res.data);
      setLogs(res.data.logs);
      setTotal(res.data.total);
    } catch (error) { // ✅ Also fix this catch block
      console.error("❌ Error fetching logs:", error.response?.data || error.message);
      showToast("Failed to load activity log", "error");
    }
  }, [type, page, limit, token, showToast]);

  const sendReminder = async (tenantId) => {
    try {
      await axios.post(`/defaulters/rent-defaulters/${tenantId}`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      showToast("Reminder sent successfully!", "success");
    } catch {
      showToast("Failed to send reminder", "error");
    }
  };

  const exportLogs = () => {
    const csvContent = [
      ["Type", "House", "Tenant", "Status", "Date"],
      ...logs.map(l => [l.type, l.house, l.tenant, l.status, new Date(l.date).toLocaleDateString()])
    ].map(e => e.join(",")).join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "activity_logs.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  useEffect(() => {
    fetchLogs();
    const interval = setInterval(() => {
      fetchDashboardStats(); // ✅ now works
      fetchLogs();
    }, 300000);

    return () => clearInterval(interval);
  }, [fetchLogs, fetchDashboardStats]);
  if (!stats) return <p>Loading dashboard...</p>;

  const chartData = Object.entries(stats?.maintenance?.monthlyData || {})
    .map(([month, count]) => ({ month, count }))
    .slice(-6);

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Landlord Dashboard</h1>

      <div className="container-fluid">
  {/* Stats Section */}
  <div className="row mb-4">
    <Card title="Houses" value={stats?.houses?.total} />
    <Card title="Tenants" value={stats?.tenants} />
    <Card title="Caretakers" value={stats?.caretakers} />
    <Card title="Visit Requests" value={stats?.visits} />
    <Card title="Relocations" value={stats?.relocations} />
    <Card title="Defaulters" value={stats?.defaulters} />
  </div>

  {/* Occupancy Section */}
  <h5 className="mb-3">Occupancy Breakdown</h5>
  <div className="row mb-4">
    <Card title="Occupied Houses" value={stats?.houses?.occupied} />
    <Card title="Vacant Houses" value={stats?.houses?.vacant} />
  </div>

  {/* Maintenance Section */}
  <h5 className="mb-3">Maintenance Summary</h5>
  <div className="row mb-4">
    <Card title="Pending Maintenance" value={stats?.maintenance?.pending} />
    <Card title="In Progress" value={stats?.maintenance?.inProgress} />
    <Card title="Completed" value={stats?.maintenance?.completed} />
    <Card title="This Month" value={stats?.maintenance?.thisMonthCount} />
  </div>
</div>

      {/* Maintenance Chart */}
      <div className="bg-white p-4 rounded shadow mb-6">
        <h3 className="text-lg font-semibold mb-4">Maintenance (Last 6 Months)</h3>
        {chartData?.length === 0 ? (
          <p>No data available.</p>
        ) : (
          <ResponsiveContainer width="100%" height={250}>
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

      {/* Upcoming Rent Due */}
      <div className="bg-white p-4 rounded shadow mb-6">
        <h3 className="text-lg font-semibold mb-4">Upcoming Rent Due (Next 7 Days)</h3>
        {stats?.rentDue?.length === 0 ? (
          <p>No upcoming rent due.</p>
        ) : (
          <table className="w-full border">
            <thead className="bg-gray-200">
              <tr>
                <th className="p-2">Tenant</th>
                <th className="p-2">House</th>
                <th className="p-2">Due Date</th>
                <th className="p-2">Action</th>
              </tr>
            </thead>
            <tbody>
              {stats?.defaulters?.map((r, idx) => (
                <tr key={idx} className="border-b hover:bg-gray-50 transition">
                  <td className="p-2">{r.tenantId?.fullName}</td>
                  <td className="p-2">{r.houseId?.title}</td>
                  <td className="p-2">{new Date(r.dueDate).toLocaleDateString()}</td>
                  <td className="p-2">
                    <button
                      onClick={() => sendReminder(r.tenantId?._id)}
                      className="px-2 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
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

      {/* Recent Activity with Filters + Export */}
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

        {/* Log Table */}
        {logs?.length === 0 ? (
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
    </div>
  );
}

function Card({ title, value }) {
  return (
    <div className="col-md-4 col-lg-3 mb-4"> {/* This controls column width */}
      <div className="card shadow-sm border-start border-success border-4 h-100 text-center p-4 hover:shadow-lg transition">
        <div className="card-body">
          <p className="text-2xl font-bold">{value}</p>
          <p className="text-sm text-gray-600">{title}</p>
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
