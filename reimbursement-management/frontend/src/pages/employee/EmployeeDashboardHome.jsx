import React, { useEffect, useState } from 'react';
import { expensesAPI, fetchExchangeRates } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { formatCurrency, formatDate } from '../../utils/helpers';
import { Wallet, Clock, CheckCircle, Plus, FileText, UploadCloud, RefreshCw } from 'lucide-react';
import ExpenseCard from '../../components/ExpenseCard';
import AddExpenseModal from '../../components/AddExpenseModal';
import { Link } from 'react-router-dom';
import { companyAPI } from '../../services/api';

export default function EmployeeDashboardHome() {
  const { user } = useAuth();
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [companyCur, setCompanyCur] = useState('USD');

  const load = () => {
    expensesAPI.list()
      .then(res => setExpenses(res.data))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
    companyAPI.get().then(r => setCompanyCur(r.data.currency_code)).catch(() => {});
  }, []);

  const stats = {
    totalApproved: expenses.filter(e => e.status === 'approved').reduce((s, e) => s + (e.converted_amount || e.amount), 0),
    pendingItems: expenses.filter(e => ['pending', 'in_review'].includes(e.status)).length,
    totalItems: expenses.length,
  };

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.625rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            Welcome back, {user.full_name.split(' ')[0]}
          </h1>
          <p style={{ color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            Track your expenses and reimbursements
          </p>
        </div>
        <button onClick={() => setModal(true)} className="btn-primary" style={{ textDecoration: 'none' }}>
          <Plus size={16} /> New Expense
        </button>
      </div>

      {/* Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        <div className="stat-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Reimbursed YTD</div>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: `rgba(16, 185, 129, 0.15)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Wallet size={18} color="#10b981" />
            </div>
          </div>
          <div style={{ fontSize: '1.875rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            ${Math.round(stats.totalApproved).toLocaleString()}
          </div>
          <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>total approved amount</div>
        </div>

        <div className="stat-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Pending Items</div>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: `rgba(245, 158, 11, 0.15)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Clock size={18} color="#f59e0b" />
            </div>
          </div>
          <div style={{ fontSize: '1.875rem', fontWeight: 800, color: 'var(--text-primary)' }}>{stats.pendingItems}</div>
          <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>awaiting approval</div>
        </div>

        <div className="stat-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Total Expenses</div>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: `rgba(99, 102, 241, 0.15)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FileText size={18} color="#6366f1" />
            </div>
          </div>
          <div style={{ fontSize: '1.875rem', fontWeight: 800, color: 'var(--text-primary)' }}>{stats.totalItems}</div>
          <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>submitted all-time</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) minmax(0, 1fr)', gap: '1.5rem' }}>
        {/* Recent */}
        <div className="glass-card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <h3 style={{ fontWeight: 700, fontSize: '1.0625rem' }}>Recent Expenses</h3>
            <Link to="/employee/expenses" style={{ fontSize: '0.8125rem', color: 'var(--primary)', fontWeight: 600, textDecoration: 'none' }}>
              View All →
            </Link>
          </div>
          
          {loading ? (
             Array(3).fill(0).map((_, i) => <div key={i} className="skeleton" style={{ height: 60, marginBottom: 8, borderRadius: 10 }} />)
          ) : expenses.length ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {expenses.slice(0, 5).map(ex => (
                <ExpenseCard key={ex.id} expense={ex} compact />
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)', background: 'var(--bg-card2)', borderRadius: 12 }}>
              <FileText size={32} style={{ margin: '0 auto 0.5rem', opacity: 0.5 }} />
              <p>You haven't submitted any expenses yet</p>
              <button onClick={() => setModal(true)} className="btn-primary" style={{ marginTop: '1rem' }}>
                Create First Expense
              </button>
            </div>
          )}
        </div>

        {/* Quick Actions / Info */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="glass-card" style={{ padding: '1.5rem', background: 'radial-gradient(circle at top right, rgba(99,102,241,0.1), transparent 70%), var(--bg-card)' }}>
            <h3 style={{ fontWeight: 700, fontSize: '1.0625rem', marginBottom: '0.75rem' }}>Quick Tip</h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '1rem' }}>
              Upload your receipt securely and our OCR AI will automatically extract the amount, date, and merchant information for you.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary)', fontWeight: 600, fontSize: '0.8125rem' }}>
              <UploadCloud size={16} /> Auto-fill with AI
            </div>
          </div>
          
          <div className="glass-card" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontWeight: 700, fontSize: '1.0625rem', marginBottom: '0.75rem' }}>Exchange Rates</h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '1rem' }}>
              Traveling abroad? Submit your expenses in the local currency. We'll automatically convert it to your company's base currency using live rates.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary)', fontWeight: 600, fontSize: '0.8125rem' }}>
              <RefreshCw size={16} /> Live Conversion
            </div>
          </div>
        </div>
      </div>

      {modal && (
        <AddExpenseModal onClose={() => setModal(false)} onSave={() => { setModal(false); load(); }} companyCurrency={companyCur} />
      )}
    </div>
  );
}
