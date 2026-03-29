# Reimbursement Management System

[![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/Frontend-React-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactjs.org/)
[![Firebase](https://img.shields.io/badge/Auth-Firebase-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)](https://firebase.google.com/)
[![Tailwind CSS](https://img.shields.io/badge/Styling-Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)

A full-stack, AI-powered system for managing corporate expense reimbursements. Features a multi-level approval workflow, OCR receipt scanning, currency conversion, robust conditional approval logic, and role-based access control.

---

##  Problem Statement
Companies often struggle with manual expense reimbursement processes that are **time-consuming, error-prone, and lack transparency**. Traditional systems lack simple ways to:
*   Define approval flows based on custom thresholds.
*   Manage complex multi-level approval hierarchies.
*   Support flexible approval rules (e.g., specific CFO override).
*   Automate receipt data entry via AI.

##  Key Features

### Authentication & User Management
* **Firebase Authentication**: Support for secure Email/Password and Google OAuth sign-in.
* **Auto-Onboarding**: On the first login/signup, a new **Company** and **Admin User** are automatically created.
* **Role-Based Access Control (RBAC)**: Admins can create and manage Employees and Managers, assign roles, and define reporting relationships.

### Expense Submission (Employee)
* **Smart Submission**: Employees can submit claims with Amount (supports multi-currency), Category, Description, and Date.
* **OCR Receipt Scanning**: Leverages Tesseract AI to automatically scan receipts and extract Merchant Name, Date, Amount, and expense lines.
* **History Tracking**: Real-time visibility into current and past expenses with status updates (Approved/Rejected).

### AI & Automation
* **OCR Receipt Scanning**: Leverages Tesseract AI to automatically extract Merchant Name, Date, and Amount from uploaded receipt images, saving employees time.
* **Smart Currency Conversion**: Integrates with the `exchangerate-api` to automatically convert foreign currencies into the company's default base currency at live exchange rates.

### Flexible Approval Workflows & Rule Engine
Instead of enforcing rigid hierarchies, admins can define **Conditional Approval Flows** paired with multi-level workflows.

*   **Sequential Approval Hierarchy**:
    1.  **Step 1 → Manager**: The direct manager reviews first (if configured).
    2.  **Step 2 → Finance**: Moves to the finance department after initial clearance.
    3.  **Step 3 → Director**: Final oversight for high-priority or complex claims.
    *   *Note: Expenses only move to the next approver after the current one provides consent.*

*   **Advanced Approval Rules**:
    *   **Percentage Rule**: e.g., If 60% of assigned approvers approve → The expense is finalized.
    *   **Specific Approver Rule**: e.g., If the **CFO** approves → The expense is auto-approved regardless of other steps.
    *   **Hybrid Rule**: Combines both (e.g., 60% approval OR CFO sign-off).

---

##  Role Permissions Matrix

| Role | Permissions |
| :--- | :--- |
| **Admin** | Create Company, manage users/roles, configure approval rules, view all expenses, override approvals. |
| **Manager** | View team expenses, approve/reject claims (in company currency), escalate based on rules. |
| **Employee** | Submit expenses, scan receipts (OCR), track status, view personal history. |

---

## 🛠 Additional Features & APIs

*   **🌐 Real-Time Currency API**: Integrates with [REST Countries](https://restcountries.com/v3.1/all) to fetch global currencies and [ExchangeRate-API](https://api.exchangerate-api.com/v4/latest/) for live conversion.
*   **📷 OCR Engine**: Custom OCR algorithm that extracts:
    *   Merchant Name/Restaurant
    *   Transaction Date
    *   Total Amount & Expense Lines
*   **🏦 Multi-Currency Support**: Company currency is set automatically based on the selected country, but employees can submit claims in any currency.

### Premium UI/UX
* **Modern Dashboard Aesthetics**: Built with a sleek data-heavy interface using React and modern CSS variables. Includes dedicated queues, intuitive Drag & Drop areas, and visual timelines.
* **Data Visualization**: Quick statistical metrics and tracking indicators designed in standard SaaS architecture patterns.

##  Tech Stack

**Frontend:** React (Vite), Tailwind CSS, React Router DOM, Axios, Recharts, Firebase Auth
**Backend:** Python / FastAPI, SQLite, SQLAlchemy, Pytesseract, PassLib (pbkdf2_sha256)

##  Setting Up the Project

### 1. Setup Backend
```bash
cd backend
python -m venv venv
# On Windows use: .\venv\Scripts\Activate.ps1
# On Mac/Linux use: source venv/bin/activate
pip install -r requirements.txt
python -m uvicorn main:app --reload --port 8000
```

### 2. Setup Frontend
```bash
cd frontend
npm install
npm run dev
```

Visit `http://localhost:5173` to view the application!
