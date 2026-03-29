import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import ManagerDashboardHome from './ManagerDashboardHome';
import ApprovalQueue from './ApprovalQueue';
import TeamExpenses from './TeamExpenses';

export default function ManagerLayout() {
  return (
    <div style={{ display: 'flex' }}>
      <Sidebar />
      <main className="main-content">
        <Routes>
          <Route index element={<ManagerDashboardHome />} />
          <Route path="approvals" element={<ApprovalQueue />} />
          <Route path="expenses" element={<TeamExpenses />} />
          <Route path="*" element={<Navigate to="/manager" replace />} />
        </Routes>
      </main>
    </div>
  );
}
