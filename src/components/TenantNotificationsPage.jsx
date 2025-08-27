import React, { useEffect, useState } from 'react';
import axios from "../utils/axiosInstance";
import { Button } from './ui/button';
import { useToast } from '../context/ToastContext';
import { Trash } from 'lucide-react';

export default function TenantNotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const { showToast } = useToast();

  const fetchNotifications = async () => {
    try {
      const res = await axios.get('/notifications/get-notifications');
      setNotifications(res.data.notifications);
    } catch {
      showToast('Failed to load notifications', 'error');
    }
  };

  const markAllSeen = async () => {
    try {
      await axios.patch('/notifications/mark-seen');
      showToast('All marked as seen', 'success');
      fetchNotifications();
    } catch {
      showToast('Failed to mark as seen', 'error');
    }
  };

  const deleteNotification = async (id) => {
    try {
      await axios.delete(`/notifications/delete-notification/${id}`);
      showToast('Notification deleted', 'success');
      fetchNotifications();
    } catch {
      showToast('Delete failed', 'error');
    }
  };

  useEffect(() => {
  const fetchData = async () => {
    try {
      const res = await axios.get('/notifications/get-notifications');
      setNotifications(res.data.notifications);
    } catch {
      showToast('Failed to load notifications', 'error');
    }
  };

  fetchData();
}, [showToast]);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">🔔 My Notifications</h2>
        <Button onClick={markAllSeen}>Mark All Seen</Button>
      </div>

      {notifications.length === 0 ? (
        <p className="text-gray-500">No notifications yet.</p>
      ) : (
        <ul className="space-y-2">
          {notifications.map(n => (
            <li key={n._id} className="bg-white shadow px-4 py-3 rounded flex justify-between items-start">
              <div>
                <div className="font-medium">{n.type?.toUpperCase()}</div>
                <div>{n.message}</div>
                <div className="text-xs text-gray-400">
                  {new Date(n.createdAt).toLocaleString()} · {n.seen ? 'Seen' : 'Unread'}
                </div>
              </div>
              <Button size="icon" variant="ghost" onClick={() => deleteNotification(n._id)}>
                <Trash size={16} />
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
