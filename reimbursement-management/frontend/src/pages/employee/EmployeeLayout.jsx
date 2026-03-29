import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import EmployeeDashboardHome from './EmployeeDashboardHome';
import MyExpenses from './MyExpenses';

export default function EmployeeLayout() {
  return (
    <div style={{ display: 'flex' }}>
      <Sidebar />
      <main className="main-content">
        <Routes>
          <Route index element={<EmployeeDashboardHome />} />
          <Route path="expenses" element={<MyExpenses />} />
          <Route path="*" element={<Navigate to="/employee" replace />} />
        </Routes>
      </main>
    </div>
  );
}
