import React, { useState, useEffect } from 'react';
import { expensesAPI, usersAPI } from '../../services/api';
import ExpenseCard from '../../components/ExpenseCard';
import { useAuth } from '../../context/AuthContext';
import { Search, Filter, Calendar } from 'lucide-react';
import { STATUS_LABELS } from '../../utils/constants';

export default function TeamExpenses() {
  const { user } = useAuth();
  const [expenses, setExpenses] = useState([]);
  const [team, setTeam] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [statusFilter, setStatusFilter] = useState('');
  const [employeeFilter, setEmployeeFilter] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    setLoading(true);
    Promise.all([
      expensesAPI.list({ status: statusFilter }),
      usersAPI.list()
    ]).then(([eRes, uRes]) => {
      const teamMates = uRes.data.filter(u => u.director_id === user.id);
      setTeam(teamMates);
      // Filter expenses belonging to team members
      setExpenses(eRes.data.filter(e => teamMates.some(t => t.id === e.submitted_by_id)));
    }).finally(() => setLoading(false));
  }, [statusFilter]);

  const filtered = expenses.filter(e => {
    if (employeeFilter && e.submitted_by_id.toString() !== employeeFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return e.title.toLowerCase().includes(q) || e.merchant_name?.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="animate-fade-in">
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Team Expenses</h1>
        <p style={{ color: 'var(--text-muted)' }}>View and track spending across your direct reports</p>
      </div>

      <div className="glass-card" style={{ padding: '1rem 1.25rem', display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
          <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input className="form-input" style={{ paddingLeft: '2.25rem' }} placeholder="Search expense title or merchant…"
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        
        <select className="form-input" style={{ width: 150 }} value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          <option value="">All Statuses</option>
          {Object.entries(STATUS_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>

        <select className="form-input" style={{ width: 180 }} value={employeeFilter} onChange={e => setEmployeeFilter(e.target.value)}>
          <option value="">All Team Members</option>
          {team.map(t => <option key={t.id} value={t.id}>{t.full_name}</option>)}
        </select>
      </div>

      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1rem' }}>
          {Array(4).fill(0).map((_, i) => <div key={i} className="skeleton" style={{ height: 160, borderRadius: 16 }} />)}
        </div>
      ) : filtered.length ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1.5rem' }}>
          {filtered.map(ex => (
            <ExpenseCard key={ex.id} expense={ex} />
          ))}
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '4rem 2rem', background: 'var(--bg-card)', borderRadius: 16, border: '1px dashed var(--border)' }}>
          <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>No team expenses found</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Try adjusting your search criteria</p>
        </div>
      )}
    </div>
  );
}
