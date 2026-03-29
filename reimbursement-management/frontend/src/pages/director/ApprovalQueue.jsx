import React, { useState, useEffect } from 'react';
import { expensesAPI } from '../../services/api';
import ExpenseCard from '../../components/ExpenseCard';
import { useAuth } from '../../context/AuthContext';
import ApprovalTimeline from '../../components/ApprovalTimeline';
import { Check, X, FileText, Download } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ApprovalQueue() {
  const { user } = useAuth();
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [comments, setComments] = useState('');

  const load = () => {
    setLoading(true);
    expensesAPI.list({ status: 'pending' })
      .then(res => {
        // Find expenses where current pending step belongs to this user
        const queue = res.data.filter(e => {
          const pending = e.approval_steps.filter(s => s.status === 'pending');
          if (!pending.length) return false;
          const currentStep = pending.reduce((min, s) => s.step_order < min.step_order ? s : min, pending[0]);
          if (currentStep.approver_id === user.id) return true;
          if (!currentStep.approver_id && currentStep.approver_role === 'director' && e.submitted_by.director_id === user.id) return true;
          if (!currentStep.approver_id && currentStep.approver_role === 'admin' && user.role === 'admin') return true;
          return false;
        });
        setExpenses(queue);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleAction = async (action) => {
    try {
      await expensesAPI.action(selected.id, { action, comments });
      toast.success(`Expense ${action}d`);
      setSelected(null);
      setComments('');
      load();
    } catch (err) {
      toast.error(err.response?.data?.detail || `Failed to ${action} expense`);
    }
  };

  return (
    <div className="animate-fade-in" style={{ display: 'grid', gridTemplateColumns: 'minmax(350px, 450px) 1fr', gap: '2rem', height: '100%', alignItems: 'flex-start' }}>
      
      {/* List */}
      <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 4rem)' }}>
        <div style={{ marginBottom: '1.5rem' }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Approval Queue</h1>
          <p style={{ color: 'var(--text-muted)' }}>{expenses.length} expenses pending your review</p>
        </div>
        
        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem', paddingRight: '1rem' }}>
          {loading ? (
             Array(4).fill(0).map((_, i) => <div key={i} className="skeleton" style={{ height: 120, borderRadius: 12 }} />)
          ) : expenses.length ? (
            expenses.map(ex => (
              <div key={ex.id} onClick={() => setSelected(ex)} style={{ transition: 'transform 0.2s', transform: selected?.id === ex.id ? 'scale(1.02)' : 'scale(1)' }}>
                <ExpenseCard expense={ex} compact />
              </div>
            ))
          ) : (
             <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)', background: 'var(--bg-card)', borderRadius: 16 }}>
               <Check size={40} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
               <p>Queue is empty</p>
             </div>
          )}
        </div>
      </div>

      {/* Details Panel */}
      {selected ? (
        <div className="glass-card animate-slide-up" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', maxHeight: 'calc(100vh - 4rem)', overflowY: 'auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.25rem' }}>{selected.title}</h2>
              <div style={{ color: 'var(--text-secondary)' }}>Paid by (Employee): <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{selected.submitted_by.full_name}</span></div>
            </div>
            <button className="btn-icon" onClick={() => setSelected(null)}><X size={16} /></button>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem', background: 'var(--bg-dark)', padding: '1.5rem', borderRadius: 12 }}>
            <div>
              <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Original Amount</div>
              <div style={{ fontSize: '1.125rem', fontWeight: 700 }}>${selected.amount.toLocaleString()} {selected.currency_code}</div>
            </div>
            {selected.converted_amount && selected.currency_code !== selected.company_currency_code && (
              <div>
                <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Converted</div>
                <div style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--primary)' }}>${selected.converted_amount.toLocaleString()} {selected.company_currency_code}</div>
              </div>
            )}
            <div>
              <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Category</div>
              <div style={{ fontSize: '0.875rem' }}>{selected.category}</div>
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Date</div>
              <div style={{ fontSize: '0.875rem' }}>{selected.expense_date.split('T')[0]}</div>
            </div>
          </div>

          {selected.description && (
            <div style={{ marginBottom: '2rem' }}>
              <div style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem' }}>Description</div>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{selected.description}</p>
            </div>
          )}

          {selected.receipt_url && (
            <div style={{ marginBottom: '2rem' }}>
              <div style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.75rem' }}>Receipt</div>
              <a href={`http://localhost:8000${selected.receipt_url}`} target="_blank" rel="noreferrer"
                style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1rem', background: 'var(--bg-dark)', borderRadius: 10, textDecoration: 'none', color: 'var(--text-primary)' }}>
                <FileText size={20} color="var(--primary)" />
                <span style={{ flex: 1, fontSize: '0.875rem' }}>View Receipt Document</span>
                <Download size={16} />
              </a>
            </div>
          )}
          
          <div style={{ marginBottom: '2rem' }}>
            <div style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '1rem' }}>Approval Workflow</div>
            <ApprovalTimeline steps={selected.approval_steps} />
          </div>

          <div className="divider" style={{ margin: '1rem 0 1.5rem' }} />

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Add Remark / Comments (Optional)</label>
              <textarea className="form-input" rows={3} placeholder="Reason for approval/rejection..."
                value={comments} onChange={(e) => setComments(e.target.value)} />
            </div>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button className="btn-success" style={{ flex: 1, padding: '0.875rem', fontSize: '0.9375rem', justifyContent: 'center' }} onClick={() => handleAction('approve')}>
                <Check size={18} /> Approve
              </button>
              <button className="btn-danger" style={{ flex: 1, padding: '0.875rem', fontSize: '0.9375rem', justifyContent: 'center' }} onClick={() => handleAction('reject')}>
                <X size={18} /> Reject
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', background: 'var(--bg-card)', borderRadius: 16, border: '1px dashed var(--border)' }}>
          <p style={{ color: 'var(--text-muted)' }}>Select an expense to review</p>
        </div>
      )}

    </div>
  );
}
