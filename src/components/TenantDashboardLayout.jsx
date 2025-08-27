import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { Bell, Home, FileText, Wrench, MapPin, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext'; // assuming this exists

export default function TenantDashboardLayout() {
  const { logout, user } = useAuth();

  const menu = [
    { to: '/tenant/dashboard', icon: <Home />, label: 'Dashboard' },
    { to: '/tenant/relocations', icon: <MapPin />, label: 'Relocations' },
    { to: '/tenant/payments', icon: <FileText />, label: 'Payments' },
    { to: '/tenant/maintenance', icon: <Wrench />, label: 'Maintenance' },
    { to: '/tenant/visits', icon: <MapPin />, label: 'Visits' },
  ];

  return (
    <div className="flex min-h-screen bg-gray-100">
      <aside className="w-64 bg-white border-r p-4 space-y-6">
        <h2 className="text-xl font-bold text-center">🏡 Tenant Panel</h2>
        <nav className="flex flex-col space-y-3">
          {menu.map(({ to, icon, label }) => (
            <NavLink
              to={to}
              key={to}
              className={({ isActive }) =>
                `flex items-center space-x-2 px-4 py-2 rounded ${
                  isActive ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-200'
                }`
              }
            >
              {icon}
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>
        <button onClick={logout} className="text-red-500 flex items-center space-x-2 px-4 py-2 hover:bg-red-100 rounded">
          <LogOut /> <span>Logout</span>
        </button>
      </aside>
      <main className="flex-1 p-6">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">Welcome, {user?.fullName}</h1>
          <NavLink to="/tenant/notifications" className="relative">
            <Bell className="w-6 h-6" />
          </NavLink>
        </div>
        <Outlet />
      </main>
    </div>
  );
}
