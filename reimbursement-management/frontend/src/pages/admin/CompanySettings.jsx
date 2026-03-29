import React, { useState, useEffect } from 'react';
import { companyAPI, fetchCountries } from '../../services/api';
import { Building2, Globe, Save } from 'lucide-react';
import toast from 'react-hot-toast';

export default function CompanySettings() {
  const [form, setForm] = useState({ name: '', country: '', currency_code: '', currency_symbol: '' });
  const [countries, setCountries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setLoading(true);
    Promise.all([companyAPI.get(), fetchCountries()])
      .then(([cRes, cntRes]) => {
        setForm(cRes.data);
        const sorted = cntRes.data.map(c => {
          const currencies = c.currencies ? Object.entries(c.currencies) : [];
          const [code, info] = currencies[0] || ['USD', { symbol: '$' }];
          return { name: c.name.common, code, symbol: info?.symbol || code };
        }).sort((a, b) => a.name.localeCompare(b.name));
        setCountries(sorted);
      })
      .catch(() => toast.error('Failed to load settings'))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await companyAPI.update(form);
      toast.success('Settings saved successfully');
    } catch (err) {
      toast.error('Failed to save settings');
    }
    setSaving(false);
  };

  const handleCountryChange = (e) => {
    const selected = countries.find(c => c.name === e.target.value);
    setForm(f => ({
      ...f, country: e.target.value,
      currency_code: selected?.code || f.currency_code,
      currency_symbol: selected?.symbol || f.currency_symbol,
    }));
  };

  if (loading) return <div className="animate-fade-in"><div className="skeleton" style={{ height: 400 }} /></div>;

  return (
    <div className="animate-fade-in" style={{ maxWidth: 640 }}>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.25rem' }}>Company Settings</h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>Manage your workspace and default configurations</p>

      <form className="glass-card" style={{ padding: '2rem' }} onSubmit={handleSave}>
        <div className="form-group" style={{ marginBottom: '1.5rem' }}>
          <label className="form-label" style={{ fontWeight: 600 }}>Company Name</label>
          <div style={{ position: 'relative' }}>
            <Building2 size={16} style={{ position: 'absolute', left: 12, top: 12, color: 'var(--text-muted)' }} />
            <input className="form-input" style={{ paddingLeft: '2.5rem' }} required
              value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
          </div>
        </div>

        <div className="form-group" style={{ marginBottom: '1.5rem' }}>
          <label className="form-label" style={{ fontWeight: 600 }}>Origin Country</label>
          <div style={{ position: 'relative' }}>
            <Globe size={16} style={{ position: 'absolute', left: 12, top: 12, color: 'var(--text-muted)' }} />
            <select className="form-input" style={{ paddingLeft: '2.5rem' }} value={form.country || ''} onChange={handleCountryChange}>
              <option value="">Select country...</option>
              {countries.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
            </select>
          </div>
          <p style={{ marginTop: '0.5rem', fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
            This determines the default base currency for reports.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label" style={{ fontWeight: 600 }}>Default Currency</label>
            <input className="form-input" style={{ background: 'var(--bg-dark)' }} disabled
              value={`${form.currency_code} (${form.currency_symbol})`} />
          </div>
        </div>

        <div className="divider" style={{ margin: '2rem -2rem', background: 'var(--border)' }} />

        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button type="submit" className="btn-primary" disabled={saving}>
            <Save size={16} /> {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}
