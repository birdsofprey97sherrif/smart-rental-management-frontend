import React, { useEffect, useState } from 'react';
import axios from "../utils/axiosInstance";
import { Button } from './ui/button';
import { useToast } from '../context/ToastContext';
import AssignCaretakerDropdown from './AssignCaretakerDropdown';

export default function HouseManagementTable() {
    const [houses, setHouses] = useState([]);
    const { showToast } = useToast();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
  const fetchHouses = async () => {
    try {
      const res = await axios.get('/houses/my');
      setHouses(res.data.houses || []);
    } catch (err) {
      showToast('Failed to load houses', 'error');
    } finally {
      setLoading(false);
    }
  };

  fetchHouses();
}, [showToast]);

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this house?')) return;
        try {
            await axios.delete(`/houses/${id}`);
            showToast('House deleted', 'success');
            setHouses(houses.filter(h => h._id !== id));
        } catch {
            showToast('Delete failed', 'error');
        }
    };

    return (
        <div className="p-4">
            <h2 className="text-xl font-bold mb-4">🏘️ My Houses</h2>

            {loading ? (
                <p>Loading houses...</p>
            ) : houses.length === 0 ? (
                <p>No houses uploaded yet.</p>
            ) : (
                <div className="overflow-auto">
                    <table className="min-w-full border shadow-sm">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="p-2 text-left">Title</th>
                                <th className="p-2">Rent</th>
                                <th className="p-2">Status</th>
                                <th className="p-2">Caretaker</th>
                                <th className="p-2">Map</th>
                                <th className="p-2">Photos</th>
                                <th className="p-2">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {houses.map((house) => (
                                <tr key={house._id} className="border-t">
                                    <td className="p-2 font-medium">{house.title}</td>
                                    <td className="p-2 text-center">KES {house.rent}</td>
                                    <td className="p-2 text-center capitalize">{house.status}</td>
                                    <td className="p-2 text-center">
                                        <AssignCaretakerDropdown
                                            houseId={house._id}
                                            currentCaretakerId={house.caretakerId?._id}
                                            onAssigned={() => alert('Caretaker assigned successfully')}
                                        />
                                    </td>

                                    <td className="p-2 text-center">
                                        {/* <a href={house.location?.mapLink} target="_blank" className="text-blue-600 underline">Map</a> */}
                                    </td>
                                    <td className="p-2 text-center">
                                        {house.photos?.length ? (
                                            <img src={house.photos[0]} alt="House" className="w-16 h-12 object-cover rounded" />
                                        ) : 'N/A'}
                                    </td>
                                    <td className="p-2 text-center space-x-2">
                                        <Button onClick={() => alert('Edit feature coming soon')}>Edit</Button>
                                        <Button variant="destructive" onClick={() => handleDelete(house._id)}>Delete</Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
