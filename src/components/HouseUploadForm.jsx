import React, { useEffect, useState } from 'react';
import axios from "../utils/axiosInstance";
import { Button } from './ui/button';
import { useToast } from '../context/ToastContext';

export default function HouseUploadForm() {
  const [form, setForm] = useState({
    title: '',
    description: '',
    rent: '',
    size: '',
    amenities: '',
    county: '',
    town: '',
    street: '',
    mapLink: '',
    caretakerId: '',
  });
  const [photos, setPhotos] = useState([]);
  const [caretakers, setCaretakers] = useState([]);
  const { showToast } = useToast();

  useEffect(() => {
    axios.get('/users/profile/get')
      .then(res => setCaretakers(res.data.caretakers || []))
      .catch(() => showToast('Failed to load caretakers', 'error'));
  }, [showToast]);

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    const data = new FormData();
    data.append('title', form.title);
    data.append('description', form.description);
    data.append('rent', form.rent);
    data.append('size', form.size);
    data.append('location[county]', form.county);
    data.append('location[town]', form.town);
    data.append('location[street]', form.street);
    data.append('location[mapLink]', form.mapLink);
    data.append('caretakerId', form.caretakerId);
    photos.forEach(photo => data.append('photos', photo));

    try {
      const res = await axios.post('/houses', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      showToast(res.data.message || 'House uploaded successfully', 'success');
      setForm({
        title: '', description: '', rent: '', size: '',
        amenities: '', county: '', town: '', street: '', mapLink: '', caretakerId: ''
      });
      setPhotos([]);
    } catch (err) {
      showToast('Upload failed', 'error');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5 max-w-2xl">
      <h2 className="text-2xl font-bold">🏠 Upload House</h2>

      <input type="text" name="title" placeholder="House title" value={form.title} onChange={handleChange} required className="w-full border p-2 rounded" />
      <textarea name="description" placeholder="Description" value={form.description} onChange={handleChange} className="w-full border p-2 rounded" />

      <input type="number" name="rent" placeholder="Rent (KES)" value={form.rent} onChange={handleChange} required className="w-full border p-2 rounded" />
      <input type="text" name="size" placeholder="Size (e.g. medium, 3BR)" value={form.size} onChange={handleChange} className="w-full border p-2 rounded" />

      <input type="text" name="amenities" placeholder="Amenities (comma separated)" value={form.amenities} onChange={handleChange} className="w-full border p-2 rounded" />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <input name="county" placeholder="County" value={form.county} onChange={handleChange} className="border p-2 rounded" />
        <input name="town" placeholder="Town" value={form.town} onChange={handleChange} className="border p-2 rounded" />
        <input name="street" placeholder="Street" value={form.street} onChange={handleChange} className="border p-2 rounded" />
        <input name="mapLink" placeholder="Google Maps URL" value={form.mapLink} onChange={handleChange} className="border p-2 rounded" />
      </div>

      <div>
        <label className="block mb-1 font-semibold">📷 Photos</label>
        <input type="file" multiple accept="image/*" onChange={(e) => setPhotos([...e.target.files])} />
      </div>

      <div>
        <label className="block mb-1 font-semibold">🧍 Assign Caretaker</label>
        <select name="caretakerId" value={form.caretakerId} onChange={handleChange} className="w-full border p-2 rounded">
          <option value="">-- Select Caretaker --</option>
          {caretakers.map(c => (
            <option key={c._id} value={c._id}>{c.fullName} ({c.phone})</option>
          ))}
        </select>
      </div>

      <Button type="submit">Upload House</Button>
    </form>
  );
}
