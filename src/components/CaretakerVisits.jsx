import React, { useEffect, useState } from "react";
import axios from "../utils/axiosInstance";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

export default function CaretakerVisits() {
  const { token } = useAuth();
  const { showToast } = useToast();

  const [houses, setHouses] = useState([]);
  const [visits, setVisits] = useState([]);
  const [loading, setLoading] = useState(false);

  // filters / pagination
  const [statusFilter, setStatusFilter] = useState(""); // "", "pending", "approved", "declined"
  const [houseFilter, setHouseFilter] = useState("");
  const [page, setPage] = useState(1);
  const [limit] = useState(8);
  const [total, setTotal] = useState(0);

  // client-side fallback if server doesn't support skip/limit
  const [serverPagingSupported, setServerPagingSupported] = useState(true);

  // fetch houses the caretaker manages
  const fetchHouses = React.useCallback( async () => {
    try {
      const res = await axios.get("/caretaker/houses-managed", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setHouses(res.data.houses || []);
      if ((res.data.houses || []).length > 0 && !houseFilter) {
        setHouseFilter(""); // default "All"
      }
    } catch (err) {
      showToast("Failed to load houses", "error");
    }
  }, [token, showToast, houseFilter]);

  // fetch visits - try server-side paging first, fall back to client-side
  const fetchVisits = async () => {
    setLoading(true);
    try {
      const skip = (page - 1) * limit;
      // try server-side paging with filters
      const params = { skip, limit, status: statusFilter, houseId: houseFilter || undefined };
      const res = await axios.get("/visits/my-requests", {
        headers: { Authorization: `Bearer ${token}` },
        params,
      });

      // If server returns total or respects limit, we'll use server paging
      if (res.data && (res.data.total !== undefined || Array.isArray(res.data.visits))) {
        setServerPagingSupported(true);
        const serverVisits = res.data.visits || res.data; // support both shapes
        setVisits(serverVisits);
        setTotal(res.data.total ?? serverVisits.length);
      } else {
        // unexpected shape -> fallback to client side
        throw new Error("No paging info returned");
      }
    } catch (err) {
      // fallback: fetch all and paginate client-side
      try {
        const resAll = await axios.get("/visits/my-requests", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setServerPagingSupported(false);
        let all = resAll.data.visits || resAll.data || [];
        // apply filters client-side
        if (statusFilter) all = all.filter(v => v.status === statusFilter);
        if (houseFilter) all = all.filter(v => v.houseId && v.houseId._id === houseFilter);
        setTotal(all.length);
        const start = (page - 1) * limit;
        setVisits(all.slice(start, start + limit));
      } catch (e) {
        showToast("Failed to load visit requests", "error");
      }
    } finally {
      setLoading(false);
    }
  };

  // respond to visit (approve/decline)
  const respondToVisit = async (id, action) => {
    if (!["approve", "decline"].includes(action)) return;
    try {
      await axios.patch(
        `/visits/${id}/respond`,
        { action },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      showToast(`Visit ${action}d`, "success");
      // reload (if server paging, keep page; else apply fallback)
      fetchVisits();
    } catch (err) {
      showToast(`Failed to ${action} visit`, "error");
    }
  };

  // quick export
  const exportCSV = () => {
    const rows = [
      ["Tenant", "Phone", "Email", "House", "Location", "Status", "RequestedAt"],
      ...visits.map(v => [
        v.tenantId?.fullName ?? "",
        v.tenantId?.phone ?? "",
        v.tenantId?.email ?? "",
        v.houseId?.title ?? "",
        typeof v.houseId?.location === "string" ? v.houseId.location : v.houseId?.location?.address ?? "",
        v.status,
        new Date(
          (v.requestedAt || v.createdAt || v._id?.getTimestamp?.()) ?? Date.now()
        ).toLocaleString()

      ])
    ];
    const csv = rows.map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "visit_requests.csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // auto-refresh every 30s
  useEffect(() => {
    fetchHouses();
  }, [fetchHouses]);

  useEffect(() => {
    fetchVisits();
    const interval = setInterval(fetchVisits, 30000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, houseFilter, page]);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold">Visit Requests</h2>
        <div className="flex items-center gap-2">
          <button onClick={exportCSV} className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600">
            Export CSV
          </button>
        </div>
      </div>

      {/* Sticky filter bar */}
      <div className="bg-white p-3 rounded shadow sticky top-16 z-20 mb-4">
        <div className="flex gap-3 flex-wrap items-end">
          <div>
            <label className="block text-sm text-gray-600">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => { setPage(1); setStatusFilter(e.target.value); }}
              className="border px-2 py-1 rounded"
            >
              <option value="">All</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="declined">Declined</option>
            </select>
          </div>

          <div>
            <label className="block text-sm text-gray-600">House</label>
            <select
              value={houseFilter}
              onChange={(e) => { setPage(1); setHouseFilter(e.target.value); }}
              className="border px-2 py-1 rounded min-w-[220px]"
            >
              <option value="">All Houses</option>
              {houses.map(h => (
                <option key={h._id} value={h._id}>{h.title} {h.location ? `— ${typeof h.location === "string" ? h.location : h.location.address}` : ""}</option>
              ))}
            </select>
          </div>

          <div className="ml-auto flex gap-2">
            <div className="text-sm text-gray-500 self-end">Page {page}</div>
            <button
              onClick={() => setPage(p => Math.max(p - 1, 1))}
              disabled={page === 1}
              className="px-2 py-1 bg-gray-200 rounded disabled:opacity-50"
            >
              Prev
            </button>
            <button
              onClick={() => {
                if (serverPagingSupported) {
                  if (page * limit < total) setPage(p => p + 1);
                } else {
                  // client-side fallback: check if we can increment
                  if (page * limit < total) setPage(p => p + 1);
                }
              }}
              disabled={page * limit >= total}
              className="px-2 py-1 bg-gray-200 rounded disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 text-sm text-gray-600">
            <tr>
              <th className="p-3 text-left">Tenant</th>
              <th className="p-3 text-left">Contact</th>
              <th className="p-3 text-left">House</th>
              <th className="p-3 text-left">Requested At</th>
              <th className="p-3 text-left">Status</th>
              <th className="p-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="6" className="p-4 text-center">Loading...</td></tr>
            ) : visits.length === 0 ? (
              <tr><td colSpan="6" className="p-4 text-center text-gray-500">No visit requests found.</td></tr>
            ) : (
              visits.map(v => (
                <tr key={v._id} className="border-t hover:bg-gray-50 transition">
                  <td className="p-3">{v.tenantId?.fullName}</td>
                  <td className="p-3">
                    <div>{v.tenantId?.phone}</div>
                    <div className="text-xs text-gray-500">{v.tenantId?.email}</div>
                  </td>
                  <td className="p-3">{v.houseId?.title}</td>
                  <td className="p-3">
                    {new Date(
                      v.requestedAt || v.createdAt || (v._id?.getTimestamp?.() ?? Date.now())
                    ).toLocaleString()}
                  </td>
                  <td className="p-3 capitalize">{v.status}</td>
                  <td className="p-3">
                    {v.status === "pending" ? (
                      <div className="flex gap-2">
                        <button
                          onClick={() => respondToVisit(v._id, "approve")}
                          className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => respondToVisit(v._1d || v._id, "decline")}
                          className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                        >
                          Decline
                        </button>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-600">—</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Footer pagination summary */}
      <div className="flex items-center justify-between mt-3 text-sm text-gray-600">
        <div>{total} results</div>
        <div>Showing {(page - 1) * limit + 1} - {Math.min(page * limit, total)}</div>
      </div>
    </div>
  );
}
