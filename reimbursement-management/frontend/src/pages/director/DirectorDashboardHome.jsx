import React, { useEffect, useState } from 'react';
import { expensesAPI, usersAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { formatCurrency, formatDate } from '../../utils/helpers';
import { Receipt, CheckSquare, Clock, Users, ArrowRight } from 'lucide-react';
import StatusBadge from '../../components/StatusBadge';
import ExpenseCard from '../../components/ExpenseCard';
import { Link } from 'react-router-dom';

export default function directorDashboardHome() {
  const { user } = useAuth();
  const [expenses, setExpenses] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([expensesAPI.list(), usersAPI.list()])
      .then(([expRes, usRes]) => {
        setExpenses(expRes.data);
        setUsers(usRes.data.filter(u => u.director_id === user.id));
      })
      .finally(() => setLoading(false));
  }, []);

  const pendingApprovals = expenses.filter(e => 
    e.status === 'pending' && 
    e.approval_steps.some(s => s.status === 'pending' && (s.approver_id === user.id || (!s.approver_id && s.approver_role === 'director')))
  );

  const teamExpenses = expenses.filter(e => e.submitted_by_id !== user.id);

  return (
    <div className="animate-fade-in">
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.625rem', fontWeight: 800, color: 'var(--text-primary)' }}>
          Welcome back, {user.full_name.split(' ')[0]}
        </h1>
        <p style={{ color: 'var(--text-muted)', marginTop: '0.25rem' }}>
          Here's what's happening with your team.
        </p>
      </div>

      {/* Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        <div className="stat-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Action Required</div>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: `rgba(245, 158, 11, 0.15)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CheckSquare size={18} color="#f59e0b" />
            </div>
          </div>
          <div style={{ fontSize: '1.875rem', fontWeight: 800, color: 'var(--text-primary)' }}>{pendingApprovals.length}</div>
          <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>waiting for your approval</div>
        </div>
        
        <div className="stat-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Team Members</div>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: `rgba(99, 102, 241, 0.15)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Users size={18} color="#6366f1" />
            </div>
          </div>
          <div style={{ fontSize: '1.875rem', fontWeight: 800, color: 'var(--text-primary)' }}>{users.length}</div>
          <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>direct reports</div>
        </div>
        
        <div className="stat-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Team Spend</div>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: `rgba(16, 185, 129, 0.15)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Receipt size={18} color="#10b981" />
            </div>
          </div>
          <div style={{ fontSize: '1.875rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            ${Math.round(teamExpenses.filter(e => e.status === 'approved').reduce((s, e) => s + (e.converted_amount || e.amount), 0)).toLocaleString()}
          </div>
          <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>total approved this month</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) minmax(0, 1fr)', gap: '1.5rem' }}>
        <div className="glass-card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <h3 style={{ fontWeight: 700, fontSize: '1.0625rem' }}>Pending Approvals</h3>
            <Link to="/director/approvals" style={{ fontSize: '0.8125rem', color: 'var(--primary)', fontWeight: 600, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              View All <ArrowRight size={14} />
            </Link>
          </div>
          
          {loading ? (
             Array(3).fill(0).map((_, i) => <div key={i} className="skeleton" style={{ height: 60, marginBottom: 8, borderRadius: 10 }} />)
          ) : pendingApprovals.length ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {pendingApprovals.slice(0, 4).map(ex => (
                <ExpenseCard key={ex.id} expense={ex} compact />
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)', background: 'var(--bg-card2)', borderRadius: 12 }}>
              <CheckSquare size={32} style={{ margin: '0 auto 0.5rem', opacity: 0.5 }} />
              <p>You're all caught up!</p>
            </div>
          )}
        </div>
        
        <div className="glass-card" style={{ padding: '1.5rem', maxHeight: 400, overflow: 'auto' }}>
          <h3 style={{ fontWeight: 700, fontSize: '1.0625rem', marginBottom: '1.25rem' }}>Team Recent Activity</h3>
          {loading ? (
              <div className="skeleton" style={{ height: 200, borderRadius: 10 }} />
          ) : teamExpenses.length ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
               {teamExpenses.slice(0, 6).map(ex => (
                 <div key={ex.id} style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                   <div style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--border)', marginTop: 6 }} />
                   <div>
                     <div style={{ fontSize: '0.875rem', fontWeight: 500 }}>{ex.title} <span style={{ color: 'var(--text-muted)' }}>by</span> {ex.submitted_by.full_name}</div>
                     <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.125rem' }}>{formatDate(ex.created_at)}</div>
                   </div>
                 </div>
               ))}
            </div>
          ) : (
            <p style={{ color: 'var(--text-muted)' }}>No team activity yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}
