# Reimbursement Management System

A full-stack, AI-powered system for managing corporate expense reimbursements. Features a multi-level approval workflow, OCR receipt scanning, currency conversion, robust conditional approval logic, and role-based access control.

## 🌟 Key Features

### Authentication & User Management
* **Firebase Authentication**: Support for secure Email/Password and Google OAuth sign-in.
* **Auto-Onboarding**: New company workspaces are automatically generated on first signup.
* **Role-Based Access Control (RBAC)**: Distinct dashboards and permissions for Employees, Managers, and Admins.

### AI & Automation
* **OCR Receipt Scanning**: Leverages Tesseract AI to automatically extract Merchant Name, Date, and Amount from uploaded receipt images, saving employees time.
* **Smart Currency Conversion**: Integrates with the `exchangerate-api` to automatically convert foreign currencies into the company's default base currency at live exchange rates.

### Flexible Approval Workflows & Rule Engine
Instead of enforcing rigid, step-by-step hierarchies, admins can leverage a Conditional Approval Flow paired with multi-level workflows.

* **Sequential Step-by-Step Flow**:
  1. Expenses go through a systematic approval process.
  2. First, the **direct manager** approves (if required).
  3. Then it moves to other configured approvers in strict order (e.g., Manager → Finance → Director).
  4. The next person in line only gets it after the previous one approves. If rejected, the workflow stops entirely.
  5. Managers and Admins can view details, fetch converted currencies, view receipts, approve/reject, and add comments.

* **Conditional Approval Rules**:
  System Administrators have the power to define unique conditions to instantly approve expenses, skipping the rest of the queue:
  - **Percentage Rule:** For example, if a workflow chain has 5 people, and the rule is set to 60%. As soon as 3 people (60%) approve, the expense is definitively Auto-Approved.
  - **Specific Person Override Rule:** Identify key personnel (e.g., specific CFO). If that listed individual approves the expense AT ANY POINT, it bypasses the rest of the queue and becomes Approved instantly.
  - **Hybrid Logic:** Either condition (Percentage threshold reached OR the specific person overridden) works to finalize the expense successfully.

* **Combined Flows**: 
  You can effortlessly use both step-by-step approvals *and* conditional rules simultaneously so routine reviews happen automatically, but powerful executives still hold ultimate clearance. 

### Premium UI/UX
* **Modern Dashboard Aesthetics**: Built with a sleek data-heavy interface using React and modern CSS variables. Includes dedicated queues, intuitive Drag & Drop areas, and visual timelines.
* **Data Visualization**: Quick statistical metrics and tracking indicators designed in standard SaaS architecture patterns.

## 🛠 Tech Stack

**Frontend:** React (Vite), Tailwind CSS, React Router DOM, Axios, Recharts, Firebase Auth
**Backend:** Python / FastAPI, SQLite, SQLAlchemy, Pytesseract, PassLib (pbkdf2_sha256)

## 🚀 Setting Up the Project

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
