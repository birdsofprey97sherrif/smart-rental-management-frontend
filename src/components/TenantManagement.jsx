// src/components/landlord/TenantManagement.jsx
import React, { useEffect, useState, useCallback } from "react";
import axios from "../utils/axiosInstance";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { format } from "date-fns";

export default function TenantManagement() {
  const { token } = useAuth();
  const { showToast } = useToast();
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newTenant, setNewTenant] = useState({ fullName: "", email: "", phone: "" });
  const [search, setSearch] = useState("");
  const [editingTenant, setEditingTenant] = useState(null);

  // Fetch tenants
  const fetchTenants = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get("/landlord/tenants", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTenants(res.data.tenants || []);
    } catch {
      showToast("Failed to load tenants", "error");
    } finally {
      setLoading(false);
    }
  }, [token, showToast]);

  // Add Tenant
  const addTenant = async () => {
    if (!newTenant.fullName || !newTenant.email || !newTenant.phone) {
      return showToast("Fill all tenant details", "error");
    }
    try {
      await axios.post(
        "/auth/register",
        { ...newTenant, role: "tenant" },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      showToast("Tenant added successfully", "success");
      setNewTenant({ fullName: "", email: "", phone: "" });
      fetchTenants();
    } catch {
      showToast("Failed to add tenant", "error");
    }
  };

  // Edit Tenant
  const updateTenant = async () => {
    try {
      await axios.put(
        `/landlord/tenants/${editingTenant._id}`,
        editingTenant,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      showToast("Tenant updated", "success");
      setEditingTenant(null);
      fetchTenants();
    } catch {
      showToast("Failed to update tenant", "error");
    }
  };

  // Delete Tenant
  const deleteTenant = async (id) => {
    if (!window.confirm("Are you sure you want to delete this tenant?")) return;
    try {
      await axios.delete(`/landlord/tenants/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      showToast("Tenant deleted", "success");
      fetchTenants();
    } catch {
      showToast("Failed to delete tenant", "error");
    }
  };

  // Export to CSV
  const exportCSV = () => {
    const header = ["Name", "Email", "Phone", "House", "Lease Start", "Lease End", "Status"];
    const rows = tenants.map((ag) => [
      ag.tenantId?.fullName,
      ag.tenantId?.email,
      ag.tenantId?.phone,
      ag.houseId?.title || "N/A",
      format(new Date(ag.leaseStart), "dd MMM yyyy"),
      format(new Date(ag.leaseEnd), "dd MMM yyyy"),
      new Date(ag.leaseEnd) < new Date() ? "Expired" : "Active",
    ]);
    const csvContent = [header, ...rows].map((r) => r.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "tenants.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  // Export to PDF (basic)
  const exportPDF = () => {
    const printContent = tenants
      .map(
        (ag) =>
          `${ag.tenantId?.fullName} | ${ag.tenantId?.email} | ${ag.tenantId?.phone} | ${
            ag.houseId?.title || "N/A"
          } | ${format(new Date(ag.leaseStart), "dd MMM yyyy")} - ${format(
            new Date(ag.leaseEnd),
            "dd MMM yyyy"
          )} | ${new Date(ag.leaseEnd) < new Date() ? "Expired" : "Active"}`
      )
      .join("\n");

    const printWindow = window.open("", "", "width=800,height=600");
    printWindow.document.write("<pre>" + printContent + "</pre>");
    printWindow.print();
  };

  useEffect(() => {
    fetchTenants();
  }, [fetchTenants]);

  const filteredTenants = tenants.filter((t) =>
    t.tenantId?.fullName?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <p className="p-4">Loading tenants...</p>;

  return (
    <div className="p-4 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h2 className="text-2xl font-bold">👥 Tenant Management</h2>

        {/* Actions */}
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="🔍 Search tenants..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border p-2 rounded w-48"
          />
          <button onClick={exportCSV} className="bg-green-600 text-white px-3 py-1 rounded">
            ⬇️ CSV
          </button>
          <button onClick={exportPDF} className="bg-red-600 text-white px-3 py-1 rounded">
            ⬇️ PDF
          </button>
        </div>
      </div>

      {/* Add Tenant */}
      <div className="bg-white shadow rounded p-4 flex flex-col md:flex-row gap-2">
        <input
          placeholder="Full Name"
          value={newTenant.fullName}
          onChange={(e) => setNewTenant({ ...newTenant, fullName: e.target.value })}
          className="border p-2 rounded flex-1"
        />
        <input
          placeholder="Email"
          value={newTenant.email}
          onChange={(e) => setNewTenant({ ...newTenant, email: e.target.value })}
          className="border p-2 rounded flex-1"
        />
        <input
          placeholder="Phone"
          value={newTenant.phone}
          onChange={(e) => setNewTenant({ ...newTenant, phone: e.target.value })}
          className="border p-2 rounded flex-1"
        />
        <button
          onClick={addTenant}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          ➕ Add Tenant
        </button>
      </div>

      {/* Tenant List */}
      {filteredTenants.length === 0 ? (
        <p className="text-gray-500">No tenants found.</p>
      ) : (
        <div className="overflow-auto">
          <table className="min-w-full border text-sm shadow-sm">
            <thead className="bg-gray-100 text-left">
              <tr>
                <th className="p-2">Tenant</th>
                <th className="p-2">Contact</th>
                <th className="p-2">House</th>
                <th className="p-2">Lease Start</th>
                <th className="p-2">Lease End</th>
                <th className="p-2">Status</th>
                <th className="p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTenants.map((ag) => {
                const now = new Date();
                const end = new Date(ag.leaseEnd);
                const isExpired = end < now;
                return (
                  <tr key={ag._id} className="border-t hover:bg-gray-50">
                    <td className="p-2 font-medium">
                      {editingTenant?._id === ag._id ? (
                        <input
                          value={editingTenant.fullName}
                          onChange={(e) =>
                            setEditingTenant({ ...editingTenant, fullName: e.target.value })
                          }
                          className="border p-1 rounded"
                        />
                      ) : (
                        ag.tenantId?.fullName
                      )}
                    </td>
                    <td className="p-2">
                      {editingTenant?._id === ag._id ? (
                        <>
                          <input
                            value={editingTenant.phone}
                            onChange={(e) =>
                              setEditingTenant({ ...editingTenant, phone: e.target.value })
                            }
                            className="border p-1 rounded mb-1"
                          />
                          <input
                            value={editingTenant.email}
                            onChange={(e) =>
                              setEditingTenant({ ...editingTenant, email: e.target.value })
                            }
                            className="border p-1 rounded"
                          />
                        </>
                      ) : (
                        <>
                          📞 {ag.tenantId?.phone}
                          <br />
                          📧 {ag.tenantId?.email}
                        </>
                      )}
                    </td>
                    <td className="p-2">{ag.houseId?.title || "N/A"}</td>
                    <td className="p-2">{format(new Date(ag.leaseStart), "dd MMM yyyy")}</td>
                    <td className="p-2">{format(new Date(ag.leaseEnd), "dd MMM yyyy")}</td>
                    <td className="p-2">
                      <span
                        className={`px-2 py-1 rounded text-white ${
                          isExpired ? "bg-red-500" : "bg-green-600"
                        }`}
                      >
                        {isExpired ? "Expired" : "Active"}
                      </span>
                    </td>
                    <td className="p-2 flex gap-2">
                      {editingTenant?._id === ag._id ? (
                        <>
                          <button
                            onClick={updateTenant}
                            className="bg-green-600 text-white px-2 py-1 rounded"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setEditingTenant(null)}
                            className="bg-gray-400 text-white px-2 py-1 rounded"
                          >
                            Cancel
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() =>
                              setEditingTenant({
                                _id: ag._id,
                                fullName: ag.tenantId?.fullName,
                                email: ag.tenantId?.email,
                                phone: ag.tenantId?.phone,
                              })
                            }
                            className="bg-yellow-500 text-white px-2 py-1 rounded"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => deleteTenant(ag._id)}
                            className="bg-red-600 text-white px-2 py-1 rounded"
                          >
                            Delete
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
