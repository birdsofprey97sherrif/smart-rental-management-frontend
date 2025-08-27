import React, { useState, useEffect } from 'react';
import axios from "../utils/axiosInstance";
import { Button } from './ui/button';
import { useToast } from '../context/ToastContext';

export default function TenantProfileUpdateForm() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    nationalId: '',
    nextOfKin: '',
    sms: true,
    emailNotif: true,
    inApp: true,
  });
  const [photo, setPhoto] = useState(null);
  const { showToast } = useToast();

  useEffect(() => {
    axios.get('/users/profile/get')
      .then(res => {
        const u = res.data;
        setFormData({
          fullName: u.fullName || '',
          email: u.email || '',
          phone: u.phone || '',
          nationalId: u.tenantDetails?.nationalId || '',
          nextOfKin: u.tenantDetails?.nextOfKin || '',
          sms: u.notificationPrefs?.sms ?? true,
          emailNotif: u.notificationPrefs?.email ?? true,
          inApp: u.notificationPrefs?.inApp ?? true,
        });
      })
      .catch(() => showToast('Failed to load profile', 'error'));
  }, [showToast]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const data = new FormData();
    data.append('fullName', formData.fullName);
    data.append('email', formData.email);
    data.append('phone', formData.phone);
    data.append('tenantDetails[nationalId]', formData.nationalId);
    data.append('tenantDetails[nextOfKin]', formData.nextOfKin);
    data.append('notificationPrefs[sms]', formData.sms);
    data.append('notificationPrefs[email]', formData.emailNotif);
    data.append('notificationPrefs[inApp]', formData.inApp);
    if (photo) data.append('photo', photo);

    try {
      const res = await axios.put('/users/profile/update', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      showToast(res.data.message || 'Profile updated', 'success');
    } catch {
      showToast('Failed to update profile', 'error');
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4">
  <div className="bg-white shadow-lg rounded-xl p-6 md:p-8 border border-gray-200">
    <h2 className="text-2xl font-bold mb-6 text-gray-800 flex items-center gap-2">
      🧍 Update My Profile
    </h2>

    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Full Name + Email */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block font-medium mb-1">Full Name</label>
          <input
            type="text"
            name="fullName"
            value={formData.fullName}
            onChange={handleChange}
            className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        <div>
          <label className="block font-medium mb-1">Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
      </div>

      {/* Phone + National ID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block font-medium mb-1">Phone</label>
          <input
            type="text"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        <div>
          <label className="block font-medium mb-1">National ID</label>
          <input
            type="text"
            name="nationalId"
            value={formData.nationalId}
            onChange={handleChange}
            className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Next of Kin + Profile Photo */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block font-medium mb-1">Next of Kin</label>
          <input
            type="text"
            name="nextOfKin"
            value={formData.nextOfKin}
            onChange={handleChange}
            className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block font-medium mb-1">Profile Photo</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setPhoto(e.target.files[0])}
            className="w-full"
          />
        </div>
      </div>

      {/* Notification Preferences */}
      <fieldset className="border border-gray-300 rounded-lg p-4">
        <legend className="font-semibold text-gray-700 mb-2">
          📲 Notification Preferences
        </legend>
        <label className="block mb-1">
          <input
            type="checkbox"
            name="sms"
            checked={formData.sms}
            onChange={handleChange}
            className="mr-2"
          /> SMS
        </label>
        <label className="block mb-1">
          <input
            type="checkbox"
            name="emailNotif"
            checked={formData.emailNotif}
            onChange={handleChange}
            className="mr-2"
          /> Email
        </label>
        <label className="block">
          <input
            type="checkbox"
            name="inApp"
            checked={formData.inApp}
            onChange={handleChange}
            className="mr-2"
          /> In-App
        </label>
      </fieldset>

      {/* Save Button */}
      <div className="pt-4">
        <Button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg"
        >
          💾 Save Changes
        </Button>
      </div>
    </form>
  </div>
</div>
  );
}
