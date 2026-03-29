import React from 'react';
import { CheckCircle, XCircle, Clock, SkipForward } from 'lucide-react';
import { formatDate, getInitials, getAvatarColor } from '../utils/helpers';

const STEP_ICONS = {
  approved: <CheckCircle size={14} color="white" />,
  rejected: <XCircle size={14} color="white" />,
  pending: <Clock size={14} color="var(--bg-dark)" />,
  skipped: <SkipForward size={14} color="white" />,
};
const STEP_COLORS = {
  approved: 'var(--success)',
  rejected: 'var(--danger)',
  pending: 'var(--warning)',
  skipped: 'var(--text-muted)',
};

export default function ApprovalTimeline({ steps = [] }) {
  if (!steps.length) return null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      {steps.map((step, idx) => {
        const color = STEP_COLORS[step.status] || 'var(--border)';
        const approverName = step.approver?.full_name || step.approver_role || `Approver ${step.step_order}`;
        const initials = getInitials(approverName);
        const avatarColor = getAvatarColor(approverName);

        return (
          <div key={step.id} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
            {/* Line + Dot */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
              <div style={{
                width: 32, height: 32, borderRadius: '50%',
                background: color,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                border: `2px solid ${color}`,
                zIndex: 1,
              }}>
                {STEP_ICONS[step.status]}
              </div>
              {idx < steps.length - 1 && (
                <div style={{ width: 2, flex: 1, minHeight: 20, background: step.status === 'approved' ? color : 'var(--border)', marginTop: 4 }} />
              )}
            </div>

            {/* Content */}
            <div style={{ flex: 1, paddingBottom: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <div style={{
                    width: 24, height: 24, borderRadius: 6,
                    background: avatarColor,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '0.6875rem', fontWeight: 700, color: 'white',
                  }}>
                    {initials}
                  </div>
                  <span style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-primary)' }}>
                    {approverName}
                  </span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>— Step {step.step_order}</span>
                </div>
                <span style={{
                  fontSize: '0.6875rem', fontWeight: 600, textTransform: 'uppercase',
                  letterSpacing: '0.06em', color: color,
                }}>
                  {step.status}
                </span>
              </div>

              {step.comments && (
                <div style={{
                  marginTop: '0.375rem', padding: '0.5rem 0.75rem',
                  background: 'var(--bg-dark)', borderRadius: 8,
                  fontSize: '0.8125rem', color: 'var(--text-secondary)',
                  borderLeft: `3px solid ${color}`,
                }}>
                  "{step.comments}"
                </div>
              )}

              {step.acted_at && (
                <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                  {formatDate(step.acted_at)}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
