import React, { useState, useEffect } from 'react';
import { expensesAPI } from '../../services/api';
import ExpenseCard from '../../components/ExpenseCard';
import { Search, Filter, Download } from 'lucide-react';
import { STATUS_LABELS, EXPENSE_CATEGORIES } from '../../utils/constants';

export default function AllExpenses() {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [category, setCategory] = useState('');

  useEffect(() => {
    setLoading(true);
    expensesAPI.list({ status, category })
      .then(res => setExpenses(res.data))
      .finally(() => setLoading(false));
  }, [status, category]);

  const filtered = expenses.filter(e => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      e.title.toLowerCase().includes(q) ||
      e.submitted_by?.full_name?.toLowerCase().includes(q) ||
      e.merchant_name?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Company Expenses</h1>
          <p style={{ color: 'var(--text-muted)', marginTop: '0.25rem', fontSize: '0.875rem' }}>
            View and manage all organization expenses
          </p>
        </div>
        <button className="btn-ghost" style={{ background: 'var(--bg-card)' }}>
          <Download size={16} /> Export CSV
        </button>
      </div>

      {/* Filters Base */}
      <div className="glass-card" style={{ padding: '1rem 1.25rem', display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
          <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input className="form-input" style={{ paddingLeft: '2.25rem' }} placeholder="Search expenses or employees…"
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
          <Filter size={15} /> Filters
        </div>

        <select className="form-input" style={{ width: 150 }} value={status} onChange={e => setStatus(e.target.value)}>
          <option value="">All Statuses</option>
          {Object.entries(STATUS_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>

        <select className="form-input" style={{ width: 160 }} value={category} onChange={e => setCategory(e.target.value)}>
          <option value="">All Categories</option>
          {EXPENSE_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1rem' }}>
          {Array(6).fill(0).map((_, i) => <div key={i} className="skeleton" style={{ height: 160, borderRadius: 16 }} />)}
        </div>
      ) : filtered.length ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1rem' }}>
          {filtered.map(ex => (
            <ExpenseCard key={ex.id} expense={ex} />
          ))}
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '4rem 2rem', background: 'var(--bg-card)', borderRadius: 16, border: '1px dashed var(--border)' }}>
          <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>No expenses found</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Adjust your filters or try a different search term.</p>
        </div>
      )}
    </div>
  );
}
