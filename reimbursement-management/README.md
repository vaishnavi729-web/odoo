# Reimbursement Management System

A full-stack, AI-powered system for managing corporate expense reimbursements. Features a multi-level approval workflow, OCR receipt scanning, currency conversion, and role-based access control.

## 🌟 Key Features

### Authentication & User Management
* **Firebase Authentication**: Support for secure Email/Password and Google OAuth sign-in.
* **Auto-Onboarding**: New company workspaces are automatically generated on first signup.
* **Role-Based Access Control (RBAC)**: Distinct dashboards and permissions for Employees, Managers, and Admins.

### AI & Automation
* **OCR Receipt Scanning**: Leverages Tesseract AI to automatically extract Merchant Name, Date, and Amount from uploaded receipt images, saving employees time.
* **Smart Currency Conversion**: Integrates with the `exchangerate-api` to automatically convert foreign currencies into the company's default base currency at live exchange rates.

### Flexible Approval Workflows
* **Rule Builder Engine**: Admins can define custom, multi-step approval workflows (e.g., Direct Manager → Any Admin → Specific CFO).
* **Approval Queues**: Managers have dedicated queues to quickly review, approve, reject, and comment on pending expenses.
* **Real-time Tracking**: Employees can trace the step-by-step progress of their submitted expenses via transparent visual timelines.

### Premium UI/UX
* **Modern Dashboard Aesthetics**: Built with a sleek data-heavy interface using React and modern CSS variables.
* **Data Visualization**: Recharts integration provides real-time insights into company spending by category and status.
* **Interactive Tooling**: Featuring drag-and-drop file uploads, dynamic badges, glassmorphism design elements, and responsive layouts.

## 🛠 Tech Stack

**Frontend:**
* React (Vite)
* Tailwind CSS
* React Router DOM
* Axios (API Client)
* React Dropzone
* Recharts (Data Visualization)
* Firebase Auth

**Backend:**
* Python / FastAPI
* SQLite (Database)
* SQLAlchemy (ORM)
* Pytesseract (OCR processing)
* Python-Jose (JWT handling)

## 🚀 Setting Up the Project

### Prerequisites
* Node.js (v18+)
* Python (3.9+)
* Tesseract OCR installed on your system (Required for Receipt Scanning)
* Firebase Project Configuration

### 1. Setup Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Or `venv\Scripts\activate` on Windows
pip install -r requirements.txt
python -m uvicorn main:app --reload --port 8000
```

### 2. Configure Firebase
Update `frontend/src/utils/firebase.js` with your active Firebase project credentials. Ensure Authentication (Email/Password & Google) is enabled in your Firebase Console.

### 3. Setup Frontend
```bash
cd frontend
npm install
npm run dev
```

Visit `http://localhost:5173` to view the application!
