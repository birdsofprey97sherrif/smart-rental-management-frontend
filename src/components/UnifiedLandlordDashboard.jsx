// src/components/UnifiedLandlordDashboard.jsx
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
  Legend,
  LineChart,
  Line
} from "recharts";

// Color palette for charts
const COLORS = ['#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

/** Utility Functions */
const toDate = (v) => (v ? new Date(v) : null);
const fmtDate = (v) => (v ? toDate(v).toLocaleDateString() : "—");
const fmtKES = (n) =>
  typeof n === "number"
    ? `KES ${n.toLocaleString("en-KE", { maximumFractionDigits: 0 })}`
    : n || "KES 0";

/** Main Component */
export default function UnifiedLandlordDashboard() {
  const { token } = useAuth();
  const { showToast } = useToast();

  // State Management
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
  const [activeTab, setActiveTab] = useState("overview"); // overview, defaulters, activity, analytics

  const authHeader = useMemo(
    () => ({ Authorization: `Bearer ${token}` }),
    [token]
  );

  /** Fetch Dashboard Stats */
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
        pendingMaintenance: base?.maintenance?.pending ?? 0,
        rentDue: base.rentDue || [],
      });
    } catch (err) {
      console.error('Dashboard fetch error:', err);
      if (!stats) showToast("Failed to load dashboard stats", "error");
    }
  }, [authHeader, showToast, stats]);

  /** Fetch Activity Logs */
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

  /** Fetch Defaulters */
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

  /** Send Reminder to Single Defaulter */
  const sendReminder = async (tenantId) => {
    if (!tenantId) return;
    try {
      setLoadingNotifyId(tenantId);
      await axios.post(`/defaulters/rent-defaulters/${tenantId}`, {}, { headers: authHeader });
      showToast("Reminder sent successfully!", "success");
    } catch {
      try {
        const res = await axios.post(`/defaulters-notify/${tenantId}`, {}, { headers: authHeader });
        showToast(res?.data?.message || "Reminder sent successfully!", "success");
      } catch {
        showToast("Failed to send reminder", "error");
      }
    } finally {
      setLoadingNotifyId(null);
    }
  };

  /** Send Bulk Reminders */
  const handleBulkRemind = async () => {
    try {
      setBulkSending(true);
      const res = await axios.post("/send-defaulters-sms", {}, { headers: authHeader });
      const cnt = res?.data?.count ?? defaulters?.length ?? 0;
      showToast(`Sent to ${cnt} defaulters`, "success");
    } catch {
      showToast("Failed to send bulk reminders", "error");
    } finally {
      setBulkSending(false);
    }
  };

  /** Export Logs to CSV */
  const exportLogs = () => {
    const csvContent = [
      ["Type", "House", "Tenant", "Status", "Date"],
      ...(logs || []).map((l) => [
        l.type || "",
        typeof l.house === "string" ? l.house : l.house?.title || "",
        typeof l.tenant === "string" ? l.tenant : l.tenant?.fullName || "",
        l.status || "",
        fmtDate(l.date),
      ]),
    ]
      .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "activity_logs.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  /** Initial Data Fetch */
  useEffect(() => {
    let mounted = true;

    (async () => {
      await Promise.allSettled([
        fetchDashboardStats(),
        fetchDefaulters()
      ]);
      if (mounted) setBootLoading(false);
    })();

    return () => {
      mounted = false;
    };
  }, [fetchDashboardStats, fetchDefaulters]);

  /** Fetch Logs on Filter/Page Change */
  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  /** Auto-refresh - OPTIMIZED to reduce API calls */
  useEffect(() => {
    // Only auto-refresh if tab is visible and user is active
    let refreshInterval;
    
    const startRefresh = () => {
      refreshInterval = setInterval(() => {
        // Only refresh the overview tab (not all tabs)
        if (activeTab === "overview" && document.visibilityState === 'visible') {
          fetchDashboardStats();
          // Fetch logs and defaulters less frequently
          if (Date.now() % 2 === 0) { // Every 2nd refresh
            fetchLogs();
            fetchDefaulters();
          }
        }
      }, 60000); // Changed from 30s to 60s (1 minute)
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        clearInterval(refreshInterval);
      } else {
        startRefresh();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    startRefresh();

    return () => {
      clearInterval(refreshInterval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [activeTab, fetchDashboardStats, fetchLogs, fetchDefaulters]);

  /** Derived Data for Charts */
  const chartData = useMemo(() => {
    const monthly = stats?.maintenance?.monthlyData || {};
    return Object.entries(monthly)
      .map(([month, count]) => ({ month, count }))
      .slice(-6);
  }, [stats?.maintenance?.monthlyData]);

  const rentDue = stats?.rentDue || [];
  const totalPages = Math.ceil(total / limit);

  /** Loading State */
  if (bootLoading || !stats) {
    return (
      <div className="p-6">
        <SkeletonHeader />
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mt-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
        <div className="mt-6 space-y-4">
          <SkeletonPanel />
          <SkeletonPanel />
          <SkeletonPanel />
        </div>
      </div>
    );
  }

  /** Render */
  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Landlord Dashboard</h1>
          <p className="text-gray-500 text-sm">Welcome back! Here's your property overview</p>
        </div>
        <button
          onClick={handleBulkRemind}
          disabled={bulkSending || (defaulters?.length ?? 0) === 0}
          className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-md transition"
        >
          {bulkSending ? "Sending…" : "📩 Send Bulk Reminders"}
        </button>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-lg shadow-sm p-2 mb-6">
        <div className="flex gap-2">
          <TabButton label="Overview" icon="📊" active={activeTab === "overview"} onClick={() => setActiveTab("overview")} />
          <TabButton label="Defaulters" icon="💸" active={activeTab === "defaulters"} onClick={() => setActiveTab("defaulters")} />
          <TabButton label="Activity" icon="📋" active={activeTab === "activity"} onClick={() => setActiveTab("activity")} />
          <TabButton label="Analytics" icon="📈" active={activeTab === "analytics"} onClick={() => setActiveTab("analytics")} />
        </div>
      </div>

      {/* Overview Tab */}
      {activeTab === "overview" && (
        <>
          {/* Top Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
            <SummaryCard title="Houses" value={stats.houses?.total ?? 0} icon="🏠" color="blue" />
            <SummaryCard title="Tenants" value={stats.tenants ?? 0} icon="👥" color="green" />
            <SummaryCard title="Active Leases" value={stats.activeAgreements ?? 0} icon="📄" color="purple" />
            <SummaryCard title="Pending Maint." value={stats.pendingMaintenance ?? stats?.maintenance?.pending ?? 0} icon="🔧" color="orange" />
            <SummaryCard title="This Month's Rent" value={fmtKES(stats.monthlyEarnings)} icon="💰" color="green" />
            <SummaryCard title="Defaulters" value={stats.defaulters ?? defaulters?.length ?? 0} icon="⚠️" color="red" />
          </div>

          {/* Occupancy Breakdown */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <MiniCard title="Occupied Houses" value={stats.houses?.occupied ?? 0} color="green" />
            <MiniCard title="Vacant Houses" value={stats.houses?.vacant ?? 0} color="yellow" />
          </div>

          {/* Maintenance Summary + Chart */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            <div className="bg-white rounded-lg shadow-sm p-6 lg:col-span-1">
              <h3 className="text-lg font-semibold mb-4 text-gray-700">Maintenance Summary</h3>
              <div className="grid grid-cols-2 gap-3">
                <MiniStatCard label="Pending" value={stats.maintenance?.pending ?? 0} color="yellow" />
                <MiniStatCard label="In Progress" value={stats.maintenance?.inProgress ?? 0} color="blue" />
                <MiniStatCard label="Completed" value={stats.maintenance?.completed ?? 0} color="green" />
                <MiniStatCard label="This Month" value={stats.maintenance?.thisMonthCount ?? 0} color="purple" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6 lg:col-span-2">
              <h3 className="text-lg font-semibold mb-4 text-gray-700">Maintenance (Last 6 Months)</h3>
              {chartData.length === 0 ? (
                <p className="text-sm text-gray-500">No data available.</p>
              ) : (
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Bar dataKey="count" fill="#3B82F6" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Upcoming Rent Due */}
          <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-700">Upcoming Rent Due (Next 7 Days)</h3>
            </div>
            {rentDue.length === 0 ? (
              <p className="text-sm text-gray-500">No upcoming rent due.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                  <thead className="bg-gray-50">
                    <tr>
                      <Th>Tenant</Th>
                      <Th>House</Th>
                      <Th>Due Date</Th>
                      <Th>Action</Th>
                    </tr>
                  </thead>
                  <tbody>
                    {rentDue.map((r, idx) => (
                      <tr key={idx} className="border-t hover:bg-gray-50 transition">
                        <Td>{r.tenantId?.fullName || r?.tenant?.fullName || "—"}</Td>
                        <Td>{r.houseId?.title || r?.house?.title || "—"}</Td>
                        <Td>{fmtDate(r.dueDate)}</Td>
                        <Td>
                          <button
                            onClick={() => sendReminder(r.tenantId?._id || r?.tenant?._id)}
                            disabled={loadingNotifyId === (r.tenantId?._id || r?.tenant?._id)}
                            className="px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
                          >
                            {loadingNotifyId === (r.tenantId?._id || r?.tenant?._id) ? "Sending…" : "Notify"}
                          </button>
                        </Td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}

      {/* Defaulters Tab */}
      {activeTab === "defaulters" && (
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-700">Rent Defaulters Management</h3>
            <button
              onClick={handleBulkRemind}
              disabled={bulkSending || (defaulters?.length ?? 0) === 0}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {bulkSending ? "Sending…" : "📩 Send Bulk Reminders"}
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm text-left border">
              <thead className="bg-gray-50">
                <tr>
                  <Th>Tenant</Th>
                  <Th>House</Th>
                  <Th>Monthly Rent</Th>
                  <Th>Lease Period</Th>
                  <Th>Actions</Th>
                </tr>
              </thead>
              <tbody>
                {(defaulters || []).map((d, i) => {
                  const tenantName = d?.tenant?.fullName || d?.tenantName || "—";
                  const houseTitle = d?.house?.title || d?.houseTitle || "—";
                  const monthly = d?.monthlyRent ?? d?.rent ?? 0;
                  const start = d?.leaseStart || d?.agreement?.startDate;
                  const end = d?.leaseEnd || d?.agreement?.endDate;
                  const tId = d?.tenant?._id || d?.tenantId || d?._id;

                  return (
                    <tr key={i} className="border-t hover:bg-gray-50">
                      <Td>{tenantName}</Td>
                      <Td>{houseTitle}</Td>
                      <Td>{fmtKES(monthly)}</Td>
                      <Td>
                        {fmtDate(start)} → {fmtDate(end)}
                      </Td>
                      <Td>
                        <button
                          onClick={() => sendReminder(tId)}
                          disabled={loadingNotifyId === tId}
                          className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded disabled:opacity-50"
                        >
                          {loadingNotifyId === tId ? "Sending…" : "Notify"}
                        </button>
                      </Td>
                    </tr>
                  );
                })}
                {(defaulters?.length ?? 0) === 0 && (
                  <tr>
                    <td colSpan={5} className="text-center px-4 py-6 text-gray-500">
                      🎉 No defaulters found this month.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Activity Tab */}
      {activeTab === "activity" && (
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-700">Recent Activity</h3>
            <button
              onClick={exportLogs}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              Export CSV
            </button>
          </div>

          <div className="mb-4 flex gap-2">
            <FilterButton label="All" active={logType === ""} onClick={() => { setLogType(""); setPage(1); }} />
            <FilterButton label="Visits" active={logType === "visit"} onClick={() => { setLogType("visit"); setPage(1); }} />
            <FilterButton label="Relocations" active={logType === "relocation"} onClick={() => { setLogType("relocation"); setPage(1); }} />
            <FilterButton label="Maintenance" active={logType === "maintenance"} onClick={() => { setLogType("maintenance"); setPage(1); }} />
          </div>

          {(logs?.length ?? 0) === 0 ? (
            <p className="text-sm text-gray-500">No activity found.</p>
          ) : (
            <ul className="space-y-2">
              {logs.map((log, idx) => (
                <li
                  key={idx}
                  className="border-b py-3 flex justify-between items-center hover:bg-gray-50 transition"
                >
                  <div className="flex items-center gap-2">
                    <span>
                      {(/visit/i).test(log.type) ? "🏠" : (/relocation/i).test(log.type) ? "🚚" : "🔧"}
                    </span>
                    <span className="font-semibold">{log.type || "—"}</span>
                    <span className="text-gray-600">
                      – {typeof log.house === "string" ? log.house : log.house?.title || "—"}
                      {" ("}
                      {typeof log.tenant === "string" ? log.tenant : log.tenant?.fullName || "—"}
                      {")"}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500">
                    {log.status || "—"} | {fmtDate(log.date)}
                  </div>
                </li>
              ))}
            </ul>
          )}

          <div className="flex justify-between items-center mt-4">
            <button
              onClick={() => setPage((p) => Math.max(p - 1, 1))}
              disabled={page === 1}
              className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50 hover:bg-gray-300"
            >
              Prev
            </button>
            <span className="text-sm">Page {page} of {totalPages}</span>
            <button
              onClick={() => {
                if (page * limit < total) setPage((p) => p + 1);
              }}
              disabled={page * limit >= total}
              className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50 hover:bg-gray-300"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Analytics Tab */}
      {activeTab === "analytics" && (
        <div className="space-y-6">
          {/* Pie Chart for Rent Due Distribution */}
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="text-lg font-semibold mb-4 text-gray-700">Rent Due Distribution</h3>
            {rentDue.length === 0 ? (
              <p className="text-sm text-gray-500">No rent due data available.</p>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={rentDue.map(r => ({
                      name: r.tenantId?.fullName || "Unknown",
                      value: r.amount || 0
                    }))}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label
                  >
                    {rentDue.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => fmtKES(value)} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Line Chart for Monthly Earnings Trend */}
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="text-lg font-semibold mb-4 text-gray-700">Maintenance Trends</h3>
            {chartData.length === 0 ? (
              <p className="text-sm text-gray-500">No data available.</p>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="count" stroke="#8B5CF6" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/** 
 * HOW TO USE THIS UNIFIED DASHBOARD:
 * 
 * 1. Replace the import in your App.js:
 *    import UnifiedLandlordDashboard from './components/UnifiedLandlordDashboard';
 * 
 * 2. Update your route:
 *    <Route path="/landlord/dashboard" element={<UnifiedLandlordDashboard />} />
 * 
 * 3. Delete or archive the old dashboard files:
 *    - LandlordDashboard.jsx
 *    - LandlordDashboardPage.jsx
 *    - landlordDash.jsx
 */

/** Reusable Components */
function TabButton({ label, icon, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-md font-medium transition ${
        active
          ? "bg-blue-600 text-white shadow-md"
          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
      }`}
    >
      {icon} {label}
    </button>
  );
}

function SummaryCard({ title, value, icon, color }) {
  const colorMap = {
    blue: "bg-blue-50 border-blue-500 text-blue-700",
    green: "bg-green-50 border-green-500 text-green-700",
    purple: "bg-purple-50 border-purple-500 text-purple-700",
    orange: "bg-orange-50 border-orange-500 text-orange-700",
    red: "bg-red-50 border-red-500 text-red-700",
    yellow: "bg-yellow-50 border-yellow-500 text-yellow-700"
  };

  return (
    <div className={`${colorMap[color]} p-4 rounded-lg shadow-sm border-l-4 text-center hover:shadow-md transition`}>
      <div className="text-3xl mb-2">{icon}</div>
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-sm opacity-80">{title}</p>
    </div>
  );
}

function MiniCard({ title, value, color }) {
  const colorMap = {
    green: "bg-green-50 border-green-500",
    yellow: "bg-yellow-50 border-yellow-500"
  };

  return (
    <div className={`${colorMap[color]} p-4 rounded-lg shadow-sm border-l-4 text-center`}>
      <p className="text-xl font-bold">{value}</p>
      <p className="text-sm text-gray-600">{title}</p>
    </div>
  );
}

function MiniStatCard({ label, value, color }) {
  const colorMap = {
    yellow: "bg-yellow-100 text-yellow-800",
    blue: "bg-blue-100 text-blue-800",
    green: "bg-green-100 text-green-800",
    purple: "bg-purple-100 text-purple-800"
  };

  return (
    <div className={`${colorMap[color]} rounded-lg p-3 text-center`}>
      <div className="text-xs text-gray-600">{label}</div>
      <div className="text-2xl font-semibold">{value}</div>
    </div>
  );
}

function FilterButton({ label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1 rounded ${
        active ? "bg-blue-600 text-white" : "bg-gray-200 hover:bg-gray-300"
      }`}
    >
      {label}
    </button>
  );
}

function Th({ children }) {
  return <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">{children}</th>;
}

function Td({ children }) {
  return <td className="px-4 py-3 align-middle">{children}</td>;
}

/** Skeleton Loaders */
function SkeletonHeader() {
  return <div className="h-8 w-64 bg-gray-200 rounded animate-pulse" />;
}

function SkeletonCard() {
  return (
    <div className="bg-white p-4 rounded-lg shadow-sm">
      <div className="h-6 w-16 bg-gray-200 rounded mb-2 animate-pulse" />
      <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
    </div>
  );
}

function SkeletonPanel() {
  return <div className="bg-white rounded-lg shadow-sm p-4 h-40 animate-pulse" />;
}
