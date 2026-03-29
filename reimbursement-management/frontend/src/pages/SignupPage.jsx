import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Shield, Mail, Lock, User, Building2, Globe, AlertCircle, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { fetchCountries } from '../services/api';
import toast from 'react-hot-toast';

export default function SignupPage() {
  const [step, setStep] = useState(1);
  const [countries, setCountries] = useState([]);
  const [form, setForm] = useState({
    email: '', password: '', full_name: '', company_name: '',
    country: '', currency_code: 'USD', currency_symbol: '$',
  });
  const [error, setError] = useState('');
  const [loadingCountries, setLoadingCountries] = useState(false);
  const { signup, loading, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) navigate('/admin', { replace: true });
  }, [user]);

  useEffect(() => {
    if (step === 2) loadCountries();
  }, [step]);

  const loadCountries = async () => {
    setLoadingCountries(true);
    try {
      const res = await fetchCountries();
      const sorted = res.data
        .map(c => {
          const currencies = c.currencies ? Object.entries(c.currencies) : [];
          const [code, info] = currencies[0] || ['USD', { symbol: '$' }];
          return { name: c.name.common, code, symbol: info?.symbol || code };
        })
        .sort((a, b) => a.name.localeCompare(b.name));
      setCountries(sorted);
    } catch {
      toast.error('Could not load countries');
    }
    setLoadingCountries(false);
  };

  const handleCountryChange = (e) => {
    const selected = countries.find(c => c.name === e.target.value);
    setForm(f => ({
      ...f, country: e.target.value,
      currency_code: selected?.code || 'USD',
      currency_symbol: selected?.symbol || '$',
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await signup(form);
      toast.success('Account created! Welcome to ReimburseIQ.');
      navigate('/admin');
    } catch (err) {
      setError(err.response?.data?.detail || 'Signup failed. Try again.');
    }
  };

  const steps = ['Account', 'Company'];

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'radial-gradient(ellipse at 80% 50%, rgba(139,92,246,0.08) 0%, transparent 60%), var(--bg-dark)',
      padding: '1.5rem',
    }}>
      <div style={{ width: '100%', maxWidth: 480 }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <div style={{
            width: 52, height: 52, borderRadius: 14, background: 'var(--gradient-primary)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 0.875rem', boxShadow: '0 0 32px rgba(99,102,241,0.3)',
          }}>
            <Shield size={26} color="white" />
          </div>
          <h1 style={{ fontSize: '1.625rem', fontWeight: 800 }}>Create your workspace</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
            Set up your reimbursement system in seconds
          </p>
        </div>

        {/* Step Indicator */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', justifyContent: 'center' }}>
          {steps.map((s, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
              <div style={{
                width: 28, height: 28, borderRadius: '50%',
                background: i + 1 <= step ? 'var(--gradient-primary)' : 'var(--bg-card2)',
                border: `2px solid ${i + 1 <= step ? 'var(--primary)' : 'var(--border)'}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.75rem', fontWeight: 700,
                color: i + 1 <= step ? 'white' : 'var(--text-muted)',
              }}>
                {i + 1 < step ? <CheckCircle size={14} /> : i + 1}
              </div>
              <span style={{ fontSize: '0.8125rem', color: i + 1 === step ? 'var(--text-primary)' : 'var(--text-muted)', fontWeight: i + 1 === step ? 600 : 400 }}>{s}</span>
              {i < steps.length - 1 && <div style={{ width: 32, height: 1, background: i + 1 < step ? 'var(--primary)' : 'var(--border)' }} />}
            </div>
          ))}
        </div>

        <div className="glass-card" style={{ padding: '2rem' }}>
          {error && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: '0.5rem',
              padding: '0.75rem 1rem', borderRadius: 10, marginBottom: '1.25rem',
              background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
              color: '#ef4444', fontSize: '0.875rem',
            }}>
              <AlertCircle size={16} /> {error}
            </div>
          )}

          <form onSubmit={step === 2 ? handleSubmit : (e) => { e.preventDefault(); setStep(2); }}>
            {step === 1 && (
              <>
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <div style={{ position: 'relative' }}>
                    <User size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input type="text" className="form-input" style={{ paddingLeft: '2.25rem' }}
                      placeholder="Jane Smith" value={form.full_name}
                      onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))} required />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  <div style={{ position: 'relative' }}>
                    <Mail size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input type="email" className="form-input" style={{ paddingLeft: '2.25rem' }}
                      placeholder="you@company.com" value={form.email}
                      onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Password</label>
                  <div style={{ position: 'relative' }}>
                    <Lock size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input type="password" className="form-input" style={{ paddingLeft: '2.25rem' }}
                      placeholder="Min 8 characters" value={form.password} minLength={8}
                      onChange={e => setForm(f => ({ ...f, password: e.target.value }))} required />
                  </div>
                </div>
              </>
            )}

            {step === 2 && (
              <>
                <div className="form-group">
                  <label className="form-label">Company Name</label>
                  <div style={{ position: 'relative' }}>
                    <Building2 size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input type="text" className="form-input" style={{ paddingLeft: '2.25rem' }}
                      placeholder="Acme Corp" value={form.company_name}
                      onChange={e => setForm(f => ({ ...f, company_name: e.target.value }))} required />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Country</label>
                  {loadingCountries ? (
                    <div className="skeleton" style={{ height: 42 }} />
                  ) : (
                    <div style={{ position: 'relative' }}>
                      <Globe size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                      <select className="form-input" style={{ paddingLeft: '2.25rem' }}
                        value={form.country} onChange={handleCountryChange} required>
                        <option value="">Select country…</option>
                        {countries.map(c => (
                          <option key={c.name} value={c.name}>{c.name}</option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
                {form.country && (
                  <div style={{
                    padding: '0.75rem 1rem', borderRadius: 10, marginBottom: '1rem',
                    background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)',
                    fontSize: '0.875rem', color: 'var(--text-secondary)',
                    display: 'flex', alignItems: 'center', gap: '0.5rem',
                  }}>
                    <CheckCircle size={16} color="var(--primary)" />
                    Default currency set to <strong style={{ color: 'var(--primary)' }}>{form.currency_symbol} {form.currency_code}</strong>
                  </div>
                )}

                <button type="button" className="btn-ghost" onClick={() => setStep(1)}
                  style={{ width: '100%', justifyContent: 'center', marginBottom: '0.75rem' }}>
                  ← Back
                </button>
              </>
            )}

            <button type="submit" className="btn-primary" disabled={loading}
              style={{ width: '100%', justifyContent: 'center', padding: '0.75rem' }}>
              {step === 1 ? 'Next: Company Info →' : (loading ? 'Creating workspace…' : 'Create Workspace')}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: '1.25rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 600, textDecoration: 'none' }}>
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
