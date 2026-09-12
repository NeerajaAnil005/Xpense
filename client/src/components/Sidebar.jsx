import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  ArrowRightLeft, 
  PieChart, 
  BarChart3, 
  Sparkles, 
  Bell, 
  Settings, 
  LogOut,
  X
} from 'lucide-react';

export default function Sidebar({ mobileOpen, closeMobileSidebar }) {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Transactions', path: '/transactions', icon: ArrowRightLeft },
    { label: 'Budgets', path: '/budgets', icon: PieChart },
    { label: 'Reports', path: '/reports', icon: BarChart3 },
    { label: 'AI Insights', path: '/ai-insights', icon: Sparkles, badge: 'AI' },
    { label: 'Notifications', path: '/notifications', icon: Bell },
    { label: 'Settings', path: '/settings', icon: Settings }
  ];

  const sidebarStyle = {
    width: '260px',
    backgroundColor: 'var(--bg-card)',
    borderRight: '1px solid var(--border-color)',
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    position: 'sticky',
    top: 0,
    zIndex: 50,
    transition: 'transform 0.3s ease'
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
      {/* Backdrop overlay for mobile drawer */}
      {mobileOpen && (
        <div 
          onClick={closeMobileSidebar}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            zIndex: 45
          }}
        />
      )}

      <aside className={`sidebar ${mobileOpen ? 'open' : ''}`} style={{
        ...sidebarStyle,
        position: mobileOpen ? 'fixed' : 'sticky',
        transform: mobileOpen ? 'translateX(0)' : undefined
      }}>
        {/* Sidebar Header */}
        <div style={{
          height: '4rem',
          padding: '0 1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid var(--border-color)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', fontWeight: 800, fontSize: '1.25rem' }}>
            <div style={{
              width: '2.25rem',
              height: '2.25rem',
              borderRadius: '0.5rem',
              background: 'linear-gradient(135deg, var(--primary), var(--ai-purple))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontWeight: 800
            }}>
              X
            </div>
            <span>Xpense<span style={{ color: 'var(--ai-purple)' }}>AI</span></span>
          </div>

          {mobileOpen && (
            <button
              onClick={closeMobileSidebar}
              className="btn btn-secondary btn-sm"
              style={{ padding: '0.25rem' }}
            >
              <X size={18} />
            </button>
          )}
        </div>

        {/* Navigation Links */}
        <nav style={{ flex: 1, padding: '1rem 0.75rem', overflowY: 'auto' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            {navItems.map(item => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={closeMobileSidebar}
                  style={({ isActive }) => ({
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.75rem 1rem',
                    borderRadius: 'var(--radius-md)',
                    fontWeight: isActive ? 700 : 500,
                    fontSize: '0.9375rem',
                    color: isActive ? 'var(--primary)' : 'var(--text-secondary)',
                    backgroundColor: isActive ? 'var(--primary-light)' : 'transparent',
                    transition: 'var(--transition)'
                  })}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <Icon size={18} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="badge badge-ai" style={{ fontSize: '0.65rem', padding: '0.125rem 0.375rem' }}>
                      {item.badge}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </div>
        </nav>

        {/* Sidebar Footer / Logout */}
        <div style={{ padding: '1rem 0.75rem', borderTop: '1px solid var(--border-color)' }}>
          <button
            onClick={handleLogout}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '0.75rem 1rem',
              borderRadius: 'var(--radius-md)',
              fontWeight: 600,
              fontSize: '0.9375rem',
              color: 'var(--expense-red)',
              backgroundColor: 'transparent',
              border: 'none',
              cursor: 'pointer',
              transition: 'var(--transition)'
            }}
          >
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}
