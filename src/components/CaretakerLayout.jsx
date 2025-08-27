import React from 'react';
import { Link, useNavigate, useLocation, Outlet } from 'react-router-dom';
import ThemeToggle from './ThemeToggle';
import LanguageSwitcher from './LanguageSwitcher';
import { useAuth } from '../context/AuthContext';

export default function CaretakerLayout() {
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
      return {
        name: crumb
          .replace(/-/g, ' ')
          .replace(/\b\w/g, (l) => l.toUpperCase()), // Capitalize each word
        path
      };
    });

  return (
    <div className="d-flex">
      {/* Sidebar */}
      <aside className="bg-dark text-white p-3 min-vh-100" style={{ width: '250px' }}>
        <h4 className="mb-4">🔧 Caretaker Panel</h4>
        <ul className="nav flex-column">
          <li className="nav-item"><Link to="/caretaker/dashboard" className="nav-link text-white">🏠 Dashboard</Link></li>
          <li className="nav-item"><Link to="/caretaker/messages" className="nav-link text-white">💬 Messages</Link></li>
          <li className="nav-item"><Link to="/caretaker/visits" className="nav-link text-white">📅 Visit Requests</Link></li>
          <li className="nav-item"><Link to="/caretaker/tenant-registration" className="nav-link text-white">📝 Tenant Registration</Link></li>
          <li className="nav-item"><Link to="/caretaker/relocations" className="nav-link text-white">🚚 Relocations</Link></li>
          <li className="nav-item"><Link to="/caretaker/maintenance" className="nav-link text-white">🛠️ Maintenance</Link></li>
        </ul>
      </aside>

      {/* Main Content */}
      <main className="flex-grow-1">
        {/* Header */}
        <nav className="d-flex justify-content-between align-items-center bg-light border-bottom px-4 py-2">
          {/* Breadcrumb */}
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

          <div className="d-flex gap-3 align-items-center">
            <strong>Welcome,</strong> {user?.fullName || 'Caretaker'}
            <ThemeToggle />
            <LanguageSwitcher />
            <button className="btn btn-outline-danger btn-sm" onClick={handleLogout}>Logout</button>
          </div>
        </nav>

        {/* Page Content */}
        <div className="p-4">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
