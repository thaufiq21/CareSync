# CareSync — A Smart Patient Support and Hospital Communication Platform

**Tagline:** Connecting Care. Empowering Patients.  
**Project Category:** Design Thinking and Innovation — Healthcare Technology  
**Institution:** Sri Eshwar College of Engineering, Coimbatore, Tamil Nadu, India  

### Student Team
1. **THAUFIQ.N.H** (Lateral)
2. **Hari Sudhan S** (25CS063)
3. **Adithiyan** (25CS004)

---

## 1. Project Overview & Problem Statement

Patients frequently feel anxious, confused, or unsupported during hospital visits. They face challenges locating departments, deciphering procedures, communicating in their native tongue (Tamil / English), requesting non-emergency help, and receiving timely responses.

**CareSync** provides an accessible, empathy-driven digital platform connecting patients with hospital staff to streamline non-emergency communication, appointment preparation, and feedback collection.

> **Healthcare Boundary:** CareSync is an operational patient support platform, **not** an electronic health record (EHR), emergency dispatch system, or medical diagnostic tool.

---

## 2. Key Features

- **Patient Portal:** Personalized dashboard, demonstration visit planner, doctor question organizer, pre-visit checklist, and status tracking.
- **Assistance Request System:** Structured non-emergency requests with unique reference codes (`CS-XXXXXX`), category tags, and real-time response history.
- **Role-Based Privacy:** Internal staff notes are strictly segregated and concealed from patient views on both database and API layers.
- **Hospital Directory & Navigation:** Searchable directory with floor numbers, buildings, operating hours, and accessibility guidance.
- **Automated FAQ Assistant:** Bilingual (English & Tamil) offline-first information retrieval for department timings, required documents, and wheelchair requests with strict safety disclaimers.
- **Empathy Check-In & Feedback:** Non-clinical emotional check-in and 1–5 star experience rating surveys linked directly to staff analytics.
- **Staff Operations Dashboard:** Request filtering, delegation, workflow status transitions, and response authoring.
- **Experience Analytics:** Dynamic Recharts visualizations of resolution rates, category distributions, and weekly inquiry trends.
- **System Administration:** Staff account management, department configuration, FAQ curation, and audit logging.

---

## 3. Technology Stack

- **Frontend:** React 18, TypeScript, Vite, Tailwind CSS, Lucide React, TanStack Query, React Hook Form, Zod, Recharts, React Hot Toast.
- **Backend:** Python 3.12, FastAPI, SQLAlchemy 2.0 (Synchronous Engine for rock-solid SQLite persistence), Pydantic v2, Argon2id Password Hashing, JWT cookie authentication.
- **Database:** SQLite (persisted on disk at `backend/caresync.db`).

---

## 4. Quick Start & Local Execution

### Prerequisites
- Node.js (v20+ or v24+) & npm
- Python (v3.11 or v3.12)

### Backend Setup & Startup
```powershell
cd c:\Personal\CareSync\backend
.\venv\Scripts\python.exe -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```
*API Documentation will be live at: http://localhost:8000/docs*

### Seed Demo Data
```powershell
cd c:\Personal\CareSync
$env:PYTHONIOENCODING = "utf-8"
.\backend\venv\Scripts\python.exe scripts\seed_demo.py
```

### Frontend Startup
```powershell
cd c:\Personal\CareSync\frontend
npm run dev
```
*Frontend application will be live at: http://localhost:5173*

---

## 5. Demonstration Accounts

| Role | Email | Password | Purpose |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@caresync.demo` | `Admin@12345` | System config, staff creation, audit logs |
| **Hospital Staff** | `staff1@caresync.demo` | `Staff@12345` | Responding to requests, setting status, review feedback |
| **Hospital Staff** | `staff2@caresync.demo` | `Staff@12345` | Tamil-first staff coordination |
| **Patient 1** | `patient1@caresync.demo` | `Patient@12345` | English requests, appointments, feedback |
| **Patient 2** | `patient2@caresync.demo` | `Patient@12345` | Tamil requests & navigation |

---

## 6. Verification & Test Evidence

- **Frontend Build:** Verified via `tsc && vite build` (100% clean TypeScript compilation, 0 type errors).
- **End-to-End Workflow:** Executed and verified through database session testing (`Patient Request -> Staff Assignment -> Response & Internal Note -> Patient Retrieval & Privacy Check -> Feedback Persistence`).
- **Safety Boundaries:** Emergency queries automatically redirect to emergency services; medical diagnostic queries reject prescriptions and recommend professional clinical consultation.
