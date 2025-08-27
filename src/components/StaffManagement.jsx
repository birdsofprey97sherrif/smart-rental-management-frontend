import React, { useEffect, useState } from "react";
import axios from "../../utils/axiosInstance";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

export default function StaffManagement() {
  const { token } = useAuth();
  const { showToast } = useToast();
  const [staff, setStaff] = useState([]);
  const [newCaretaker, setNewCaretaker] = useState({ fullName: "", email: "", phone: "" });

  const fetchStaff = React.useCallback( async () => {
    try {
      const res = await axios.get("/users?role=caretaker", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setStaff(res.data.users || []);
    } catch {
      showToast("Failed to load caretakers", "error");
    }
  }, [token, showToast]);

  const addCaretaker = async () => {
    try {
      await axios.post("/users/register", { ...newCaretaker, role: "caretaker" }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      showToast("Caretaker added", "success");
      setNewCaretaker({ fullName: "", email: "", phone: "" });
      fetchStaff();
    } catch {
      showToast("Failed to add caretaker", "error");
    }
  };

  useEffect(() => {
    fetchStaff();
  }, [fetchStaff]);

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Caretakers</h2>
      {/* Add Caretaker Form */}
      <div className="mb-4 flex gap-2">
        <input
          placeholder="Full Name"
          value={newCaretaker.fullName}
          onChange={(e) => setNewCaretaker({ ...newCaretaker, fullName: e.target.value })}
          className="border p-2 rounded"
        />
        <input
          placeholder="Email"
          value={newCaretaker.email}
          onChange={(e) => setNewCaretaker({ ...newCaretaker, email: e.target.value })}
          className="border p-2 rounded"
        />
        <input
          placeholder="Phone"
          value={newCaretaker.phone}
          onChange={(e) => setNewCaretaker({ ...newCaretaker, phone: e.target.value })}
          className="border p-2 rounded"
        />
        <button onClick={addCaretaker} className="bg-blue-600 text-white px-4 py-2 rounded">
          Add
        </button>
      </div>

      {/* Caretaker List */}
      <table className="w-full border">
        <thead className="bg-gray-200">
          <tr>
            <th className="p-2">Name</th>
            <th className="p-2">Email</th>
            <th className="p-2">Phone</th>
          </tr>
        </thead>
        <tbody>
          {staff.map((c) => (
            <tr key={c._id} className="border-b">
              <td className="p-2">{c.fullName}</td>
              <td className="p-2">{c.email}</td>
              <td className="p-2">{c.phone}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
