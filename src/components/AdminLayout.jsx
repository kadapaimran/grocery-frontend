import { Outlet, Link, useLocation } from "react-router-dom";
import { useState } from "react";
import "../styles/AdminLayout.css";

const AdminLayout = () => {
  const location = useLocation();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const navItems = [
    { path: "/admin", label: "Dashboard", icon: "📊" },
    { path: "/admin/products", label: "Manage Products", icon: "📦" },
    { path: "/admin/orders", label: "Orders", icon: "🛒" },
    { path: "/admin/users", label: "Users", icon: "👥" },
    { path: "/admin/analytics", label: "Analytics", icon: "📈" },
    { path: "/admin/settings", label: "Settings", icon: "⚙️" }
  ];

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  const isActiveLink = (path) => {
    if (path === "/admin") {
      return location.pathname === "/admin";
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="admin-layout">
      <nav className={`admin-sidebar ${isSidebarCollapsed ? 'collapsed' : ''}`}>
        <div className="sidebar-header">
          <div className="logo">
            <span className="logo-icon">🏪</span>
            {!isSidebarCollapsed && <h2>Admin Panel</h2>}
          </div>
          <button 
            className="sidebar-toggle"
            onClick={toggleSidebar}
            aria-label={isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isSidebarCollapsed ? "→" : "←"}
          </button>
        </div>

        <ul className="nav-menu">
          {navItems.map((item) => (
            <li key={item.path}>
              <Link 
                to={item.path}
                className={`nav-link ${isActiveLink(item.path) ? 'active' : ''}`}
                title={isSidebarCollapsed ? item.label : ''}
              >
                <span className="nav-icon">{item.icon}</span>
                {!isSidebarCollapsed && <span className="nav-label">{item.label}</span>}
              </Link>
            </li>
          ))}
        </ul>

        <div className="sidebar-footer">
          <Link 
            to="/" 
            className="back-to-store"
            title={isSidebarCollapsed ? "Back to Store" : ''}
          >
            <span className="nav-icon">🏠</span>
            {!isSidebarCollapsed && <span className="nav-label">Back to Store</span>}
          </Link>
        </div>
      </nav>

      <main className="admin-content">
        <header className="content-header">
          <div className="breadcrumb">
            <span>Admin</span>
            {location.pathname !== '/admin' && (
              <>
                <span className="breadcrumb-separator">/</span>
                <span>{location.pathname.split('/').pop()}</span>
              </>
            )}
          </div>
          <div className="user-info">
            <span className="user-avatar">👤</span>
            <span className="user-name">Admin User</span>
          </div>
        </header>
        
        <div className="content-body">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;