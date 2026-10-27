# CareSync

**A patient support and hospital communication platform**

CareSync is a full-stack project focused on making common hospital interactions easier to navigate. It gives patients a place to prepare for visits, find department information, submit non-emergency support requests, and share feedback. Staff and administrators have tools to manage requests and review service activity.

> **Project scope:** CareSync is a student portfolio and demonstration project. It is not an electronic health record, emergency dispatch service, or source of medical advice. Demo content such as department details is illustrative and must not be treated as real hospital information.

## Features

- **Patient experience:** Account registration and sign-in, a patient dashboard, appointment planning, doctor-question notes, and a pre-visit checklist.
- **Assistance workflow:** Patients can submit and track categorized non-emergency requests. Staff can review, assign, update status, and respond to requests; staff-only notes are supported.
- **Department directory:** Searchable department information, including location and accessibility details in the demonstration data.
- **FAQ assistant:** Answers from published FAQs, with English and Tamil response support where translated content is available. It includes basic emergency and medical-advice safety responses; it does not dispatch help or provide diagnosis.
- **Empathy check-in and feedback:** Non-diagnostic check-ins and patient experience ratings.
- **Staff and admin tools:** Request management, feedback and request analytics, department and FAQ management, staff administration, and audit records.
- **Notifications:** In-app notification endpoints and views for relevant account activity.

## Technology

| Area | Technologies |
| --- | --- |
| Frontend | React 18, TypeScript, Vite, React Router, TanStack Query, Tailwind CSS, React Hook Form, Zod, Recharts |
| Backend | Python, FastAPI, Pydantic, SQLAlchemy, Uvicorn |
| Data | SQLite for local/demo use |
| Authentication | JWT-based session cookies and Argon2 password hashing |

## Repository layout

```text
CareSync/
├── backend/
│   ├── app/
│   │   ├── api/routes/    # Versioned API route modules
│   │   ├── core/          # Settings, dependencies, and security helpers
│   │   ├── db/            # Database setup and model registry
│   │   ├── models/        # SQLAlchemy models
│   │   ├── schemas/       # API request/response schemas
│   │   └── services/      # Shared backend services
│   ├── tests/             # Backend tests
│   └── requirements.txt
├── frontend/
│   ├── src/               # React application, pages, components, and services
│   └── package.json
├── scripts/
│   └── seed_demo.py       # Creates local demonstration data
├── docs/                  # Project progress notes
└── .env.example           # Environment configuration template
```

## Run locally (Windows PowerShell)

### Prerequisites

- Python 3.12
- Node.js and npm
- Git

### 1. Get the code and configure the backend

```powershell
git clone https://github.com/thaufiq21/CareSync.git
cd CareSync

py -3.12 -m venv backend\venv
.\backend\venv\Scripts\python.exe -m pip install -r backend\requirements.txt
Copy-Item .env.example backend\.env
```

Open `backend\.env` and set a unique `SESSION_SECRET`. Keep `.env` files private. The example config uses SQLite at `backend/caresync.db` when the backend is started from the `backend` directory.

### 2. Start the API

In a PowerShell window:

```powershell
Set-Location backend
..\backend\venv\Scripts\python.exe -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

The API is available at `http://127.0.0.1:8000`. Interactive API documentation is at `http://127.0.0.1:8000/docs`, and the health endpoint is `http://127.0.0.1:8000/health`.

### 3. (Optional) Load demonstration data

With the API stopped, open another PowerShell window at the repository root and run:

```powershell
.\backend\venv\Scripts\python.exe scripts\seed_demo.py
```

The script creates local sample users, departments, FAQs, and sample records in `backend/caresync.db`. Use seeded accounts only for local demonstration; do not reuse their credentials in a deployed environment.

### 4. Start the frontend

In a separate PowerShell window:

```powershell
Set-Location frontend
npm ci
npm run dev
```

Open the local URL printed by Vite (normally `http://localhost:5173`). The Vite development server proxies `/api` requests to the backend at `http://localhost:8000`.

## Tests and useful commands

Run backend tests from the repository root:

```powershell
Set-Location backend
.\venv\Scripts\python.exe -m pytest tests
```

Run frontend checks from the `frontend` directory:

```powershell
npm test
npm run lint
npm run build
```

## Configuration and security

- Copy `.env.example` to `backend/.env` for local backend configuration. The file is ignored by Git; never commit real secrets or credentials.
- Replace `SESSION_SECRET` with a strong, unique value outside local throwaway development. Review the settings in `.env.example` and `backend/app/core/config.py` before changing environments.
- The included seed script contains demonstration accounts and data. Keep seeded credentials confined to local demos and reset them before any shared deployment.
- SQLite and the bundled sample data are intended for local development and demonstration. A production deployment requires a separately reviewed database, secrets management, HTTPS, restrictive CORS, and appropriate operational safeguards.
- Do not use CareSync to store real patient or health information. The project has not been presented as clinically validated or production-hardened.

## Deployment

The root `render.yaml` defines a Render Blueprint for one web service and a PostgreSQL database. The Dockerfile builds the React frontend and serves it from FastAPI on the same origin. The Blueprint sets production mode, generates a session secret, and connects the app to PostgreSQL. The backend still uses SQLite by default for local development.

To deploy, push the repository to GitHub and open Render's **New Blueprint** flow for this repository. Review the listed resources and apply the Blueprint. The web service uses `/health` for readiness checks and `.python-version` documents Python 3.12 for non-Docker development.

This repository is a portfolio/demo project. A free Render Postgres database expires after 30 days, so treat any data entered into a free deployment as temporary. Do not enter real patient or health information. Render's free web services may also spin down when idle.

## Team and project context

Developed as a Design Thinking and Innovation — Healthcare Technology project at Sri Eshwar College of Engineering, Coimbatore, Tamil Nadu, India.

- THAUFIQ.N.H (Lateral)
- Hari Sudhan S (25CS063)
- Adithiyan (25CS004)

---

CareSync is an educational software project and is not a substitute for professional healthcare guidance or a hospital's official communication channels.
