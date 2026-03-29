import React, { useState, useEffect } from 'react';
import { rulesAPI, usersAPI } from '../../services/api';
import { Plus, Settings2, Trash2, CheckCircle, AlertCircle, Save, X } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ApprovalRules() {
  const [rules, setRules] = useState([]);
  const [managers, setManagers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  
  const [form, setForm] = useState({
    name: '', type: 'sequential', threshold: 100,
    steps: [{ step_order: 1, approver_role: 'manager' }]
  });

  const load = () => {
    setLoading(true);
    Promise.all([rulesAPI.list(), usersAPI.managers()])
      .then(([rRes, mRes]) => {
        setRules(rRes.data);
        setManagers(mRes.data);
      })
      .finally(() => setLoading(false));
  };
  
  useEffect(() => { load(); }, []);

  const handleToggle = async (rule) => {
    try {
      await rulesAPI.toggle(rule.id);
      toast.success(rule.is_active ? 'Rule paused' : 'Rule activated');
      load();
    } catch (err) {
      toast.error('Failed to toggle rule');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this rule?')) return;
    try {
      await rulesAPI.delete(id);
      toast.success('Rule deleted');
      load();
    } catch (err) {
      toast.error('Failed to delete rule');
    }
  };

  const addStep = () => {
    setForm(f => ({
      ...f,
      steps: [...f.steps, { step_order: f.steps.length + 1, approver_role: 'admin' }]
    }));
  };

  const updateStep = (index, key, value) => {
    const newSteps = [...form.steps];
    newSteps[index] = { ...newSteps[index], [key]: value };
    // update order
    newSteps.forEach((s, i) => s.step_order = i + 1);
    setForm({ ...form, steps: newSteps });
  };

  const removeStep = (index) => {
    if (form.steps.length <= 1) return;
    const newSteps = form.steps.filter((_, i) => i !== index);
    newSteps.forEach((s, i) => s.step_order = i + 1);
    setForm({ ...form, steps: newSteps });
  };

  const saveRule = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        name: form.name,
        rule_type: form.type,
        percentage_threshold: ['percentage', 'hybrid'].includes(form.type) ? Number(form.threshold) : null,
        specific_approver_id: ['specific_approver', 'hybrid'].includes(form.type) && form.specific_approver_id ? Number(form.specific_approver_id) : null,
        steps_config: form.steps.map(s => ({
          ...s,
          approver_id: s.approver_role === 'specific_user' ? Number(s.approver_id) : null,
          approver_role: s.approver_role !== 'specific_user' ? s.approver_role : null
        }))
      };
      await rulesAPI.create(payload);
      toast.success('Rule created');
      setModal(false);
      load();
    } catch (err) {
      toast.error('Failed to save rule');
    }
  };

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Approval Rules</h1>
          <p style={{ color: 'var(--text-muted)', marginTop: '0.25rem' }}>Configure multi-level workflow rules</p>
        </div>
        <button className="btn-primary" onClick={() => {
          setForm({ name: '', type: 'sequential', threshold: 100, specific_approver_id: '', steps: [{ step_order: 1, approver_role: 'manager' }] });
          setModal(true);
        }}>
          <Plus size={16} /> New Rule
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
        {loading ? (
          Array(2).fill(0).map((_, i) => <div key={i} className="skeleton glass-card" style={{ height: 200 }} />)
        ) : rules.length ? rules.map(rule => {
          const steps = rule.steps_config ? JSON.parse(rule.steps_config) : [];
          return (
            <div key={rule.id} className="glass-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <div>
                  <h3 style={{ fontWeight: 700, fontSize: '1.0625rem', marginBottom: '0.25rem' }}>{rule.name}</h3>
                  <span className="badge" style={{ background: 'rgba(99,102,241,0.1)', color: 'var(--primary)' }}>
                    {rule.rule_type.replace('_', ' ')}
                  </span>
                </div>
                <label className="toggle-switch">
                  <input type="checkbox" checked={rule.is_active} onChange={() => handleToggle(rule)} />
                  <span className="toggle-slider"></span>
                </label>
              </div>

              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Approval Workflow
                </div>
                {steps.map((s, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                    <div style={{
                      width: 24, height: 24, borderRadius: '50%', background: 'var(--bg-card2)', border: '1px solid var(--border)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)'
                    }}>{s.step_order}</div>
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-primary)' }}>
                      {s.approver_role === 'manager' ? 'Direct Manager' : s.approver_role === 'admin' ? 'Any Admin' : 'Specific Appover'}
                    </div>
                  </div>
                ))}
              </div>

              <div className="divider" />
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button className="btn-ghost" style={{ color: 'var(--danger)', borderColor: 'transparent' }} onClick={() => handleDelete(rule.id)}>
                  <Trash2 size={15} /> Delete
                </button>
              </div>
            </div>
          );
        }) : (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3rem', background: 'var(--bg-card)', borderRadius: 16, border: '1px dashed var(--border)' }}>
            <Settings2 size={40} style={{ margin: '0 auto 1rem', color: 'var(--text-muted)' }} />
            <h3 style={{ fontWeight: 600, marginBottom: '0.5rem' }}>No custom rules set</h3>
            <p style={{ color: 'var(--text-muted)' }}>Expenses will default to requiring direct manager approval.</p>
          </div>
        )}
      </div>

      {modal && (
        <div className="modal-backdrop">
          <div className="modal-box glass-card" style={{ maxWidth: 640 }}>
            <div className="modal-header">
              <h2 style={{ fontWeight: 700, fontSize: '1.25rem' }}>Create Approval Rule</h2>
              <button className="btn-icon" onClick={() => setModal(false)}><X size={16} /></button>
            </div>
            <form onSubmit={saveRule} style={{ padding: '1.5rem', maxHeight: '70vh', overflowY: 'auto' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Rule Name</label>
                  <input className="form-input" required placeholder="e.g. Executive Travel Protocol"
                    value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Condition Type</label>
                  <select className="form-input" required value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
                    <option value="sequential">Sequential Workflow</option>
                    <option value="percentage">Percentage Approved (&gt;X%)</option>
                    <option value="specific_approver">Specific Override Person</option>
                    <option value="hybrid">Hybrid (Percentage + Override)</option>
                  </select>
                </div>
              </div>

              {['percentage', 'hybrid'].includes(form.type) && (
                <div className="form-group" style={{ padding: '1rem', background: 'var(--bg-dark)', borderRadius: '10px', marginBottom: '1.5rem' }}>
                  <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <AlertCircle size={14} color="var(--primary)" /> Approval Percentage Threshold (%)
                  </label>
                  <input type="number" className="form-input" min="1" max="100" required
                    value={form.threshold} onChange={e => setForm({ ...form, threshold: e.target.value })} />
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                    If this percentage of the total steps is approved, the entire expense is auto-approved immediately.
                  </p>
                </div>
              )}

              {['specific_approver', 'hybrid'].includes(form.type) && (
                <div className="form-group" style={{ padding: '1rem', background: 'var(--bg-dark)', borderRadius: '10px', marginBottom: '1.5rem' }}>
                  <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <CheckCircle size={14} color="var(--success)" /> Specific Person Override
                  </label>
                  <select className="form-input" required value={form.specific_approver_id} onChange={e => setForm({ ...form, specific_approver_id: e.target.value })}>
                    <option value="">Select a user...</option>
                    {managers.map(m => <option key={m.id} value={m.id}>{m.full_name}</option>)}
                  </select>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                    If this person approves the expense at any point, the entire expense is auto-approved instantly.
                  </p>
                </div>
              )}

              <div style={{ marginTop: '2rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <label className="form-label" style={{ margin: 0 }}>Workflow Steps (Required)</label>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {form.steps.map((step, idx) => (
                  <div key={idx} style={{
                    display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem',
                    background: 'var(--bg-card2)', border: '1px solid var(--border)', borderRadius: 10
                  }}>
                    <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-muted)' }}>Step {step.step_order}</div>
                    
                    <select className="form-input" style={{ flex: 1, minWidth: 150 }}
                      value={step.approver_role || 'specific_user'}
                      onChange={e => updateStep(idx, 'approver_role', e.target.value)}
                    >
                      <option value="manager">Direct Manager</option>
                      <option value="admin">Any Admin</option>
                      <option value="specific_user">Specific User</option>
                    </select>

                    {step.approver_role === 'specific_user' && (
                      <select className="form-input" style={{ flex: 1 }} required
                        value={step.approver_id || ''}
                        onChange={e => updateStep(idx, 'approver_id', e.target.value)}
                      >
                        <option value="">Select manager...</option>
                        {managers.map(m => <option key={m.id} value={m.id}>{m.full_name}</option>)}
                      </select>
                    )}

                    <button type="button" className="btn-icon" disabled={form.steps.length === 1} onClick={() => removeStep(idx)}>
                      <Trash2 size={14} color="var(--danger)" />
                    </button>
                  </div>
                ))}
              </div>

              <button type="button" className="btn-ghost" style={{ marginTop: '1rem', width: '100%', justifyContent: 'center' }} onClick={addStep}>
                <Plus size={15} /> Add Approval Step
              </button>

              <div className="divider" style={{ margin: '1.5rem 0' }} />

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                <button type="button" className="btn-ghost" onClick={() => setModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary"><Save size={15} /> Save Rule</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
