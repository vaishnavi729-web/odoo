import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Receipt, Users, Settings,
  LogOut, CheckSquare, Shield, ChevronDown,
  Building2, Bell, Zap
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getInitials, getAvatarColor } from '../utils/helpers';

const NAV_ITEMS = {
  admin: [
    { to: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/admin/users', icon: Users, label: 'User Management' },
    { to: '/admin/expenses', icon: Receipt, label: 'All Expenses' },
    { to: '/admin/rules', icon: Zap, label: 'Approval Rules' },
    { to: '/admin/settings', icon: Settings, label: 'Company Settings' },
  ],
  manager: [
    { to: '/manager', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/manager/approvals', icon: CheckSquare, label: 'Approval Queue' },
    { to: '/manager/expenses', icon: Receipt, label: 'Team Expenses' },
  ],
  director: [
    { to: '/director', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/director/approvals', icon: CheckSquare, label: 'Approval Queue' },
    { to: '/director/expenses', icon: Receipt, label: 'Team Expenses' },
  ],
  employee: [
    { to: '/employee', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/employee/expenses', icon: Receipt, label: 'My Expenses' },
  ],
};

export default function Sidebar() {
  const { user, logout, isAdmin, isManager } = useAuth();
  const navigate = useNavigate();

  const role = user?.role || 'employee';
  const navItems = NAV_ITEMS[role] || NAV_ITEMS.employee;

  const avatarColor = getAvatarColor(user?.full_name || '');
  const initials = getInitials(user?.full_name || 'U');

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <aside className="sidebar">
      {/* Logo */}
      <div style={{ padding: '1.5rem 1.25rem 1rem', borderBottom: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            width: 40, height: 40, borderRadius: 12,
            background: 'var(--gradient-primary)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Shield size={20} color="white" />
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.9375rem', color: 'var(--text-primary)' }}>ReimburseIQ</div>
            <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              {role}
            </div>
          </div>
        </div>
      </div>

      {/* Nav Items */}
      <nav style={{ flex: 1, padding: '1rem 0', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/admin' || to === '/manager' || to === '/director' || to === '/employee'}
            className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* User Profile */}
      <div style={{ padding: '1rem', borderTop: '1px solid var(--border)' }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: '0.75rem',
          padding: '0.625rem', borderRadius: 10,
          background: 'var(--bg-card2)', border: '1px solid var(--border)',
          marginBottom: '0.5rem',
        }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: avatarColor,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '0.8125rem', fontWeight: 700, color: 'white',
            flexShrink: 0,
          }}>
            {initials}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 600, fontSize: '0.8125rem', color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user?.full_name}
            </div>
            <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user?.email}
            </div>
          </div>
        </div>
        <button onClick={handleLogout} className="btn-ghost" style={{ width: '100%', justifyContent: 'center' }}>
          <LogOut size={15} /> Sign Out
        </button>
      </div>
    </aside>
  );
}
