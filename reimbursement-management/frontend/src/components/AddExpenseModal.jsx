import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { expensesAPI, ocrAPI, fetchCountries } from '../services/api';
import { EXPENSE_CATEGORIES } from '../utils/constants';
import { Plus, UploadCloud, X, Check, Save, Layers, Loader2, FileText } from 'lucide-react';
import toast from 'react-hot-toast';
import { useDropzone } from 'react-dropzone';

export default function AddExpenseModal({ onClose, onSave, companyCurrency }) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [ocrLoading, setOcrLoading] = useState(false);
  const [countries, setCountries] = useState([]);
  const [form, setForm] = useState({
    title: '', amount: '', currency_code: companyCurrency || 'USD',
    category: EXPENSE_CATEGORIES[0], expense_date: new Date().toISOString().split('T')[0],
    merchant_name: '', description: '', receipt: null,
  });

  useEffect(() => {
    fetchCountries().then(res => {
      const sorted = res.data.map(c => {
        const currencies = c.currencies ? Object.entries(c.currencies) : [];
        const [code] = currencies[0] || ['USD'];
        return { name: c.name.common, code };
      }).sort((a, b) => a.name.localeCompare(b.name));
      setCountries(sorted);
    }).catch(() => {});
  }, []);

  const onDrop = useCallback(async (acceptedFiles) => {
    const file = acceptedFiles[0];
    if (!file) return;

    setForm(f => ({ ...f, receipt: file }));
    setOcrLoading(true);

    const formData = new FormData();
    formData.append('file', file);
    
    try {
      const res = await ocrAPI.extract(formData);
      if (res.data.success && res.data.data) {
        const { amount, merchant_name, description } = res.data.data;
        let date = form.expense_date;
        
        try { if(res.data.data.date) date = new Date(res.data.data.date).toISOString().split('T')[0]; } catch {}

        setForm(f => ({
          ...f,
          amount: amount || f.amount,
          merchant_name: merchant_name || f.merchant_name,
          title: merchant_name ? `Expense at ${merchant_name}` : f.title,
          description: description || f.description,
          expense_date: date,
        }));
        toast.success('Receipt details extracted!');
      } else if (res.data.message) {
        toast.error(res.data.message);
      }
    } catch {
      toast.error('Failed to parse receipt text');
    }
    setOcrLoading(false);
  }, [form.expense_date]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, accept: {'image/*': ['.jpeg', '.png', '.jpg']} });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.receipt) return toast.error('Please upload a receipt file');
    setLoading(true);

    const formData = new FormData();
    for (const key in form) formData.append(key, form[key]);

    try {
      await expensesAPI.create(formData);
      toast.success('Expense submitted successfully');
      onSave();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to submit expense');
    }
    setLoading(false);
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-box" style={{ maxWidth: 650 }}>
        <div className="modal-header">
          <h2 style={{ fontWeight: 700, fontSize: '1.25rem' }}>Submit New Expense</h2>
          <button className="btn-icon" onClick={onClose} disabled={loading}><X size={16} /></button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)' }}>
          <div style={{ padding: '1.5rem', borderRight: '1px solid var(--border)' }}>
            <h3 style={{ fontSize: '0.9375rem', fontWeight: 600, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
              <Layers size={16} color="var(--primary)" /> 1. Upload Receipt
            </h3>
            
            <div {...getRootProps()} className={`upload-zone ${isDragActive ? 'drag-over' : ''}`} style={{ marginBottom: '1rem' }}>
              <input {...getInputProps()} />
              {ocrLoading ? (
                <div style={{ padding: '1.5rem 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
                  <Loader2 size={32} color="var(--primary)" className="animate-spin" style={{ animation: 'spin 1s linear infinite' }} />
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Scanning receipt with AI...</p>
                </div>
              ) : form.receipt ? (
                <div style={{ padding: '1rem 0' }}>
                  <Check size={32} color="var(--success)" style={{ margin: '0 auto 0.5rem' }} />
                  <p style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-primary)', wordBreak: 'break-all' }}>{form.receipt.name}</p>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Click to change file</p>
                </div>
              ) : (
                <div style={{ padding: '1rem 0' }}>
                  <UploadCloud size={32} style={{ margin: '0 auto 0.5rem', color: 'var(--text-secondary)' }} />
                  <p style={{ fontWeight: 500, fontSize: '0.875rem' }}>Drag & drop image here</p>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>or click to browse</p>
                </div>
              )}
            </div>

            <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              <strong>AI Auto-fill:</strong> Upload your receipt first and our system will automatically extract the amount, date, and merchant details for you.
            </div>
          </div>

          <form onSubmit={handleSubmit} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', maxHeight: '600px', overflowY: 'auto' }}>
            <h3 style={{ fontSize: '0.9375rem', fontWeight: 600, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
              <FileText size={16} color="var(--warning)" /> 2. Verify Details
            </h3>

            <div style={{ flex: 1, overflowY: 'auto', paddingRight: '0.5rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Merchant / Title</label>
                  <input className="form-input" required placeholder="Dinner at Joe's"
                    value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value, merchant_name: f.merchant_name || e.target.value }))} />
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Paid By (Employee)</label>
                  <input className="form-input" disabled value={user.full_name} style={{ background: 'var(--bg-dark)', cursor: 'not-allowed' }} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.5fr) minmax(0, 1fr)', gap: '0.75rem', marginBottom: '1rem' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Total Amount</label>
                  <input type="number" step="0.01" className="form-input" required placeholder="100.00"
                    value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} />
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Currency Type</label>
                  <select className="form-input" required value={form.currency_code} onChange={e => setForm(f => ({ ...f, currency_code: e.target.value }))}>
                    <option value={form.currency_code}>{form.currency_code}</option>
                    <hr />
                    {Array.from(new Set(countries.map(c => c.code))).filter(Boolean).sort().map(code => (
                      <option key={code} value={code}>{code}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Expense Date</label>
                  <input type="date" className="form-input" required max={new Date().toISOString().split('T')[0]}
                    value={form.expense_date} onChange={e => setForm(f => ({ ...f, expense_date: e.target.value }))} />
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Category</label>
                  <select className="form-input" required value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
                    {EXPENSE_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Description (Optional)</label>
                <textarea className="form-input" rows={2} placeholder="Add any details..."
                  value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', paddingTop: '1.5rem', borderTop: '1px solid var(--border)', marginTop: '0.5rem' }}>
              <button type="button" className="btn-ghost" onClick={onClose}>Cancel</button>
              <button type="submit" className="btn-primary" disabled={loading || ocrLoading}>
                <Save size={15} /> {loading ? 'Submitting...' : 'Submit Expense'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
