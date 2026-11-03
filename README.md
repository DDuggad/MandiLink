# MandiLink (ಮಂಡಿಲಿಂಕ್ / मंडीलिंक)

> **Strengthening Market Linkages and Transparent Price Discovery for Remote Farmers**  
> _Smart India Hackathon 2026 Problem Statement:_ **SIH26132** (Sponsor: Government of Maharashtra)  
> _Department of Computer Science & Engineering, B.M.S. College of Engineering, Bengaluru_

---

## 🌾 Project Overview

**MandiLink** is an offline-first, low-data, multilingual mobile Progressive Web Application (PWA) paired with an APMC operations admin web portal. It bridges critical information asymmetry for small and marginal farmers across tier-3 and tier-4 rural regions by providing:

1. **Nearby APMC Mandi Rates:** Geolocation-aware discovery of wholesale markets with real-time modal, minimum, and maximum prices.
2. **Explainable Price Trends & Honest Forecasts:** 7/30/90/180-day historical trends and statistical forecasting (Naive baseline, 7-Day & 30-Day Moving Averages, OLS Linear Trend Regression, and Weekly Day-of-Week Seasonality) rigorously backtested on a 14-day holdout validation with explicit MAPE metrics and explainability cards (no black-box hype).
3. **Local Agricultural Transporters:** Directory of verified rural transporters with transparent per-km rates, vehicle capacity, WhatsApp chat, and one-tap direct phone dialing.
4. **Offline-First & Low-Data Sync:** Service Worker app shell caching + local IndexedDB database, combined with a **delta sync protocol** (`GET /api/sync?since=<timestamp>`) that downloads only modified records to conserve bandwidth on 2G/3G connections.
5. **Multilingual from Day One:** Full native language interface supporting **English**, **Kannada (ಕನ್ನಡ)**, **Hindi (हिन्दी)**, and **Marathi (मराठी)**.
6. **Google Play / TWA Store Ready:** Full PWA manifest compliance (`id`, `categories`, `display_override`), standard (192x192, 512x512) and maskable icons, dual form-factor screenshots (mobile portrait & desktop landscape), and quick action shortcuts.
7. **APMC Operations Admin Portal:** Desktop management portal for single and bulk CSV price entry, mandi and commodity management, and automated Government of India (data.gov.in AGMARKNET) price ingestion with alias matching.

---

## 🏗️ Architecture & Technology Stack

| Layer                    | Technology                   | Key Capabilities                                                                    |
| ------------------------ | ---------------------------- | ----------------------------------------------------------------------------------- |
| **Farmer Mobile App**    | **React 19 + Vite (PWA)**    | Installable PWA, Service Worker (`workbox`), < 110 KB gzipped bundle budget         |
| **Local Storage**        | **IndexedDB (`idb`)**        | Client-side offline cache for mandis, prices, and transporter contacts              |
| **Internationalization** | **i18next + react-i18next**  | Dynamic runtime locale switching (en, kn, hi, mr) without page reload               |
| **Data Visualizations**  | **Lightweight SVG Charts**   | Zero-dependency, responsive, battery-friendly price trend lines                     |
| **Admin Operations**     | **React 19 + Tailwind CSS**  | Desktop web portal with JWT authentication, CRUD, and bulk CSV ingest               |
| **Backend API**          | **Node.js + Express**        | RESTful JSON API, Gzip compression, Helmet security, rate limiting                  |
| **Database**             | **MongoDB Atlas + Mongoose** | Geospatial `2dsphere` indexes for nearby queries, indexed timestamps for delta sync |
| **Data Ingestion**       | **data.gov.in AGMARKNET**    | Open government data resource integration with fallback simulation                  |

---

## 📁 Repository Structure

```text
mandilink/
├── client/                     # Farmer PWA (React + Vite)
│   ├── public/                 # PWA icons, favicon, manifest
│   └── src/
│       ├── components/         # Header, BottomNav, OfflineBanner, Modals, PriceTrendChart
│       ├── pages/              # Home, Prices, Transporters, Settings
│       ├── services/           # api.js (network calls), db.js (IndexedDB local cache)
│       └── i18n/               # en.json, kn.json, hi.json, mr.json
├── admin/                      # APMC Operations Portal (React + Vite)
│   └── src/
│       ├── components/         # Dashboard, PriceEntry, BulkPriceImport, Managers
│       └── services/           # Admin API client with JWT auth
├── server/                     # Express REST API
│   ├── src/
│   │   ├── config/             # MongoDB connection with offline fallback
│   │   ├── models/             # Mandi, Commodity, Price, Transporter, Admin, ImportLog
│   │   ├── routes/             # mandis, commodities, prices, transporters, sync, admin
│   │   ├── services/           # agmarknetImporter.js (data.gov.in integration)
│   │   └── seed/               # Pilot seed data for Karnataka & Maharashtra
├── CLAUDE.md                   # AI pair programming guidelines & mirror rules
├── AGENTS.md                   # Mirror of project standards
└── README.md                   # Project documentation
```

