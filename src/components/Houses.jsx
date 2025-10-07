import React, { useEffect, useState, useCallback } from "react";
import axios from "../utils/axiosInstance";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import HouseUploadForm from "./HouseUploadForm";

function AssignCaretakerDropdownInner({ houseId, currentCaretakerId, onAssigned }) {
  const [caretakers, setCaretakers] = useState([]);
  const [selected, setSelected] = useState(currentCaretakerId || "");
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    const fetchCaretakers = async () => {
      setLoading(true);
      try {
        const res = await axios.get("/users/caretakers");
        setCaretakers(res.data.staff || []);
      } catch {
        showToast("⚠️ Failed to load staff", "error");
      } finally {
        setLoading(false);
      }
    };
    fetchCaretakers();
  }, [showToast]);

  const assignCaretaker = async () => {
    try {
      await axios.patch(`/houses/${houseId}/assign-caretaker`, {
        caretakerId: selected,
      });
      showToast("✅ Caretaker assigned successfully", "success");
      if (onAssigned) onAssigned();
    } catch {
      showToast("❌ Assignment failed", "error");
    }
  };

  return (
    <div className="space-y-3">
      {loading ? (
        <div className="flex items-center justify-center py-4">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-green-600"></div>
        </div>
      ) : caretakers.length === 0 ? (
        <p className="text-gray-500 text-sm">No caretakers available.</p>
      ) : (
        <div className="flex space-x-2 items-center">
          <select
            value={selected}
            onChange={(e) => setSelected(e.target.value)}
            className="border rounded p-2 flex-grow"
          >
            <option value="">-- Select Caretaker --</option>
            {caretakers.map((ct) => (
              <option key={ct._id} value={ct._id}>
                {ct.fullName} ({ct.phone})
              </option>
            ))}
          </select>
          <button
            className={`px-3 py-2 rounded text-white ${
              selected
                ? "bg-green-600 hover:bg-green-700"
                : "bg-gray-400 cursor-not-allowed"
            }`}
            onClick={assignCaretaker}
            disabled={!selected}
          >
            Assign
          </button>
        </div>
      )}
    </div>
  );
}


export default function Houses() {
  const { token } = useAuth();
  const { showToast } = useToast();
  const [houses, setHouses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [assignModal, setAssignModal] = useState(null); // { id, caretakerId, title }
  const [uploadModal, setUploadModal] = useState(false);

  const fetchHouses = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get("/houses", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setHouses(res.data);
    } catch (err) {
      showToast("Failed to load houses", "error");
    } finally {
      setLoading(false);
    }
  }, [token, showToast]);

  const handleEdit = (id) => {
    showToast(`Edit house ${id}`, "info");
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this house?")) return;
    try {
      await axios.delete(`/houses/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      showToast("House deleted ✅", "success");
      fetchHouses();
    } catch (err) {
      showToast("Failed to delete house ❌", "error");
    }
  };

  const handleAssignCaretaker = (id, currentCaretakerId, title) => {
    setAssignModal({ id, caretakerId: currentCaretakerId, title });
  };

  useEffect(() => {
    fetchHouses();
  }, [fetchHouses]);

  return (
    <div className="p-4 bg-white shadow rounded-lg relative">
      {/* Header Section */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">🏠 My Houses</h2>
        <button
          onClick={() => setUploadModal(true)}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg shadow transition-all duration-200"
        >
          ➕ Add House
        </button>
      </div>

      {/* Loading Overlay */}
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/70 z-10">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-green-600"></div>
        </div>
      )}

      {/* Table Section */}
      {!loading && houses.length === 0 ? (
        <div className="text-gray-500 py-10 text-center">
          <div className="text-4xl mb-2">🏚️</div>
          <p>No houses found</p>
          <button
            onClick={() => setUploadModal(true)}
            className="mt-3 bg-green-600 hover:bg-success-700 text-white px-4 py-2 rounded-lg shadow"
          >
            Add Your First House
          </button>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-200 rounded-lg">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2 text-left">Title</th>
                <th className="px-4 py-2 text-left">Location</th>
                <th className="px-4 py-2 text-left">Rent</th>
                <th className="px-4 py-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {houses.map((h) => (
                <tr
                  key={h._id}
                  className="border-t hover:bg-gray-50 transition-colors"
                >
                  <td className="px-4 py-2">{h.title}</td>
                  <td className="px-4 py-2">
                    {typeof h.location === "string"
                      ? h.location
                      : h.location?.address}
                  </td>
                  <td className="px-4 py-2 font-semibold text-green-600">
                    KES {h.rent}
                  </td>
                  <td className="px-4 py-2 flex gap-2">
                    <button
                      onClick={() => handleEdit(h._id)}
                      className="bg-blue-500 hover:bg-info-600 text-white px-3 py-1 rounded-md text-sm"
                    >
                      ✏ Edit
                    </button>
                    <button
                      onClick={() => handleDelete(h._id)}
                      className="bg-red-500 hover:bg-danger-600 text-white px-3 py-1 rounded-md text-sm"
                    >
                      🗑 Delete
                    </button>
                    <button
                      onClick={() =>
                        handleAssignCaretaker(
                          h._id,
                          h.caretaker?._id,
                          h.title
                        )
                      }
                      className="bg-yellow-500 hover:bg-warning-600 text-white px-3 py-1 rounded-md text-sm"
                    >
                      👤 Assign Caretaker
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Assign Caretaker Modal */}
      {assignModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h3 className="text-lg font-bold mb-4">
              Assign Caretaker for <span className="text-green-600">{assignModal.title}</span>
            </h3>
            <AssignCaretakerDropdownInner
              houseId={assignModal.id}
              currentCaretakerId={assignModal.caretakerId}
              onAssigned={() => {
                fetchHouses();
                setAssignModal(null);
              }}
            />
            <div className="mt-4 text-right">
              <button
                onClick={() => setAssignModal(null)}
                className="px-4 py-2 bg-gray-300 hover:bg-gray-400 rounded"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Upload House Modal */}
      {uploadModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 overflow-y-auto">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">➕ Add New House</h3>
              <button
                onClick={() => setUploadModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✖
              </button>
            </div>
            <HouseUploadForm />
          </div>
        </div>
      )}
    </div>
  );
}
