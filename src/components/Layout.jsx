import React from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';

export default function LandlordLayout() {
  const location = useLocation();

  const navItems = [
    { name: 'Dashboard', path: '/landlord' },
    { name: 'My Houses', path: '/landlord/houses' },
    { name: 'My Tenants', path: '/landlord/tenants' }
  ];

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-800 text-white p-4 space-y-4">
        <h2 className="text-xl font-bold mb-4">🏠 Landlord</h2>
        {navItems.map((item) => (
          <Link
            key={item.name}
            to={item.path}
            className={`block p-2 rounded hover:bg-gray-700 ${
              location.pathname === item.path ? 'bg-gray-700' : ''
            }`}
          >
            {item.name}
          </Link>
        ))}
      </aside>

      {/* Main Content */}
      <main className="flex-1 bg-gray-50 overflow-y-auto">
        <p>lo</p>
        <div className="p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
