import React from 'react';
import { Link } from 'react-router-dom';

const AdminSidebar = ({ activePage, setActivePage, sidebarOpen, setSidebarOpen }) => {
  const menuItems = [
    { id: 'dashboard', icon: 'fa-chart-pie', label: 'Dashboard' },
    { id: 'users', icon: 'fa-users', label: 'Users' },
    { id: 'products', icon: 'fa-box', label: 'Products' },
    { id: 'reports', icon: 'fa-chart-line', label: 'Reports' },
    { id: 'settings', icon: 'fa-gear', label: 'Settings' },
  ];

  return (
    <>
      <div className={`admin-sidebar ${!sidebarOpen ? 'collapsed' : ''}`}>
        <div className="sidebar-brand">
          <i className="fas fa-tag logo-icon"></i>
          <div className="brand-text">
            KN <span>Ads</span>
            <span className="brand-sub">Admin Panel</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          {menuItems.map((item) => (
            <a
              key={item.id}
              href="#"
              className={`nav-item ${activePage === item.id ? 'active' : ''}`}
              onClick={(e) => { e.preventDefault(); setActivePage(item.id); }}
            >
              <i className={`fas ${item.icon}`}></i>
              <span>{item.label}</span>
            </a>
          ))}
        </nav>

        <div className="sidebar-footer">
          <Link to="/" className="back-to-site">
            <i className="fas fa-arrow-left"></i> Back to Site
          </Link>
        </div>
      </div>

      <div className={`sidebar-overlay ${!sidebarOpen ? 'active' : ''}`} onClick={() => setSidebarOpen(true)}></div>
    </>
  );
};

export default AdminSidebar;