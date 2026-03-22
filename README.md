# OOPshop

Full-stack e-commerce platform: **Express API**, **Next.js storefront**, **Kotlin / Jetpack Compose Android app**, optional **Python recommendation service**, and **MySQL**. Built for coursework-style OOP architecture with a clear split between routes, controllers, services, and data access.

[![Node.js](https://img.shields.io/badge/Node.js-18%20%7C%2020-green.svg)](https://nodejs.org/)
[![Next.js](https://img.shields.io/badge/Next.js-16-black.svg)](https://nextjs.org/)
[![Kotlin](https://img.shields.io/badge/Kotlin-Android-7F52FF.svg)](https://kotlinlang.org/)
[![License](https://img.shields.io/badge/License-ISC-yellow.svg)](LICENSE)

---

## Repository layout

| Path | Description |
|------|-------------|
| [`backend/`](backend/) | REST API (Express, MySQL, JWT, Swagger, PayPal hooks, **Nodemailer** order emails) |
| [`frontend/`](frontend/) | Customer + admin web UI (Next.js 16, React 19, MUI) |
| [`app/`](app/) | Android client (MVVM, Retrofit, Room, Compose) — see [`app/README.md`](app/README.md) |
| [`recommendation/`](recommendation/) | Optional FastAPI + embeddings for product similarity — see [`recommendation/README.md`](recommendation/README.md) |
| [`docs/`](docs/) | Setup, deployment, architecture notes — index: [`docs/README.md`](docs/README.md) |

---

## Features (high level)

- **Catalog**: products, categories, stock, low-stock alerts, barcode / Open Food Facts style fields on products  
- **Accounts**: unified `users` table (customer, guest checkout, manager, admin) with JWT auth  
- **Orders**: checkout → invoices + line items; statuses include `pending`, `paid`, `cancelled`, `shipped`  
- **Payments**: PayPal order creation / capture integrated with invoices  
- **Email**: HTML emails via **Nodemailer** when an order is **placed** (checkout) and when it is marked **shipped** (admin invoice update) — configure `SMTP_*` in `backend/.env`  
- **Admin / reports**: invoices, users, reports, payments (API + web + Android admin areas)  
- **Android app**: shop, cart, checkout, account orders, admin drawer (products, inventory, users, invoices, reports, payments), barcode scanning where implemented  
- **Recommendations** (optional): separate service using embeddings + pgvector (Supabase)

---

## Prerequisites

- **Node.js** 18.x or 20.x (backend + frontend)  
- **MySQL** 8.x (or compatible)  
- **JDK 17+** and **Android Studio** (for `app/`)  
- **Python 3.10–3.12** (only if you run `recommendation/`)

---

## Quick start

### 1. Backend API

```bash
cd backend
npm install
cp .env.example .env   # edit DB_*, JWT_SECRET, optional SMTP_*, FRONTEND_URL
npm run migrate
npm run dev              # default http://localhost:3001
```

- **Swagger UI**: `http://localhost:3001/api-docs`  
- **Health**: `http://localhost:3001/health`  

See [`backend/.env.example`](backend/.env.example) for transactional email variables (`SMTP_HOST`, `SMTP_USER`, `SMTP_PASSWORD`, `EMAIL_FROM`, etc.).

### 2. Frontend (Next.js)

```bash
cd frontend
npm install
# .env.local — point at your API, e.g.:
# NEXT_PUBLIC_API_URL=http://localhost:3001
npm run dev              # default http://localhost:3000
```

### 3. Android app

```bash
cd app
./gradlew :app:assembleDebug
```

Configure API base URL in `app/app/build.gradle.kts` (`API_BASE_URL` / BuildConfig). Emulator often uses `http://10.0.2.2:3001/`. Details: [`app/README.md`](app/README.md).

### 4. Recommendation service (optional)

```bash
cd recommendation
python -m venv .venv && source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env && # edit MySQL + Supabase DATABASE_URL
python main.py
```

---

## Database model (simplified)

Single **`users`** table (roles: `admin`, `manager`, `customer`, `guest`) owns **`invoices`**; **`invoice_items`** reference **`products`**. **`payments`** link to invoices. Stock movements can be recorded when orders ship (see backend invoice service).

More detail: [`ARCHITECTURE.md`](ARCHITECTURE.md) and [`docs/SETUP_GUIDE.md`](docs/SETUP_GUIDE.md).

---

## API overview

Public examples: `GET /health`, `GET /products`, `POST /checkout`, `POST /auth/login`, `POST /auth/register`.  
Protected routes (JWT): products CRUD (by role), `/invoices`, `/users`, `/reports`, `/payments`, account profile/orders, etc.

**Interactive docs**: run the backend and open `/api-docs`.

---

## Testing

```bash
# Backend (Mocha)
cd backend && npm test

# Frontend (Jest)
cd frontend && npm test

# Android — unit tests + JaCoCo report (from repo `app/` Gradle root)
cd app && ./gradlew testDebugUnitTest jacocoTestReport
# Report: app/app/build/reports/jacoco/jacocoTestReport/html/index.html
```

---

## Continuous integration

[`.github/workflows/ci.yml`](.github/workflows/ci.yml) (on `main` / `master` and PRs) runs:

- Backend tests (Node 18 & 20)  
- Frontend tests  
- Android Gradle `check` + `jacocoTestReport` and uploads a **debug APK** artifact  
- Recommendation (Python) checks  

See the workflow file for required **GitHub Actions secrets** (e.g. database + `JWT_SECRET` for backend jobs).

---

## Deployment notes

- **Backend / API**: Node process (`npm start`), `PORT` from environment (e.g. Render). Run migrations against production DB.  
- **Frontend**: `npm run build && npm start` or host on Vercel/similar; set `NEXT_PUBLIC_API_URL` to the public API URL.  
- **Android**: release builds need your own signing config; CI currently publishes **debug** APKs as artifacts.  

Further reading: [`docs/RENDER_DEPLOYMENT.md`](docs/RENDER_DEPLOYMENT.md), [`docs/DOCKER_SETUP.md`](docs/DOCKER_SETUP.md).

---

## Environment variables

| Area | File | Important keys |
|------|------|----------------|
| Backend | `backend/.env` | `DB_*`, `JWT_SECRET`, `PORT`, `CORS_ORIGIN`, PayPal-related vars if used, `SMTP_*` / `EMAIL_FROM` / `FRONTEND_URL` for mail |
| Frontend | `frontend/.env.local` | `NEXT_PUBLIC_API_URL` |
| Android | `app/app/build.gradle.kts` | `API_BASE_URL` (BuildConfig) |
| Recommendations | `recommendation/.env` | MySQL + `DATABASE_URL` (Supabase/pgvector) |

Never commit real `.env` files.

---

## Documentation index

- [`docs/README.md`](docs/README.md) — all guides  
- [`docs/SETUP_GUIDE.md`](docs/SETUP_GUIDE.md) — full setup  
- [`docs/TESTING_GUIDE.md`](docs/TESTING_GUIDE.md) — testing  
- [`ARCHITECTURE.md`](ARCHITECTURE.md) — system architecture  
- [`PROJECT_STRUCTURE.md`](PROJECT_STRUCTURE.md) — layout (may lag behind; prefer table above)

---

## Contributing

Match existing patterns per package (Express layers, Next app router, Kotlin style). Add or update tests when behavior changes. Keep secrets out of git.

---

## License & author

**ISC** — see [`LICENSE`](LICENSE).

## Roadmap ideas

- Deeper E2E / instrumented tests for Android and web  
- Stronger release signing + Play Store pipeline  
- Optional Redis / queue for heavy jobs  
- Richer order tracking (carriers, tracking URLs) in email and API  

---

*For day-to-day API behavior and Android integration details, use Swagger and [`app/README.md`](app/README.md).*
