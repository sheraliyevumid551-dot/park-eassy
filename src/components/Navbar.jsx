import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { LayoutDashboard, MapPin, Receipt, BarChart3, User, Wallet, Car } from 'lucide-react';
import { useParking } from '../context/ParkingContext';

const Navbar = () => {
  const { walletBalance, cars } = useParking();

  const menuItems = [
    { path: '/', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/map', label: 'Parking Topish', icon: MapPin },
    { path: '/bookings', label: 'Bronlarim', icon: Receipt },
    { path: '/analytics', label: 'Analitika', icon: BarChart3 },
    { path: '/profile', label: 'Profil', icon: User }
  ];

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="sidebar-nav glass">
        <div className="sidebar-brand">
          <Link to="/" className="brand-logo">
            <span className="car-emoji">🚗</span>
            <span className="brand-text">Park<span className="brand-highlight">Easy</span></span>
          </Link>
          <span className="brand-tagline">Demo Day Edition</span>
        </div>

        {/* Quick Stats Panel */}
        <div className="sidebar-stats glass-glow">
          <div className="stat-row">
            <div className="stat-label-container">
              <Wallet size={14} className="stat-icon-wallet" />
              <span>Hamyon</span>
            </div>
            <span className="stat-value">{walletBalance.toLocaleString('uz-UZ')} UZS</span>
          </div>
          {cars.length > 0 && (
            <div className="stat-row">
              <div className="stat-label-container">
                <Car size={14} className="stat-icon-car" />
                <span>Mashina</span>
              </div>
              <span className="stat-value">{cars[0].plate}</span>
            </div>
          )}
        </div>

        {/* Menu Items */}
        <nav className="sidebar-menu">
          {menuItems.map((item) => {
            const IconComponent = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) => `menu-link ${isActive ? 'active' : ''}`}
              >
                <IconComponent size={20} className="menu-icon" />
                <span className="menu-label">{item.label}</span>
                <span className="active-dot"></span>
              </NavLink>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <p>© 2026 ParkEasy Corp.</p>
          <div className="footer-status">
            <span className="status-ping animate-pulse-glow"></span>
            <span>Tizim online</span>
          </div>
        </div>
      </aside>

      {/* Mobile Header */}
      <header className="mobile-header glass">
        <Link to="/" className="brand-logo">
          <span className="car-emoji">🚗</span>
          <span className="brand-text">Park<span className="brand-highlight">Easy</span></span>
        </Link>
        <div className="mobile-balance glass-glow">
          <Wallet size={12} />
          <span>{walletBalance.toLocaleString('uz-UZ')} UZS</span>
        </div>
      </header>

      {/* Mobile Bottom Navigation */}
      <nav className="mobile-nav glass">
        {menuItems.map((item) => {
          const IconComponent = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `mobile-menu-link ${isActive ? 'active' : ''}`}
            >
              <IconComponent size={22} />
              <span className="mobile-label">{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Embedded CSS for Navbar & Layout */}
      <style>{`
        /* Sidebar Styles */
        .sidebar-nav {
          width: 280px;
          height: 100vh;
          position: fixed;
          top: 0;
          left: 0;
          display: flex;
          flex-direction: column;
          padding: 2rem 1.5rem;
          border-radius: 0;
          border-right: 1px solid var(--border-light);
          z-index: 100;
        }

        .sidebar-brand {
          display: flex;
          flex-direction: column;
          margin-bottom: 2rem;
        }

        .brand-logo {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          text-decoration: none;
          color: var(--text-primary);
        }

        .car-emoji {
          font-size: 2rem;
        }

        .brand-text {
          font-family: var(--font-heading);
          font-size: 1.6rem;
          font-weight: 800;
          letter-spacing: -0.03em;
        }

        .brand-highlight {
          color: var(--color-primary);
          text-shadow: 0 0 10px rgba(0, 242, 254, 0.3);
        }

        .brand-tagline {
          font-size: 0.75rem;
          color: var(--color-secondary);
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.15em;
          margin-top: -0.2rem;
          margin-left: 2.8rem;
        }

        /* Sidebar Stats Panel */
        .sidebar-stats {
          padding: 1rem;
          border-radius: var(--radius-md);
          margin-bottom: 2rem;
          font-size: 0.85rem;
        }

        .stat-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.5rem;
        }

        .stat-row:last-child {
          margin-bottom: 0;
          padding-top: 0.5rem;
          border-top: 1px solid rgba(255, 255, 255, 0.05);
        }

        .stat-label-container {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          color: var(--text-secondary);
        }

        .stat-icon-wallet {
          color: var(--color-primary);
        }

        .stat-icon-car {
          color: var(--color-secondary);
        }

        .stat-value {
          font-weight: 600;
          color: var(--text-primary);
        }

        /* Sidebar Menu links */
        .sidebar-menu {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          flex-grow: 1;
        }

        .menu-link {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 0.85rem 1rem;
          border-radius: var(--radius-md);
          color: var(--text-secondary);
          text-decoration: none;
          font-weight: 500;
          transition: var(--transition-smooth);
          position: relative;
          overflow: hidden;
        }

        .menu-link:hover {
          color: var(--text-primary);
          background: rgba(255, 255, 255, 0.03);
          transform: translateX(3px);
        }

        .menu-link.active {
          color: #0b0f17;
          background: linear-gradient(135deg, var(--color-primary), var(--color-accent));
          font-weight: 600;
          box-shadow: 0 4px 15px rgba(0, 242, 254, 0.25);
        }

        .menu-icon {
          transition: var(--transition-smooth);
        }

        .menu-link.active .menu-icon {
          color: #0b0f17;
        }

        .active-dot {
          display: none;
          position: absolute;
          right: 12px;
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #0b0f17;
        }

        .menu-link.active .active-dot {
          display: block;
        }

        .sidebar-footer {
          margin-top: auto;
          font-size: 0.75rem;
          color: var(--text-muted);
          border-top: 1px solid rgba(255, 255, 255, 0.05);
          padding-top: 1rem;
        }

        .footer-status {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          margin-top: 0.4rem;
          color: var(--text-secondary);
        }

        .status-ping {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: var(--color-success);
        }

        /* Mobile Layout Components */
        .mobile-header {
          display: none;
          height: 60px;
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          align-items: center;
          justify-content: space-between;
          padding: 0 1.5rem;
          z-index: 100;
          border-radius: 0;
          border-bottom: 1px solid var(--border-light);
        }

        .mobile-balance {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          padding: 0.4rem 0.8rem;
          border-radius: 9999px;
          font-size: 0.8rem;
          font-weight: 600;
        }

        .mobile-nav {
          display: none;
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          height: 65px;
          z-index: 100;
          border-radius: 0;
          border-top: 1px solid var(--border-light);
          justify-content: space-around;
          align-items: center;
          padding: 0 0.5rem;
        }

        .mobile-menu-link {
          display: flex;
          flex-direction: column;
          align-items: center;
          color: var(--text-secondary);
          text-decoration: none;
          font-size: 0.65rem;
          gap: 0.2rem;
          transition: var(--transition-fast);
        }

        .mobile-menu-link.active {
          color: var(--color-primary);
          text-shadow: 0 0 10px rgba(0, 242, 254, 0.2);
        }

        .mobile-label {
          font-weight: 500;
        }

        /* Media Queries */
        @media (max-width: 1024px) {
          .sidebar-nav {
            width: 80px;
            padding: 1.5rem 0.5rem;
            align-items: center;
          }
          .sidebar-brand .brand-text, 
          .sidebar-brand .brand-tagline, 
          .sidebar-stats, 
          .menu-label, 
          .active-dot,
          .sidebar-footer p,
          .sidebar-footer .footer-status span:last-child {
            display: none;
          }
          .sidebar-brand {
            margin-bottom: 3rem;
          }
          .menu-link {
            justify-content: center;
            padding: 0.85rem;
          }
          .sidebar-footer {
            border-top: none;
            padding-top: 0;
          }
        }

        @media (max-width: 640px) {
          .sidebar-nav {
            display: none;
          }
          .mobile-header, .mobile-nav {
            display: flex;
          }
        }
      `}</style>
    </>
  );
};

export default Navbar;
