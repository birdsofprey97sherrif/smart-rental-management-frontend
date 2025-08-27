import React, { useEffect, useState } from "react";
import axios from "../utils/axiosInstance";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

export default function CaretakerTenantRegistration() {
  const { token } = useAuth();
  const { showToast } = useToast();

  // registration form
  const [form, setForm] = useState({ fullName: "", email: "", phone: "" });
  const [loading, setLoading] = useState(false);

  // agreements list + create agreement modal state
  const [agreements, setAgreements] = useState([]);
  const [page, setPage] = useState(1);
  const [limit] = useState(8);
  const [total, setTotal] = useState(0);
  const [creatingAgreementFor, setCreatingAgreementFor] = useState(null);
  const [agreementData, setAgreementData] = useState({
    tenantId: "",
    houseId: "",
    leaseStart: "",
    leaseEnd: "",
    monthlyRent: "",
  });

  // houses managed (to pick house when creating agreement)
  const [houses, setHouses] = useState([]);

  const fetchHouses = React.useCallback( async () => {
    try {
      const res = await axios.get("/caretaker/houses-managed", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setHouses(res.data.houses || []);
    } catch {
      showToast("Failed to load houses", "error");
    }
  }, [token, showToast]);

  const fetchAgreements = React.useCallback( async () => {
    try {
      const skip = (page - 1) * limit;
      const res = await axios.get("/rental-agreements/caretaker", {
        headers: { Authorization: `Bearer ${token}` },
        params: { skip, limit },
      });
      // expected shape: { agreements, total } or array fallback
      setAgreements(res.data.agreements || res.data);
      setTotal(res.data.total ?? (res.data.agreements ? res.data.total : (res.data.length || 0)));
    } catch {
      showToast("Failed to load agreements", "error");
    }
  }, [page, limit, token, showToast]);

  useEffect(() => {
    fetchHouses();
    fetchAgreements();
    const interval = setInterval(fetchAgreements, 30000); // auto refresh every 30s
    return () => clearInterval(interval);
  }, [fetchHouses, fetchAgreements]);

  // register tenant
  const registerTenant = async () => {
    if (!form.fullName || !form.email) {
      showToast("Name and email are required", "error");
      return;
    }
    try {
      setLoading(true);
      await axios.post(
        "/users/tenants/register",
        { ...form, role: "tenant" },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      showToast("Tenant registered", "success");
      setForm({ fullName: "", email: "", phone: "" });
      // optionally refresh agreements/tenants somewhere else
    } catch {
      showToast("Failed to register tenant", "error");
    } finally {
      setLoading(false);
    }
  };

  // open create agreement modal prefilled for a tenant

  const createAgreement = async () => {
    const { tenantId, houseId, leaseStart, leaseEnd, monthlyRent } = agreementData;
    if (!tenantId || !houseId || !leaseStart || !leaseEnd || !monthlyRent) {
      showToast("All fields are required", "error");
      return;
    }
    try {
      await axios.post(
        "/rental-agreements/create",
        { tenantId, houseId, leaseStart, leaseEnd, monthlyRent },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      showToast("Agreement created", "success");
      setCreatingAgreementFor(null);
      fetchAgreements();
    } catch {
      showToast("Failed to create agreement", "error");
    }
  };

  // sign agreement
  const signAgreement = async (id) => {
    try {
      await axios.patch(`/rental-agreements/${id}/sign`, {}, { headers: { Authorization: `Bearer ${token}` } });
      showToast("Agreement signed", "success");
      fetchAgreements();
    } catch {
      showToast("Failed to sign agreement", "error");
    }
  };

  const exportAgreementsCSV = () => {
    const rows = [
      ["Tenant", "House", "Lease Start", "Lease End", "Rent", "Signed"],
      ...agreements.map(a => [
        a.tenantId?.fullName ?? "",
        a.houseId?.title ?? "",
        a.leaseStart ? new Date(a.leaseStart).toLocaleDateString() : "",
        a.leaseEnd ? new Date(a.leaseEnd).toLocaleDateString() : "",
        a.monthlyRent ?? "",
        a.isSigned ? "Yes" : "No"
      ])
    ];
    const csv = rows.map(r => r.map(c => `"${String(c).replace(/"/g,'""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "caretaker_agreements.csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Tenant Registration & Agreements</h2>

      {/* Registration Form */}
      <div className="bg-white p-4 rounded shadow mb-6">
        <h3 className="font-semibold mb-2">Register Tenant</h3>
        <div className="flex gap-2 flex-wrap">
          <input
            value={form.fullName}
            onChange={(e) => setForm({ ...form, fullName: e.target.value })}
            placeholder="Full name"
            className="border p-2 rounded flex-1 min-w-[180px]"
          />
          <input
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            placeholder="Email"
            className="border p-2 rounded min-w-[200px]"
          />
          <input
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            placeholder="Phone"
            className="border p-2 rounded min-w-[140px]"
          />
          <button onClick={registerTenant} disabled={loading} className="px-4 py-2 bg-blue-600 text-white rounded">
            {loading ? "Registering..." : "Register Tenant"}
          </button>
        </div>
      </div>

      {/* Agreements list + export */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold">Agreements (Your Houses)</h3>
        <div>
          <button onClick={exportAgreementsCSV} className="px-3 py-1 bg-green-500 text-white rounded">Export CSV</button>
        </div>
      </div>

      <div className="bg-white rounded shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 text-sm text-gray-600">
            <tr>
              <th className="p-3 text-left">Tenant</th>
              <th className="p-3 text-left">House</th>
              <th className="p-3 text-left">Lease</th>
              <th className="p-3 text-left">Rent</th>
              <th className="p-3 text-left">Signed</th>
              <th className="p-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {agreements.length === 0 ? (
              <tr><td className="p-4 text-center text-gray-500" colSpan="6">No agreements yet.</td></tr>
            ) : agreements.map(a => (
              <tr key={a._id} className="border-t hover:bg-gray-50 transition">
                <td className="p-3">{a.tenantId?.fullName}</td>
                <td className="p-3">{a.houseId?.title}</td>
                <td className="p-3">
                  {a.leaseStart ? new Date(a.leaseStart).toLocaleDateString() : "-"} → {a.leaseEnd ? new Date(a.leaseEnd).toLocaleDateString() : "-"}
                </td>
                <td className="p-3">KES {a.monthlyRent}</td>
                <td className="p-3">{a.isSigned ? "✅" : "❌"}</td>
                <td className="p-3 flex gap-2">
                  {!a.isSigned && <button onClick={() => signAgreement(a._id)} className="px-3 py-1 bg-blue-600 text-white rounded">Sign</button>}
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

      {/* Create Agreement Modal (simple inline area) */}
      {creatingAgreementFor && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow w-full max-w-md">
            <h3 className="text-lg font-semibold mb-3">Create Rental Agreement</h3>

            <div className="flex flex-col gap-2">
              <select value={agreementData.houseId} onChange={(e) => setAgreementData({ ...agreementData, houseId: e.target.value })} className="border p-2 rounded">
                {houses.map(h => <option key={h._id} value={h._id}>{h.title}</option>)}
              </select>

              <input type="date" value={agreementData.leaseStart} onChange={(e)=>setAgreementData({...agreementData, leaseStart:e.target.value})} className="border p-2 rounded"/>
              <input type="date" value={agreementData.leaseEnd} onChange={(e)=>setAgreementData({...agreementData, leaseEnd:e.target.value})} className="border p-2 rounded"/>
              <input value={agreementData.monthlyRent} onChange={(e)=>setAgreementData({...agreementData, monthlyRent:e.target.value})} placeholder="Monthly Rent" className="border p-2 rounded" />

              <div className="flex justify-end gap-2 mt-3">
                <button onClick={()=>setCreatingAgreementFor(null)} className="px-3 py-1 bg-gray-200 rounded">Cancel</button>
                <button onClick={createAgreement} className="px-3 py-1 bg-blue-600 text-white rounded">Create</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
