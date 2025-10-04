import React, { useEffect, useState } from 'react';
import axios from "../utils/axiosInstance";
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';

export default function AssignCaretakerDropdown({ houseId, currentCaretakerId, onAssigned }) {
  const [caretakers, setCaretakers] = useState([]);
  const [selected, setSelected] = useState(currentCaretakerId || '');
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();
  const { token } = useAuth();

  useEffect(() => {
    const fetchCaretakers = async () => {
      setLoading(true);
      try {
        // Try primary endpoint first
        const res = await axios.get('/users/staff', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setCaretakers(res.data.staff || res.data.caretakers || []);
      } catch (error) {
        console.error('Failed to fetch from /users/staff:', error);
        
        // Fallback: try alternative endpoint
        try {
          const res = await axios.get('/users/profile/get', {
            headers: { Authorization: `Bearer ${token}` }
          });
          setCaretakers(res.data.caretakers || []);
        } catch (fallbackError) {
          console.error('Failed to fetch from /users/profile/get:', fallbackError);
          showToast('Failed to load staff', 'error');
        }
      } finally {
        setLoading(false);
      }
    };
    
    fetchCaretakers();
  }, [showToast, token]);

  const assignCaretaker = async () => {
    if (!selected) return;
    
    try {
      await axios.patch(`/houses/${houseId}/assign-caretaker`, {
        caretakerId: selected
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      showToast('Caretaker assigned successfully', 'success');
      if (onAssigned) onAssigned();
    } catch (error) {
      console.error('Assignment failed:', error);
      showToast(error.response?.data?.message || 'Assignment failed', 'error');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-2">
        <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="flex space-x-2 items-center">
      <select
        value={selected}
        onChange={(e) => setSelected(e.target.value)}
        className="border rounded p-1"
        disabled={caretakers.length === 0}
      >
        <option value="">-- Select --</option>
        {caretakers.map(ct => (
          <option key={ct._id} value={ct._id}>
            {ct.fullName} ({ct.phone})
          </option>
        ))}
      </select>
      <button
        className="bg-green-600 text-white px-2 py-1 rounded disabled:bg-gray-400 disabled:cursor-not-allowed"
        onClick={assignCaretaker}
        disabled={!selected || caretakers.length === 0}
      >
        Assign
      </button>
    </div>
  );
}