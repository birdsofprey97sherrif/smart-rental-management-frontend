// src/pages/LandlordDashboard.jsx
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
} from "recharts";

/** ---------------------------
 * Utilities
 * --------------------------- */
const toDate = (v) => (v ? new Date(v) : null);
const fmtDate = (v) => (v ? toDate(v).toLocaleDateString() : "—");
const fmtKES = (n) =>
  typeof n === "number"
    ? `KES ${n.toLocaleString("en-KE", { maximumFractionDigits: 0 })}`
    : n || "KES 0";

/** ---------------------------
 * Unified Dashboard Component
 * --------------------------- */
export default function LandlordDashboard() {
  const { token } = useAuth();
  const { showToast } = useToast();

  // Top-level loading/error
  const [bootLoading, setBootLoading] = useState(true);

  // Summary + metrics (merged shape)
  const [stats, setStats] = useState(null);

  // Activity logs
  const [logs, setLogs] = useState([]);
  const [logType, setLogType] = useState(""); // "", "visit", "relocation", "maintenance"
  const [page, setPage] = useState(1);
  const [limit] = useState(5);
  const [total, setTotal] = useState(0);

  // Defaulters (detailed list)
  const [defaulters, setDefaulters] = useState([]);
  const [bulkSending, setBulkSending] = useState(false);
  const [loadingNotifyId, setLoadingNotifyId] = useState(null);

  // Rent due list (next 7 days) comes from landlord/dashboard
  const rentDue = stats?.rentDue || [];

  /** ---------------------------
   * Fetchers (with endpoint fallbacks)
   * --------------------------- */

  const authHeader = useMemo(
    () => ({ Authorization: `Bearer ${token}` }),
    [token]
  );

  // Fetch core landlord dashboard stats
  const fetchDashboardStats = useCallback(async () => {
    try {
      const res = await axios.get("/landlord/dashboard", {
        headers: authHeader,
      });

      // Expecting:
      // {
      //   houses: { total, occupied, vacant },
      //   tenants, caretakers, visits, relocations, defaulters,
      //   maintenance: { pending, inProgress, completed, thisMonthCount, monthlyData: { Jan: 4, ... } },
      //   rentDue: [{ tenantId, houseId, dueDate }, ...],
      //   (optionally) monthlyEarnings, activeAgreements
      // }

      const base = res.data || {};
      setStats((prev) => ({
        ...prev,
        ...base,
        // Defaults to keep UI robust
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
      }));
    } catch {
      // If landlord/dashboard not available, we still provide a minimal shell
      setStats((prev) => ({
        ...prev,
        houses: prev?.houses || { total: 0, occupied: 0, vacant: 0 },
        maintenance: prev?.maintenance || {
          pending: 0,
          inProgress: 0,
          completed: 0,
          thisMonthCount: 0,
          monthlyData: {},
        },
        tenants: prev?.tenants ?? 0,
        caretakers: prev?.caretakers ?? 0,
        visits: prev?.visits ?? 0,
        relocations: prev?.relocations ?? 0,
        defaulters: prev?.defaulters ?? 0,
        monthlyEarnings: prev?.monthlyEarnings ?? 0,
        activeAgreements: prev?.activeAgreements ?? 0,
        pendingMaintenance: prev?.pendingMaintenance ?? 0,
        rentDue: prev?.rentDue || [],
      }));
      // Don’t spam toast on every interval — only at boot if we have nothing
      if (!stats) showToast("Failed to load dashboard stats", "error");
    }
  }, [authHeader, showToast, stats]);

  // Fetch activity logs with filters + pagination
  const fetchLogs = useCallback(async () => {
    try {
      const skip = (page - 1) * limit;
      const res = await axios.get(`/landlord/dashboard/activity`, {
        headers: authHeader,
        params: { type: logType, skip, limit },
      });
      setLogs(res.data.logs || []);
      setTotal(res.data.total || 0);
    } catch {
      setLogs([]);
      setTotal(0);
      if (page === 1) showToast("Failed to load activity log", "error");
    }
  }, [authHeader, logType, page, limit, showToast]);

  // Fetch defaulters list (supports both of your endpoints)
  const fetchDefaulters = useCallback(async () => {
    try {
      // Primary: your second page endpoint
      const res = await axios.get("/get-defaulters-list", { headers: authHeader });
      const list = res.data?.defaulters || [];
      setDefaulters(list);

      // Update summary counters in stats
      setStats((prev) => ({
        ...(prev || {}),
        defaulters: res.data?.count ?? list.length ?? 0,
      }));
    } catch {
      try {
        // Fallback: try landlord dashboard if it includes counts only
        // (Keeps UI from breaking; detailed rows will be empty if unavailable)
        const resDash = await axios.get("/landlord/dashboard", { headers: authHeader });
        const countFromDash = resDash.data?.defaulters ?? 0;
        setDefaulters([]);
        setStats((prev) => ({
          ...(prev || {}),
          defaulters: countFromDash,
        }));
      } catch {
        // silent fallback
      }
    }
  }, [authHeader]);

  // Fetch houses count for summary (fallback if not present in /landlord/dashboard)
  const fetchHouseCount = useCallback(async () => {
    if (stats?.houses?.total) return; // already present
    try {
      const res = await axios.get("/houses/my", { headers: authHeader });
      const count = Array.isArray(res.data) ? res.data.length : (res.data?.length ?? 0);
      setStats((prev) => ({
        ...(prev || {}),
        houses: { ...(prev?.houses || {}), total: count, occupied: prev?.houses?.occupied ?? 0, vacant: prev?.houses?.vacant ?? 0 },
      }));
    } catch {
      // non-fatal
    }
  }, [authHeader, stats?.houses?.total]);

  /** ---------------------------
   * Actions
   * --------------------------- */

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

  /** ---------------------------
   * Effects
   * --------------------------- */

  // Initial fetch
  useEffect(() => {
    let mounted = true;

    (async () => {
      await Promise.allSettled([fetchDashboardStats(), fetchDefaulters()]);
      await fetchHouseCount();
      if (mounted) setBootLoading(false);
    })();

    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Logs fetch on filters/pagination change
  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  // Auto-refresh every 30s (stats + logs + defaulters)
  useEffect(() => {
    const id = setInterval(() => {
      fetchDashboardStats();
      fetchLogs();
      fetchDefaulters();
    }, 30000);
    return () => clearInterval(id);
  }, [fetchDashboardStats, fetchLogs, fetchDefaulters]);

  /** ---------------------------
   * Derived
   * --------------------------- */

  const chartData = useMemo(() => {
    const monthly = stats?.maintenance?.monthlyData || {};
    return Object.entries(monthly)
      .map(([month, count]) => ({ month, count }))
      .slice(-6);
  }, [stats?.maintenance?.monthlyData]);

  /** ---------------------------
   * Render
   * --------------------------- */

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

  return (
    <div className="p-6">
      {/* Title + Bulk Remind */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Landlord Dashboard</h1>
        <button
          onClick={handleBulkRemind}
          disabled={bulkSending || (defaulters?.length ?? 0) === 0}
          className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {bulkSending ? "Sending…" : "📩 Send Bulk Reminders"}
        </button>
      </div>

      {/* Top Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
        <SummaryCard title="Houses" value={stats.houses?.total ?? 0} />
        <SummaryCard title="Tenants" value={stats.tenants ?? 0} />
        <SummaryCard title="Active Leases" value={stats.activeAgreements ?? 0} />
        <SummaryCard title="Pending Maint." value={stats.pendingMaintenance ?? stats?.maintenance?.pending ?? 0} />
        <SummaryCard title="This Months Rent" value={fmtKES(stats.monthlyEarnings)} />
        <SummaryCard title="Defaulters" value={stats.defaulters ?? defaulters?.length ?? 0} />
      </div>

      {/* Occupancy Breakdown */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <SummaryCard title="Occupied Houses" value={stats.houses?.occupied ?? 0} />
        <SummaryCard title="Vacant Houses" value={stats.houses?.vacant ?? 0} />
      </div>

      {/* Maintenance Summary + Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded shadow p-4 lg:col-span-1">
          <h3 className="text-lg font-semibold mb-3">Maintenance Summary</h3>
          <div className="grid grid-cols-2 gap-3">
            <MiniCard label="Pending" value={stats.maintenance?.pending ?? 0} />
            <MiniCard label="In Progress" value={stats.maintenance?.inProgress ?? 0} />
            <MiniCard label="Completed" value={stats.maintenance?.completed ?? 0} />
            <MiniCard label="This Month" value={stats.maintenance?.thisMonthCount ?? 0} />
          </div>
        </div>

        <div className="bg-white rounded shadow p-4 lg:col-span-2">
          <h3 className="text-lg font-semibold mb-3">Maintenance (Last 6 Months)</h3>
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
      <div className="bg-white p-4 rounded shadow mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Upcoming Rent Due (Next 7 Days)</h3>
        </div>
        {rentDue.length === 0 ? (
          <p className="text-sm text-gray-500">No upcoming rent due.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm border">
              <thead className="bg-gray-100">
                <tr>
                  <Th>Tenant</Th>
                  <Th>House</Th>
                  <Th>Due Date</Th>
                  <Th>Action</Th>
                </tr>
              </thead>
              <tbody>
                {rentDue.map((r, idx) => (
                  <tr key={idx} className="border-b hover:bg-gray-50 transition">
                    <Td>{r.tenantId?.fullName || r?.tenant?.fullName || "—"}</Td>
                    <Td>{r.houseId?.title || r?.house?.title || "—"}</Td>
                    <Td>{fmtDate(r.dueDate)}</Td>
                    <Td>
                      <button
                        onClick={() => sendReminder(r.tenantId?._id || r?.tenant?._id)}
                        disabled={loadingNotifyId === (r.tenantId?._id || r?.tenant?._id)}
                        className="px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
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

      {/* Defaulters Management (rich table) */}
      <div className="bg-white p-4 rounded shadow mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Defaulters</h3>
          <button
            onClick={handleBulkRemind}
            disabled={bulkSending || (defaulters?.length ?? 0) === 0}
            className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {bulkSending ? "Sending…" : "📩 Send Bulk Reminders"}
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm text-left border">
            <thead className="bg-gray-100">
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

      {/* Recent Activity with Filters + Export + Pagination */}
      <div className="bg-white p-4 rounded shadow">
        <div className="flex justify-between items-center mb-4 sticky top-0 bg-white z-10 py-2">
          <h3 className="text-lg font-semibold">Recent Activity</h3>
          <button
            onClick={exportLogs}
            className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Export CSV
          </button>
        </div>

        <div className="mb-4 space-x-2 sticky top-10 bg-white z-10 py-2">
          <FilterButton label="All" active={logType === ""} onClick={() => { setLogType(""); setPage(1); }} />
          <FilterButton label="Visits" active={logType === "visit"} onClick={() => { setLogType("visit"); setPage(1); }} />
          <FilterButton label="Relocations" active={logType === "relocation"} onClick={() => { setLogType("relocation"); setPage(1); }} />
          <FilterButton label="Maintenance" active={logType === "maintenance"} onClick={() => { setLogType("maintenance"); setPage(1); }} />
        </div>

        {(logs?.length ?? 0) === 0 ? (
          <p className="text-sm text-gray-500">No activity found.</p>
        ) : (
          <ul>
            {logs.map((log, idx) => (
              <li
                key={idx}
                className="border-b py-2 flex justify-between items-center hover:bg-gray-50 transition"
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
            className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
          >
            Prev
          </button>
          <span className="text-sm">Page {page}</span>
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

/** ---------------------------
 * Small Components
 * --------------------------- */

function SummaryCard({ title, value }) {
  return (
    <div className="bg-white p-4 rounded shadow text-center hover:shadow-lg transition">
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-sm text-gray-600">{title}</p>
    </div>
  );
}

function MiniCard({ label, value }) {
  return (
    <div className="rounded border p-3 text-center">
      <div className="text-xs text-gray-500">{label}</div>
      <div className="text-xl font-semibold">{value}</div>
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
  return <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600">{children}</th>;
}
function Td({ children }) {
  return <td className="px-3 py-2 align-middle">{children}</td>;
}

/** ---------------------------
 * Skeletons (pleasant loading)
 * --------------------------- */
function SkeletonHeader() {
  return <div className="h-7 w-56 bg-gray-200 rounded animate-pulse" />;
}
function SkeletonCard() {
  return <div className="bg-white p-4 rounded shadow">
    <div className="h-6 w-16 bg-gray-200 rounded mb-2 animate-pulse" />
    <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
  </div>;
}
function SkeletonPanel() {
  return <div className="bg-white rounded shadow p-4 h-40 animate-pulse" />;
}
