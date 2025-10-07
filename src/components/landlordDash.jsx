import React, { useCallback, useEffect, useMemo, useState } from "react";
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
  PieChart,
  Pie,
  Cell,
  Legend
} from "recharts";

const COLORS = ['#10B981', '#3B82F6', '#F59E0B', '#EF4444'];

/** Utilities */
const toDate = (v) => (v ? new Date(v) : null);
const fmtDate = (v) => (v ? toDate(v).toLocaleDateString() : "—");
const fmtKES = (n) =>
  typeof n === "number"
    ? `KES ${n.toLocaleString("en-KE", { maximumFractionDigits: 0 })}`
    : n || "KES 0";

export default function LandlordDashboardContainer() {
  const { token } = useAuth();
  const { showToast } = useToast();

  const [bootLoading, setBootLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [logs, setLogs] = useState([]);
  const [logType, setLogType] = useState("");
  const [page, setPage] = useState(1);
  const [limit] = useState(5);
  const [total, setTotal] = useState(0);
  const [defaulters, setDefaulters] = useState([]);
  const [bulkSending, setBulkSending] = useState(false);
  const [loadingNotifyId, setLoadingNotifyId] = useState(null);

  const authHeader = useMemo(
    () => ({ Authorization: `Bearer ${token}` }),
    [token]
  );

  /** Fetch dashboard stats */
  const fetchDashboardStats = useCallback(async () => {
    try {
      const res = await axios.get("/landlord/dashboard", {
        headers: authHeader,
      });

      const base = res.data || {};
      setStats({
        houses: base.houses || { total: 0, occupied: 0, vacant: 0 },
        maintenance: {
          pending: base?.maintenance?.pending || 0,
          inProgress: base?.maintenance?.inProgress || 0,
          completed: base?.maintenance?.completed || 0,
          thisMonthCount: base?.maintenance?.thisMonthCount || 0,
          monthlyData: base?.maintenance?.monthlyData || {},
        },
        tenants: base.tenants ?? 0,
        caretakers: base.caretakers ?? 0,
        visits: base.visits ?? 0,
        relocations: base.relocations ?? 0,
        defaulters: base.defaulters ?? 0,
        monthlyEarnings: base.monthlyEarnings ?? 0,
        activeAgreements: base.activeAgreements ?? 0,
        rentDue: base.rentDue || [],
      });
    } catch (err) {
      console.error('Dashboard fetch error:', err);
      if (!stats) showToast("Failed to load dashboard stats", "error");
    }
  }, [authHeader, showToast, stats]);

  /** Fetch activity logs */
  const fetchLogs = useCallback(async () => {
    try {
      const skip = (page - 1) * limit;
      const res = await axios.get(`/landlord/activity`, {
        headers: authHeader,
        params: { type: logType, skip, limit },
      });
      setLogs(res.data.logs || []);
      setTotal(res.data.total || 0);
    } catch {
      setLogs([]);
      setTotal(0);
    }
  }, [authHeader, logType, page, limit]);

  /** Fetch defaulters */
  const fetchDefaulters = useCallback(async () => {
    try {
      const res = await axios.get("/defaulters/get-defaulter-list", { 
        headers: authHeader 
      });
      setDefaulters(res.data?.defaulters || []);
      setStats((prev) => ({
        ...(prev || {}),
        defaulters: res.data?.count ?? res.data?.defaulters?.length ?? 0,
      }));
    } catch (err) {
      console.error('Failed to fetch defaulters:', err);
    }
  }, [authHeader]);

  /** Send reminder */
  const sendReminder = async (tenantId) => {
    if (!tenantId) return;
    try {
      setLoadingNotifyId(tenantId);
      // Primary: your first page endpoint
      await axios.post(`/defaulters/rent-defaulters/${tenantId}`, {}, { headers: authHeader });
      showToast("Reminder sent successfully!", "success");
    } catch {
      try {
        // Fallback: your second page endpoint
        const res = await axios.post(`/defaulters-notify/${tenantId}`, {}, { headers: authHeader });
        showToast(res?.data?.message || "Reminder sent successfully!", "success");
      } catch {
        showToast("Failed to send reminder", "error");
      }
    } finally {
      setLoadingNotifyId(null);
    }
  };

  const handleBulkRemind = async () => {
    try {
      setBulkSending(true);
      // Primary: your second page endpoint
      const res = await axios.post("/send-defaulters-sms", {}, { headers: authHeader });
      const cnt = res?.data?.count ?? defaulters?.length ?? 0;
      showToast(`Sent to ${cnt} defaulters`, "success");
    } catch {
      // Optional fallback: attempt to call a batch endpoint if you have it later
      showToast("Failed to send bulk reminders", "error");
    } finally {
      setBulkSending(false);
    }
  };

  useEffect(() => {
    fetchDashboardStats();
    fetchLogs();
    fetchDefaulters();
  }, [fetchDashboardStats, fetchLogs, fetchDefaulters]);

  return (
    <LandlordDashboard
      stats={stats}
      logs={logs}
      type={logType}
      setType={setLogType}
      page={page}
      setPage={setPage}
      limit={limit}
      total={total}
      defaulters={defaulters}
      sendReminder={sendReminder}
      bulkSending={bulkSending}
      loadingNotifyId={loadingNotifyId}
      handleBulkRemind={handleBulkRemind}
    />
  );
}
function LandlordDashboard({
  stats,
  logs,
  type,
  setType,
  page,
  setPage,
  limit,
  total,
  defaulters,
  sendReminder,
  bulkSending,
  loadingNotifyId,
  handleBulkRemind
}) {
  if (!stats) {
    return <div>Loading dashboard...</div>;
  }

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold mb-4">Landlord Dashboard</h1>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-lg font-semibold">Houses</h2>
          <p>Total: {stats.houses.total}</p>
          <p>Occupied: {stats.houses.occupied}</p>
          <p>Vacant: {stats.houses.vacant}</p>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-lg font-semibold">Tenants</h2>
          <p>Total: {stats.tenants}</p>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-lg font-semibold">Caretakers</h2>
          <p>Total: {stats.caretakers}</p>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-lg font-semibold">Defaulters</h2>
          <p>Total: {stats.defaulters}</p>
          <button
            onClick={handleBulkRemind}
            disabled={bulkSending || defaulters.length === 0}
            className={`mt-2 px-3 py-1 rounded text-sm text-white ${bulkSending || defaulters.length === 0 ? 'bg-gray-400 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700'}`}
          >
            {bulkSending ? 'Sending...' : 'Remind All'}
          </button>
        </div>
      </div>

      {/* Maintenance Chart */}
      <div className="bg-white p-4 rounded shadow">
        <h2 className="text-lg font-semibold mb-4">Maintenance Requests (Last 6 Months)</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={Object.entries(stats.maintenance.monthlyData || {}).map(([month, count]) => ({ month, count }))}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="count" fill="#3B82F6" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Rent Due Pie Chart */}
      <div className="bg-white p-4 rounded shadow">
        <h2 className="text-lg font-semibold mb-4">Rent Due Distribution</h2>
        {stats.rentDue.length === 0 ? (
          <p>No rent due data available.</p>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={stats.rentDue}
                dataKey="amount"
                nameKey="tenant"
                cx="50%"
                cy="50%"
                outerRadius={100}
                fill="#10B981"
                label
              >
                {stats.rentDue.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => fmtKES(value)} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Activity Logs */}
      <div className="bg-white p-4 rounded shadow">
        <h2 className="text-lg font-semibold mb-4">Activity Logs</h2>
        <div className="mb-4">
          <select
            value={type}
            onChange={(e) => { setType(e.target.value); setPage(1); }}
            className="border p-2 rounded"
          >
            <option value="">All Types</option>
            <option value="login">Login</option>
            <option value="house">House</option>
            <option value="tenant">Tenant</option>
            <option value="maintenance">Maintenance</option>
            <option value="relocation">Relocation</option>
          </select>
        </div>
        {logs.length === 0 ? (
          <p>No activity logs found.</p>
        ) : (
          <table className="w-full border">
            <thead className="bg-gray-200">
              <tr>
                <th className="p-2">Date</th>
                <th className="p-2">Type</th>
                <th className="p-2">Description</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log._id} className="border-b hover:bg-gray-50 transition">
                  <td className="p-2">{fmtDate(log.date)}</td>
                  <td className="p-2">{log.type}</td>
                  <td className="p-2">{log.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-4 flex justify-center space-x-2">
            <button
              onClick={() => setPage((p) => Math.max(p - 1, 1))}
              disabled={page === 1}
              className={`px-3 py-1 rounded ${page === 1 ? 'bg-gray-300 cursor-not-allowed' : 'bg-blue-500 text-white hover:bg-blue-600'}`}
            >
              Previous
            </button>
            <span className="px-3 py-1 rounded bg-gray-200">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
              disabled={page === totalPages}
              className={`px-3 py-1 rounded ${page === totalPages ? 'bg-gray-300 cursor-not-allowed' : 'bg-blue-500 text-white hover:bg-blue-600'}`}
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* Defaulters List */}
      <div className="bg-white p-4 rounded shadow">
        <h2 className="text-lg font-semibold mb-4">Rent Defaulters</h2>
        {defaulters.length === 0 ? (
          <p>No defaulters at the moment.</p>
        ) : (
          <table className="w-full border">
            <thead className="bg-gray-200">
              <tr>
                <th className="p-2">Tenant</th>
                <th className="p-2">House</th>
                <th className="p-2">Amount Due</th>
                <th className="p-2">Last Payment</th>
                <th className="p-2">Action</th>
              </tr>
            </thead>
            <tbody>
              {defaulters.map((d) => (
                <tr key={d._id} className="border-b hover:bg-gray-50 transition">
                  <td className="p-2">{d.tenantId?.fullName}</td>
                  <td className="p-2">{d.houseId?.title}</td>
                  <td className="p-2 font-semibold text-red-600">{fmtKES(d.amountDue)}</td>
                  <td className="p-2">{fmtDate(d.lastPaymentDate)}</td>
                  <td className="p-2">
                    <button
                      onClick={() => sendReminder(d.tenantId?._id)}
                      disabled={loadingNotifyId === d.tenantId?._id}
                      className={`px-3 py-1 rounded text-sm text-white ${loadingNotifyId === d.tenantId?._id ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600'}`}
                    >
                      {loadingNotifyId === d.tenantId?._id ? 'Sending...' : 'Remind'}
                    </button>
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

const FilterButton = ({ label, active, onClick }) => (
  <button
    onClick={onClick}
    className={`px-3 py-1 rounded ${active ? 'bg-blue-500 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
  >
    {label}
  </button>
);

function exportLogs() {
  // Implement CSV export logic here
  alert("Exporting logs to CSV...");
}
