import React from "react";
import { NavLink, Outlet, Link, useLocation } from "react-router-dom";
import ThemeToggle from "./ThemeToggle";
import LanguageSwitcher from "./LanguageSwitcher";
import { useAuth } from "../context/AuthContext";

export default function TenantSidebarLayout() {
  const { logout, user } = useAuth();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    window.location.href = "/login"; // or use navigate if using `useNavigate()`
  };

  // Breadcrumb generator
  const breadcrumb = location.pathname
    .split("/")
    .filter(Boolean)
    .map((crumb, index, array) => {
      const path = "/" + array.slice(0, index + 1).join("/");
      return { name: crumb.charAt(0).toUpperCase() + crumb.slice(1), path };
    });

  return (
    <div className="d-flex" style={{ minHeight: "100vh" }}>
      {/* Sidebar */}
      <aside className="bg-dark text-white p-3" style={{ width: "250px" }}>
        <h4 className="mb-4">🏠 Tenant Panel</h4>
        <ul className="nav flex-column">
          <li className="nav-item">
            <NavLink to="/tenant/dashboard" className="nav-link text-white">
              📊 Dashboard
            </NavLink>
          </li>
          <li className="nav-item">
            <NavLink to="/tenant/payment" className="nav-link text-white">
              💳 Payments
            </NavLink>
          </li>
          <li className="nav-item">
            <NavLink to="/tenant/relocation" className="nav-link text-white">
              📝 Relocation
            </NavLink>
          </li>
          <li className="nav-item">
            <NavLink to="/tenant/maintenance" className="nav-link text-white">
              🔧 Maintenance
            </NavLink>
          </li>
          <li className="nav-item">
            <NavLink to="/tenant/visits" className="nav-link text-white">
              🛎️ Visits
            </NavLink>
          </li>
          <li className="nav-item">
            <NavLink to="/tenant/profile" className="nav-link text-white">
              👤 Profile
            </NavLink>
          </li>
          <li className="nav-item">
            <NavLink to="/tenant/chat" className="nav-link text-white">
              💬 Chat
            </NavLink>
          </li>
          <li className="nav-item">
            <NavLink to="/tenant/notifications" className="nav-link text-white">
              🔔 Notifications
            </NavLink>
          </li>
        </ul>
      </aside>

      {/* Main Content */}
      <main className="flex-grow-1 bg-light">
        {/* Header */}
        <nav className="d-flex justify-content-between align-items-center bg-white border-bottom px-4 py-2">
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
            <strong>Welcome,</strong> {user?.fullName || "Tenant"}
            <ThemeToggle />
            <LanguageSwitcher />
            <button
              onClick={handleLogout}
              className="btn btn-sm btn-outline-danger"
            >
              🚪 Logout
            </button>
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
