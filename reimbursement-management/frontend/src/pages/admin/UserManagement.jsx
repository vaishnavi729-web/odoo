import React, { useState, useEffect } from 'react';
import { usersAPI } from '../../services/api';
import { getInitials, getAvatarColor, formatDate } from '../../utils/helpers';
import { UserPlus, Edit2, Trash2, Search, X, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import { EXPENSE_CATEGORIES } from '../../utils/constants';

const ROLES = ['employee', 'manager', 'director', 'admin'];
const DEPARTMENTS = ['Engineering', 'Finance', 'Marketing', 'HR', 'Sales', 'Operations', 'Legal', 'Other'];

function UserModal({ user, managers, onClose, onSave }) {
  const isEdit = !!user?.id;
  const [form, setForm] = useState(user || { email: '', password: '', full_name: '', role: 'employee', manager_id: '', department: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = { ...form, manager_id: form.manager_id ? Number(form.manager_id) : null };
      if (isEdit) {
        const { email, password, ...rest } = payload;
        await usersAPI.update(user.id, rest);
      } else {
        await usersAPI.create(payload);
      }
      toast.success(isEdit ? 'User updated!' : 'User created!');
      onSave();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to save user');
    }
    setLoading(false);
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-box" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2 style={{ fontWeight: 700, fontSize: '1.125rem' }}>{isEdit ? 'Edit User' : 'Add New User'}</h2>
          <button className="btn-icon" onClick={onClose}><X size={16} /></button>
        </div>
        <form onSubmit={handleSubmit} style={{ padding: '1.5rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group" style={{ gridColumn: 'span 2' }}>
              <label className="form-label">Full Name *</label>
              <input className="form-input" required placeholder="Jane Smith"
                value={form.full_name} onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))} />
            </div>
            {!isEdit && (
              <>
                <div className="form-group">
                  <label className="form-label">Email *</label>
                  <input type="email" className="form-input" required placeholder="jane@company.com"
                    value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Password *</label>
                  <input type="password" className="form-input" required minLength={6} placeholder="••••••••"
                    value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} />
                </div>
              </>
            )}
            <div className="form-group">
              <label className="form-label">Role *</label>
              <select className="form-input" value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))}>
                {ROLES.map(r => <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Department</label>
              <select className="form-input" value={form.department || ''} onChange={e => setForm(f => ({ ...f, department: e.target.value }))}>
                <option value="">None</option>
                {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div className="form-group" style={{ gridColumn: 'span 2' }}>
              <label className="form-label">Reports To (Manager)</label>
              <select className="form-input" value={form.manager_id || ''} onChange={e => setForm(f => ({ ...f, manager_id: e.target.value }))}>
                <option value="">None</option>
                {managers.map(m => <option key={m.id} value={m.id}>{m.full_name} ({m.role})</option>)}
              </select>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', paddingTop: '0.5rem' }}>
            <button type="button" className="btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={loading}>
              <Check size={15} /> {loading ? 'Saving…' : 'Save User'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [modal, setModal] = useState(null); // null | 'create' | user object

  const load = () => {
    setLoading(true);
    usersAPI.list().then(r => setUsers(r.data)).finally(() => setLoading(false));
  };
  useEffect(load, []);

  const managers = users.filter(u => u.role === 'manager' || u.role === 'director' || u.role === 'admin');
  const filtered = users.filter(u => {
    const q = search.toLowerCase();
    return (
      (!q || u.full_name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)) &&
      (!roleFilter || u.role === roleFilter)
    );
  });

  const handleDelete = async (u) => {
    if (!confirm(`Delete ${u.full_name}?`)) return;
    try {
      await usersAPI.delete(u.id);
      toast.success('User deleted');
      load();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to delete');
    }
  };

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800 }}>User Management</h1>
          <p style={{ color: 'var(--text-muted)', marginTop: '0.25rem', fontSize: '0.875rem' }}>
            {users.length} team members
          </p>
        </div>
        <button className="btn-primary" onClick={() => setModal('create')}>
          <UserPlus size={16} /> Add User
        </button>
      </div>

      {/* Filters */}
      <div className="glass-card" style={{ padding: '1rem 1.25rem', marginBottom: '1.5rem', display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
          <Search size={15} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input className="form-input" style={{ paddingLeft: '2rem' }} placeholder="Search users…"
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="form-input" style={{ width: 150 }} value={roleFilter} onChange={e => setRoleFilter(e.target.value)}>
          <option value="">All Roles</option>
          <option value="admin">Admin</option>
          <option value="director">Director</option>
          <option value="manager">Manager</option>
          <option value="employee">Employee</option>
        </select>
      </div>

      {/* Table */}
      <div className="glass-card" style={{ overflow: 'hidden' }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>User</th><th>Email</th><th>Role</th><th>Department</th>
              <th>Manager</th><th>Joined</th><th>Status</th><th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array(4).fill(0).map((_, i) => (
                <tr key={i}>
                  {Array(8).fill(0).map((_, j) => (
                    <td key={j}><div className="skeleton" style={{ height: 20 }} /></td>
                  ))}
                </tr>
              ))
            ) : filtered.length ? filtered.map(u => {
              const color = getAvatarColor(u.full_name);
              const manager = users.find(m => m.id === u.manager_id);
              return (
                <tr key={u.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                      <div style={{
                        width: 34, height: 34, borderRadius: 8, background: color,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '0.75rem', fontWeight: 700, color: 'white', flexShrink: 0,
                      }}>
                        {getInitials(u.full_name)}
                      </div>
                      <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>{u.full_name}</span>
                    </div>
                  </td>
                  <td style={{ color: 'var(--text-muted)', fontSize: '0.8125rem' }}>{u.email}</td>
                  <td><span className={`badge badge-${u.role}`}>{u.role}</span></td>
                  <td style={{ color: 'var(--text-secondary)', fontSize: '0.8125rem' }}>{u.department || '—'}</td>
                  <td style={{ color: 'var(--text-secondary)', fontSize: '0.8125rem' }}>{manager?.full_name || '—'}</td>
                  <td style={{ color: 'var(--text-muted)', fontSize: '0.8125rem' }}>{formatDate(u.created_at)}</td>
                  <td>
                    <span style={{
                      fontSize: '0.6875rem', fontWeight: 600, padding: '0.2rem 0.5rem', borderRadius: 6,
                      background: u.is_active ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
                      color: u.is_active ? '#10b981' : '#ef4444',
                    }}>
                      {u.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.375rem' }}>
                      <button className="btn-icon" onClick={() => setModal(u)} title="Edit"><Edit2 size={14} /></button>
                      <button className="btn-icon" onClick={() => handleDelete(u)} title="Delete"
                        style={{ '--hover-bg': 'var(--danger)' }}><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              );
            }) : (
              <tr><td colSpan={8} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>No users found</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {modal && (
        <UserModal
          user={modal === 'create' ? null : modal}
          managers={managers}
          onClose={() => setModal(null)}
          onSave={() => { setModal(null); load(); }}
        />
      )}
    </div>
  );
}