---

## 🚀 Quick Start Guide

### Prerequisites

- **Node.js** v18+ (tested on Node v24.11.0)
- **npm** v9+

### 1. Installation

Clone the repository and install all workspace dependencies from root:

```bash
npm install
```

### 2. Environment Configuration

Copy the sample environment configuration for the backend:

```bash
cp server/.env.example server/.env
```

_(Default settings run in standalone mock/fallback mode without requiring a live MongoDB Atlas cluster, making local testing instant!)_

### 3. Database Seeding (Optional)

To populate a MongoDB database with pilot APMC markets, commodities, 90-day price histories, and transporters:

```bash
npm run seed
```

### 4. Running the Development Servers

Launch the Backend API, Farmer PWA, and Admin Portal concurrently:

```bash
npm run dev
```

The services will start at:

- **Farmer PWA Mobile App:** [http://localhost:5173](http://localhost:5173)
- **Admin Operations Portal:** [http://localhost:5174](http://localhost:5174)
- **Backend REST API:** [http://localhost:5000/api](http://localhost:5000/api)
- **API Health Check:** [http://localhost:5000/api/health](http://localhost:5000/api/health)

_(Default Admin credentials: Username: `admin` | Password: `admin123`)_

---

## 🛠️ Build and Code Quality

```bash
# Verify formatting and linting
npm run lint

# Automatically format all source files with Prettier
npm run format

# Production builds of client and admin
npm run build
```

Bundle verification results:

- **Client (Farmer PWA):** ~102 kB JS + ~4.5 kB CSS (gzip) — _Well under the 200 KB target!_
- **Admin Portal:** ~83 kB JS + ~4.5 kB CSS (gzip)

---

## 📡 API Endpoints

### Public Endpoints (Farmer PWA)

- `GET /api/mandis/nearby?lat=&lng=&radiusKm=&limit=` — Nearby APMC markets with distance calculation
- `GET /api/commodities` — Monitored commodities with multilingual names
- `GET /api/prices?commodityId=&mandiIds=&from=&to=` — Price history series
- `GET /api/prices/latest?commodityIds=&mandiIds=` — Latest modal, min, max price per market
- `GET /api/prices/forecast?commodityId=&mandiId=&horizonDays=7` — 5-model statistical forecast (Naive, MA7, MA30, Linear Trend, Seasonal) with holdout backtest MAPE and baseline comparison
- `GET /api/prices/live-status` — Real-time AGMARKNET ingestion health and timestamp monitor
- `POST /api/prices/sync-live` — Trigger real-time AGMARKNET feed update
- `GET /api/transporters/nearby?lat=&lng=&radiusKm=` — Nearby verified rural drivers with rates
- `GET /api/sync?since=<ISOString>` — **Delta sync endpoint** returning only records changed since last sync timestamp
- `GET /api/health` — Service health and uptime monitor

### Admin Endpoints (JWT Bearer Token Required)

- `POST /api/admin/login` — Authenticate admin user and issue JWT
- `GET / POST / PUT / DELETE /api/admin/mandis` — APMC mandi CRUD operations
- `GET / POST / PUT / DELETE /api/admin/commodities` — Commodity catalogue CRUD operations
- `GET / POST / PUT / DELETE /api/admin/transporters` — Transporter directory CRUD operations
- `POST /api/admin/prices` — Single manual price entry
- `POST /api/admin/prices/bulk` — Batch CSV/JSON price observation upload
- `POST /api/admin/import/agmarknet` — Trigger live Government of India AGMARKNET ingestion
- `GET /api/admin/import/logs` — Ingestion audit logs

---

## 📄 Academic Integrity & Project Status

- Review-1 (Oct 2026): Problem definition & literature review completed.
- Review-2 (Oct 2026): Architecture design, core modules, offline-first PWA, and admin portal implemented.
- Turnitin AI and similarity requirements strictly maintained.
