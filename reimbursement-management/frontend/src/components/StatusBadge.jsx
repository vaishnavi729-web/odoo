import React from 'react';
import { Clock, CheckCircle, XCircle, Eye } from 'lucide-react';

const icons = {
  pending: <Clock size={12} />, approved: <CheckCircle size={12} />,
  rejected: <XCircle size={12} />, in_review: <Eye size={12} />,
};

const StatusBadge = ({ status }) => (
  <span className={`badge badge-${status}`}>
    {icons[status]}
    {status?.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())}
  </span>
);

export default StatusBadge;
