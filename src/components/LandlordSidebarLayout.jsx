// src/components/LandlordLayout.jsx
import React from 'react';
import { Link, useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ThemeToggle from './ThemeToggle';
import LanguageSwitcher from './LanguageSwitcher';

export default function LandlordLayout({ children }) {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  // Breadcrumb generator
  const breadcrumb = location.pathname
    .split('/')
    .filter(Boolean)
    .map((crumb, index, array) => {
      const path = '/' + array.slice(0, index + 1).join('/');
      return { name: crumb.charAt(0).toUpperCase() + crumb.slice(1), path };
    });

  return (
    <div className="d-flex">
      {/* Sidebar */}
      <aside className="bg-dark text-white p-3 min-vh-100 d-flex flex-column" style={{ width: '250px' }}>
        <h4 className="mb-4">🏠 Landlord Panel</h4>
        <ul className="nav flex-column flex-grow-1">
          <li className="nav-item">
            <Link to="/landlord/dashboard" className="nav-link text-white">📊 Dashboard </Link>
          </li>
          <li className="nav-item">
            <Link to="/landlord/houses" className="nav-link text-white">🏘 Houses</Link>
          </li>
          <li className="nav-item">
            <Link to="/landlord/visits" className="nav-link text-white">📅 Visit Requests</Link>
          </li>
          <li className="nav-item">
            <Link to="/landlord/agreements" className="nav-link text-white">📄 Agreements</Link>
          </li>
          <li className="nav-item">
            <Link to="/landlord/caretaker" className="nav-link text-white">👤 Caretaker</Link>
          </li>
          <li className="nav-item">
            <Link to="/landlord/relocations" className="nav-link text-white">🚚 Relocations</Link>
          </li>
          <li className="nav-item">
            <Link to="/landlord/defaulters" className="nav-link text-white">🚨 Defaulters</Link>
          </li>
          <li className="nav-item">
            <Link to="/landlord/payments" className="nav-link text-white">💳 Payments</Link>
          </li>
          <li className="nav-item">
            <Link to="/landlord/tenants" className="nav-link text-white">👥 Tenants</Link>
          </li>
          <li className="nav-item">
            <Link to="/landlord/maintenance" className="nav-link text-white">🛠 Maintenance</Link>
          </li>
          <li className="nav-item">
            <Link to="/landlord/broadcast" className="nav-link text-white">📢 Broadcast</Link>
          </li>
          <li className="nav-item">
            <Link to="/landlord/notifications" className="nav-link text-white">🔔 Notifications</Link>
          </li>
          <li className="nav-item">
            <Link to="/landlord/settings" className="nav-link text-white">⚙️ Settings</Link>
          </li>
        </ul>

        {/* Sidebar Logout at bottom */}
        <button
          className="btn btn-outline-danger w-100 mt-auto"
          onClick={handleLogout}
        >
          Logout
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-grow-1">
        {/* Header */}
        <nav className="d-flex justify-content-between align-items-center bg-light border-bottom px-4 py-2">
          {/* Left: Breadcrumb */}
          <div className="d-flex align-items-center gap-2">
            <nav className="breadcrumb m-0 p-0 bg-transparent">
              <Link to="/" className="breadcrumb-item">Home</Link>
              {breadcrumb.map((crumb, index) =>
                index === breadcrumb.length - 1 ? (
                  <span key={crumb.path} className="breadcrumb-item active">{crumb.name}</span>
                ) : (
                  <Link key={crumb.path} to={crumb.path} className="breadcrumb-item">{crumb.name}</Link>
                )
              )}
            </nav>
          </div>

          {/* Right: User Info */}
          <div className="d-flex gap-3 align-items-center">
            <strong>Welcome,</strong> {user?.fullName || 'Landlord'}
            <ThemeToggle />
            <LanguageSwitcher />
            <button className="btn btn-outline-danger btn-sm" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </nav>

        {/* Page Content */}
        {/* Page Content */}
        <div className="p-4">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
