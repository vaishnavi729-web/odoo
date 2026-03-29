import React from 'react';
import { formatCurrency, formatDate, getInitials, getAvatarColor } from '../utils/helpers';
import StatusBadge from './StatusBadge';
import { Building2, Calendar, Tag, ArrowRight } from 'lucide-react';

export default function ExpenseCard({ expense, onClick, compact }) {
  const color = getAvatarColor(expense.submitted_by?.full_name || '');
  const initials = getInitials(expense.submitted_by?.full_name || '');
  const symbol = expense.company_currency_code === expense.currency_code ? '$' : '';

  return (
    <div className="glass-card glass-card-hover" style={{ padding: compact ? '1rem' : '1.25rem', cursor: 'pointer' }} onClick={onClick}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1, minWidth: 0 }}>
          <div style={{
            width: 40, height: 40, borderRadius: 10, background: color,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '0.8125rem', fontWeight: 700, color: 'white', flexShrink: 0,
          }}>
            {initials}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 600, fontSize: '0.9375rem', color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {expense.title}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.125rem' }}>
              {expense.submitted_by?.full_name}
            </div>
          </div>
        </div>
        <StatusBadge status={expense.status} />
      </div>

      {!compact && (
        <div style={{ display: 'flex', gap: '1rem', marginTop: '0.875rem', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
            <Tag size={12} /> {expense.category}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
            <Calendar size={12} /> {formatDate(expense.expense_date)}
          </div>
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.75rem' }}>
        <div>
          <span style={{ fontWeight: 700, fontSize: '1.0625rem', color: 'var(--text-primary)' }}>
            {formatCurrency(expense.amount, expense.currency_code)}
          </span>
          {expense.converted_amount && expense.currency_code !== expense.company_currency_code && (
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginLeft: '0.5rem' }}>
              ≈ {formatCurrency(expense.converted_amount, expense.company_currency_code)}
            </span>
          )}
        </div>
        <ArrowRight size={16} color="var(--text-muted)" />
      </div>
    </div>
  );
}
