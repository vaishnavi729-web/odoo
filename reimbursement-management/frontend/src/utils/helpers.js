import { format, parseISO } from 'date-fns';

export const formatDate = (dateStr) => {
  try {
    return format(parseISO(dateStr), 'MMM d, yyyy');
  } catch {
    return dateStr || '—';
  }
};

export const formatCurrency = (amount, code = 'USD', symbol = '$') => {
  if (amount == null) return '—';
  return `${symbol}${Number(amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${code}`;
};

export const getInitials = (name = '') =>
  name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();

export const getAvatarColor = (name = '') => {
  const colors = ['#6366f1','#8b5cf6','#06b6d4','#10b981','#f59e0b','#ef4444','#ec4899'];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
};

export const truncate = (str, len = 40) =>
  str && str.length > len ? str.slice(0, len) + '…' : str;
