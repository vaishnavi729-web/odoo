import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { expensesAPI, companyAPI } from '../../services/api';
import ExpenseCard from '../../components/ExpenseCard';
import { Plus, X, FileText } from 'lucide-react';
import toast from 'react-hot-toast';
import AddExpenseModal from '../../components/AddExpenseModal';
import { useLocation } from 'react-router-dom';

export default function MyExpenses() {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [companyCur, setCompanyCur] = useState('USD');
  const location = useLocation();

  useEffect(() => {
    if (location.state?.openNew) {
      setModal(true);
      window.history.replaceState({}, '');
    }
  }, [location.state]);

  const load = () => {
    setLoading(true);
    expensesAPI.list()
      .then(res => setExpenses(res.data))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
    companyAPI.get().then(r => setCompanyCur(r.data.currency_code)).catch(() => { });
  }, []);

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this pending expense?')) return;
    try {
      await expensesAPI.delete(id);
      toast.success('Expense deleted');
      load();
    } catch {
      toast.error('Could not delete expense');
    }
  };

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800 }}>My Expenses</h1>
          <p style={{ color: 'var(--text-muted)' }}>Manage your submitted reports</p>
        </div>
        <button className="btn-primary" onClick={() => setModal(true)}>
          <Plus size={16} /> New Expense
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1.5rem' }}>
        {loading ? (
          Array(4).fill(0).map((_, i) => <div key={i} className="skeleton" style={{ height: 160, borderRadius: 16 }} />)
        ) : expenses.length ? (
          expenses.map(ex => (
            <div key={ex.id} style={{ position: 'relative' }}>
              <ExpenseCard expense={ex} />
              {ex.status === 'pending' && (
                <button className="btn-icon" onClick={(e) => handleDelete(ex.id, e)}
                  style={{ position: 'absolute', top: '1.25rem', right: '1.25rem', background: 'var(--bg-dark)', width: 28, height: 28 }}>
                  <X size={14} color="var(--danger)" />
                </button>
              )}
            </div>
          ))
        ) : (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '4rem 2rem', background: 'var(--bg-card)', borderRadius: 16, border: '1px dashed var(--border)' }}>
            <FileText size={40} style={{ margin: '0 auto 1rem', opacity: 0.3 }} />
            <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>No expenses submitted</h3>
            <p style={{ color: 'var(--text-muted)' }}>Click the button above to submit your first expense.</p>
          </div>
        )}
      </div>

      {modal && (
        <AddExpenseModal onClose={() => setModal(false)} onSave={() => { setModal(false); load(); }} companyCurrency={companyCur} />
      )}
    </div>
  );
}
