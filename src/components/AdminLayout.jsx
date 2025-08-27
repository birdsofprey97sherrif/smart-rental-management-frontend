import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import ThemeToggle from './ThemeToggle';
import LanguageSwitcher from './LanguageSwitcher';
import { useAuth } from '../context/AuthContext';

export default function AdminLayout({ children }) {
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
      <aside className="bg-dark text-white p-3 min-vh-100" style={{ width: '250px' }}>
        <h4 className="mb-4">🏠 Admin Panel</h4>
        <ul className="nav flex-column">
          <li className="nav-item"><Link to="/admin/dashboard" className="nav-link text-white">📊 Dashboard</Link></li>
          {/* <li className="nav-item"><Link to="/admin/staff/register" className="nav-link text-white">👥 Register Staff</Link></li> */}
          <li className="nav-item"><Link to="/admin/defaulters" className="nav-link text-white">🚨 Defaulters</Link></li>
          <li className="nav-item"><Link to="/admin/broadcast" className="nav-link text-white">📢 Broadcast</Link></li>
          <li className="nav-item"><Link to="/admin/relocations" className="nav-link text-white">🚚 Relocations</Link></li>
          <li className="nav-item"><Link to="/admin/audit-logs" className="nav-link text-white">📋 Audit Logs</Link></li>
          <li className="nav-item"><Link to="/admin/charts" className="nav-link text-white">📊 Charts</Link></li>
          <li className="nav-item"><Link to="/admin/staff/list" className="nav-link text-white">👥 Staff List</Link></li>
          {/* <li className="nav-item"><Link to="/admin/staff/edit" className="nav-link text-white">👤 Edit Staff</Link></li> */}
          <li className='nav-item'><Link to="/admin/relocation/view" className="nav-link text-white">📝 View Relocation</Link></li>
          {/* <li className='nav-item'><Link to="/admin/staff" className="nav-link text-white">👤 Profile</Link></li> */}
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
            <strong>Welcome,</strong> {user?.fullName || 'Admin'}
            <ThemeToggle />
            <LanguageSwitcher />
            <button className="btn btn-outline-danger btn-sm" onClick={handleLogout}>Logout</button>
          </div>
        </nav>

        {/* Page Content */}
        <div className="p-4">{children}</div>
      </main>
    </div>
  );
}
