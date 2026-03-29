import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import directorDashboardHome from './directorDashboardHome';
import ApprovalQueue from './ApprovalQueue';
import TeamExpenses from './TeamExpenses';

export default function directorLayout() {
  return (
    <div style={{ display: 'flex' }}>
      <Sidebar />
      <main className="main-content">
        <Routes>
          <Route index element={<directorDashboardHome />} />
          <Route path="approvals" element={<ApprovalQueue />} />
          <Route path="expenses" element={<TeamExpenses />} />
          <Route path="*" element={<Navigate to="/director" replace />} />
        </Routes>
      </main>
    </div>
  );
}
