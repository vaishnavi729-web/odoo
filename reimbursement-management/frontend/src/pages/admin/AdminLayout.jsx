import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import AdminDashboardHome from './AdminDashboardHome';
import UserManagement from './UserManagement';
import ApprovalRules from './ApprovalRules';
import CompanySettings from './CompanySettings';
import AllExpenses from './AllExpenses';

export default function AdminLayout() {
  return (
    <div style={{ display: 'flex' }}>
      <Sidebar />
      <main className="main-content">
        <Routes>
          <Route index element={<AdminDashboardHome />} />
          <Route path="users" element={<UserManagement />} />
          <Route path="expenses" element={<AllExpenses />} />
          <Route path="rules" element={<ApprovalRules />} />
          <Route path="settings" element={<CompanySettings />} />
          <Route path="*" element={<Navigate to="/admin" replace />} />
        </Routes>
      </main>
    </div>
  );
}
