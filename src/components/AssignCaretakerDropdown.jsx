import React, { useEffect, useState } from 'react';
import axios from "../utils/axiosInstance";
import { useToast } from '../context/ToastContext';

export default function AssignCaretakerDropdown({ houseId, currentCaretakerId, onAssigned }) {
  const [caretakers, setCaretakers] = useState([]);
  const [selected, setSelected] = useState(currentCaretakerId || '');
  const { showToast } = useToast();

  useEffect(() => {
    axios.get('/users/staff')
      .then(res => setCaretakers(res.data.staff || []))
      .catch(() => showToast('Failed to load staff', 'error'));
  }, [showToast]);

  const assignCaretaker = async () => {
    try {
      await axios.patch(`/houses/${houseId}/assign-caretaker`, {
        caretakerId: selected
      });
      showToast('Caretaker assigned successfully', 'success');
      if (onAssigned) onAssigned();
    } catch {
      showToast('Assignment failed', 'error');
    }
  };

  return (
    <div className="flex space-x-2 items-center">
      <select
        value={selected}
        onChange={(e) => setSelected(e.target.value)}
        className="border rounded p-1"
      >
        <option value="">-- Select --</option>
        {caretakers.map(ct => (
          <option key={ct._id} value={ct._id}>
            {ct.fullName} ({ct.phone})
          </option>
        ))}
      </select>
      <button
        className="bg-green-600 text-white px-2 py-1 rounded"
        onClick={assignCaretaker}
        disabled={!selected}
      >
        Assign
      </button>
    </div>
  );
}
