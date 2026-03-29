import React, { useEffect, useState } from 'react';
import { expensesAPI, usersAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { formatCurrency } from '../../utils/helpers';
import { Users, Receipt, CheckCircle, Clock, TrendingUp, DollarSign, XCircle, AlertCircle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import StatusBadge from '../../components/StatusBadge';
import { formatDate } from '../../utils/helpers';

const COLORS = ['#f59e0b', '#10b981', '#ef4444', '#6366f1'];

export default function AdminDashboardHome() {
  const { user } = useAuth();
  const [expenses, setExpenses] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([expensesAPI.list(), usersAPI.list()])
      .then(([expRes, userRes]) => {
        setExpenses(expRes.data);
        setUsers(userRes.data);
      })
      .finally(() => setLoading(false));
  }, []);

  const stats = {
    total: expenses.length,
    pending: expenses.filter(e => e.status === 'pending').length,
    approved: expenses.filter(e => e.status === 'approved').length,
    rejected: expenses.filter(e => e.status === 'rejected').length,
    totalAmount: expenses.reduce((s, e) => s + (e.converted_amount || e.amount), 0),
    approvedAmount: expenses.filter(e => e.status === 'approved').reduce((s, e) => s + (e.converted_amount || e.amount), 0),
  };

  const categoryData = Object.entries(
    expenses.reduce((acc, e) => {
      acc[e.category] = (acc[e.category] || 0) + (e.converted_amount || e.amount);
      return acc;
    }, {})
  ).map(([name, value]) => ({ name, value: Math.round(value) }))
   .sort((a, b) => b.value - a.value).slice(0, 6);

  const pieData = [
    { name: 'Pending', value: stats.pending },
    { name: 'Approved', value: stats.approved },
    { name: 'Rejected', value: stats.rejected },
    { name: 'In Review', value: expenses.filter(e => e.status === 'in_review').length },
  ].filter(d => d.value > 0);

  const recent = expenses.slice(0, 5);

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.625rem', fontWeight: 800, color: 'var(--text-primary)' }}>
          Admin Dashboard
        </h1>
        <p style={{ color: 'var(--text-muted)', marginTop: '0.25rem' }}>
          Overview of your reimbursement system
        </p>
      </div>

      {/* Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        {[
          { icon: Receipt, label: 'Total Expenses', value: stats.total, color: '#6366f1' },
          { icon: Clock, label: 'Pending', value: stats.pending, color: '#f59e0b' },
          { icon: CheckCircle, label: 'Approved', value: stats.approved, color: '#10b981' },
          { icon: XCircle, label: 'Rejected', value: stats.rejected, color: '#ef4444' },
          { icon: Users, label: 'Total Users', value: users.length, color: '#8b5cf6' },
          { icon: DollarSign, label: 'Total Submitted', value: `$${Math.round(stats.totalAmount).toLocaleString()}`, color: '#06b6d4' },
        ].map(({ icon: Icon, label, value, color }) => (
          <div key={label} className="stat-card" style={{ cursor: 'default' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</div>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: `${color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon size={18} color={color} />
              </div>
            </div>
            <div style={{ fontSize: '1.875rem', fontWeight: 800, color: 'var(--text-primary)' }}>{value}</div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
        <div className="glass-card" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontWeight: 700, marginBottom: '1.25rem', fontSize: '0.9375rem' }}>Expenses by Category</h3>
          {loading ? (
            <div className="skeleton" style={{ height: 180 }} />
          ) : categoryData.length ? (
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={categoryData} margin={{ left: -20 }}>
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#64748b' }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#64748b' }} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }} />
                <Bar dataKey="value" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ height: 180, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
              No expense data yet
            </div>
          )}
        </div>

        <div className="glass-card" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontWeight: 700, marginBottom: '1.25rem', fontSize: '0.9375rem' }}>Status Distribution</h3>
          {pieData.length ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
              <ResponsiveContainer width={140} height={140}>
                <PieChart>
                  <Pie data={pieData} cx={65} cy={65} innerRadius={45} outerRadius={65} dataKey="value" paddingAngle={3}>
                    {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {pieData.map((d, i) => (
                  <div key={d.name} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8125rem' }}>
                    <div style={{ width: 10, height: 10, borderRadius: 2, background: COLORS[i % COLORS.length] }} />
                    <span style={{ color: 'var(--text-secondary)' }}>{d.name}</span>
                    <span style={{ fontWeight: 700, color: 'var(--text-primary)', marginLeft: 'auto' }}>{d.value}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div style={{ height: 140, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
              No data yet
            </div>
          )}
        </div>
      </div>

      {/* Recent Expenses */}
      <div className="glass-card" style={{ padding: '1.5rem' }}>
        <h3 style={{ fontWeight: 700, marginBottom: '1.25rem', fontSize: '0.9375rem' }}>Recent Expenses</h3>
        {loading ? (
          Array(3).fill(0).map((_, i) => <div key={i} className="skeleton" style={{ height: 48, marginBottom: 8 }} />)
        ) : recent.length ? (
          <table className="data-table">
            <thead>
              <tr>
                <th>Employee</th><th>Title</th><th>Category</th>
                <th>Amount</th><th>Date</th><th>Status</th>
              </tr>
            </thead>
            <tbody>
              {recent.map(e => (
                <tr key={e.id}>
                  <td style={{ fontWeight: 500 }}>{e.submitted_by?.full_name || '—'}</td>
                  <td style={{ color: 'var(--text-secondary)' }}>{e.title}</td>
                  <td><span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{e.category}</span></td>
                  <td style={{ fontWeight: 600 }}>{formatCurrency(e.amount, e.currency_code)}</td>
                  <td style={{ color: 'var(--text-muted)', fontSize: '0.8125rem' }}>{formatDate(e.expense_date)}</td>
                  <td><StatusBadge status={e.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
            <Receipt size={40} style={{ margin: '0 auto 0.75rem', opacity: 0.3 }} />
            <p>No expenses submitted yet</p>
          </div>
        )}
      </div>
    </div>
  );
}
