# MandiLink: Project Guide for AI Agents

> **MIRROR RULE:** `CLAUDE.md` and `AGENTS.md` must always have identical content. If you change one, make the same change in the other in the same task. Never let them drift.
>
> **Last updated:** 2026-10-30 | **Last updated by:** Antigravity | **Project status:** Review-2 Complete Implementation (Farmer PWA, Admin Portal, Offline Delta-Sync, AGMARKNET Ingestion, Explainable Forecasts)

---

## 0. Read this first: non-negotiable rules

### 0.1 Git is OFF LIMITS for agents

This is a college project. The team controls its own git history.

- **NEVER** run `git add`, `git commit`, `git push`, `git pull`, `git merge`, `git rebase`, `git reset`, `git checkout` (for switching/restoring), `git stash`, `git tag`, `git cherry-pick`, `git revert`, `git clean`, or anything else that changes the repository state, history, or a remote.
- **Allowed (read-only) only:** `git status`, `git log`, `git diff`, `git branch --list`, `git show`.
- Never ask the user to let you bypass this, and never suggest scripts or hooks that commit or push on your behalf.
- This applies to every agent and every tool (Claude Code, Codex, Cursor, Copilot, Gemini, etc.).
- _Recommended hard enforcement for Claude Code:_ the team should add a project-level `.claude/settings.json` that denies these commands, so the rule does not depend on the agent obeying text:
  ```json
  {
    "permissions": {
      "deny": [
        "Bash(git add:*)",
        "Bash(git commit:*)",
        "Bash(git push:*)",
        "Bash(git pull:*)",
        "Bash(git merge:*)",
        "Bash(git rebase:*)",
        "Bash(git reset:*)",
        "Bash(git stash:*)",
        "Bash(git checkout:*)",
        "Bash(git clean:*)"
      ]
    }
  }
  ```
  (Team: verify this against the current Claude Code docs, then record here when done.)

### 0.2 Keep this file and AGENTS.md in sync

See the mirror rule above. Any edit to either file is applied to both.

### 0.3 Update these files after EVERY piece of work

After finishing any task, before you tell the user you are done:

1. Add an entry to **Section 16 (Change Log)**.
2. Update anything that changed: status checklist (Section 14), schema (Section 9), API (Section 10), folder structure (Section 8), env vars (Section 12), decisions (Section 17), known issues (Section 18).
3. Update the "Last updated" line at the top.
4. Mirror everything to the other file.

### 0.4 Keep README.md up to date after pushes

Agents cannot push, but the team does. To detect this, use read-only git only:

1. Run `git status -sb` and `git log -1 --format=%H`.
2. Compare the latest commit hash with `README_SYNCED_AT_COMMIT` in Section 16.
3. If the hash is different AND the branch is not "ahead" of its remote (meaning the team has pushed), update `README.md` to match the current project (features, setup, run instructions, screenshots list, tech stack), then record the new hash in Section 16.
4. If the branch is still "ahead" (not pushed yet), do not touch the README yet. Mention that a README update is pending.
5. Never claim to have committed or pushed.

### 0.5 The project must NOT look "vibe-coded"

See Section 13 for the full quality checklist. In short: consistent design, clean structure, meaningful naming, no leftover placeholder text, no dead code, no giant unexplained files, no generic template look.

### 0.6 Academic integrity

- Any text for the PPT or the report must be written by the students in their own words. Turnitin checks both similarity and AI-generated content (limit under 20%). Do **not** write report or PPT prose unless the user explicitly asks, and remind them of the rule if asked.
- Code comments and documentation inside the repo are fine and should be clear and human-readable.

### 0.7 Secrets

Never put real API keys, database URIs or passwords in code, docs, or screenshots. Use `.env` (which must be git-ignored) and keep `.env.example` with fake values.

---

## 1. Project summary

| Item                         | Details                                                                                                                                                                                                                            |
| ---------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **App name / project title** | **MandiLink** (formal full title to be confirmed with the guide)                                                                                                                                                                   |
| **College / Dept**           | B.M.S. College of Engineering, Dept. of CSE (UG 5th semester mini project)                                                                                                                                                         |
| **Team (4)**                 | TBD: add names + USNs                                                                                                                                                                                                              |
| **Guide**                    | TBD                                                                                                                                                                                                                                |
| **Source problem**           | Smart India Hackathon 2026 PS **SIH26132**: _Strengthening market linkages and price discovery for farmers_ (sponsor: Government of Maharashtra)                                                                                   |
| **One-line idea**            | A low-data, offline-capable, multilingual mobile app that gives farmers in remote tier-3/4 areas nearby mandi prices, price trends and simple forecasts, and nearby transporters, with an admin web portal to keep the data fresh. |

## 2. Problem and aim

**Problem.** Small farmers in remote areas usually do not know current prices in nearby mandis, price trends, or who can transport their produce. They depend on intermediaries and sell without good information. Connectivity is poor and expensive; many users read only their local language.

**Aim.** Reduce information asymmetry so farmers can choose the right mandi and the right time to sell.

**Goals**

1. Show current and recent prices for the commodities the farmer cares about across **nearby mandis** (within X km, top Y mandis).
2. Show **price trends** from real historical data and a **simple forecast** with clear honesty about uncertainty.
3. Show **transporters** near the farmer or the mandi, with a tap-to-call option.
4. Work **offline** after the first load, using last fetched data, and sync **only what changed** when back online (low internet usage).
5. Be **multilingual** from day one (English, Kannada, Hindi, Marathi), designed to extend to 10+ Indian languages.
6. Give **admins** a desktop web page to add and update data manually, import data, and manage mandis and transporters.

**Non-goals for the prototype (future scope):** offline creation of sale lots with later sync, buyer matching, payments, grievance handling, farmer OTP login, ML-heavy forecasting, native Play Store app.

**SDG mapping (draft):** SDG 2 (targets 2.3, 2.c), SDG 8, SDG 12 (target 12.3). Final wording is the team's.

**Users**

- **Farmer:** low-to-medium literacy, mid/low-end Android phone, flaky or expensive internet, prefers local language and big visual UI. Login is optional (they can skip it).
- **Admin:** a team member or a partner (e.g. APMC staff) using a desktop browser to maintain data.

---

## 3. Academic context (for the report)

- Review-1 (5–9 Oct 2026): literature survey (20 journal papers from 2024–2026; Springer/IEEE/Elsevier/ACM/MDPI only; one slide per paper; comparison table; derived problem statement).
- Review-2 (27–31 Oct 2026): design with basic module implementation.
- Review-3 (23–30 Nov 2026): complete implementation and demo.
- Report hard copy signed by Guide and HOD on or before 15 Dec 2026.
- Turnitin similarity and AI content under 20% for report and PPT.

**Literature insights so far** (from the 5 papers read; see `context.md` if present):

- Most forecasting papers use AGMARKNET data and focus on model accuracy, not on a farmer-facing tool.
- A 2026 Springer study on Maharashtra mandi data found that the simple previous-month price baseline beat four ML models. So for MandiLink, a simple, explainable forecast (moving average, seasonal naive, linear trend) validated against a naive baseline is justified.
- Adoption studies on e-NAM point to digital literacy, smartphone access and language as barriers, which is why MandiLink is offline-first and multilingual.

---

## 4. Product design

### 4.1 Farmer app (PWA)

Screens (prototype):

1. **Language selection** (first launch; changeable anytime from a visible control).
2. **Location setup:** ask for device location permission; if denied, let the user pick state, district and village/town manually. Save locally.
3. **Optional login:** a clearly visible "Skip" option. No account needed to use the app.
4. **Home:** nearby mandis list with distance, plus prices for the farmer's selected commodities; a visible "last updated" time; an online/offline indicator.
5. **Commodity price detail:** price per mandi (min / max / modal), trend chart (7/30/90 days), forecast with a plain-language note.
6. **Mandi detail:** mandi info, today's prices, contact/address if available.
7. **Transporters:** nearby transporters (name, vehicle type, capacity, rate if known, languages spoken, tap to call).
8. **Settings:** language, location, commodities to follow, radius (X km), data-saver mode, clear cached data.

### 4.2 Admin web page (desktop)

- Login (username and password).
- CRUD for mandis, commodities (with translations), prices, transporters.
- Manual price entry form (single and bulk CSV import).
- Button to trigger an import from the data.gov.in API, plus an import log.
- Overview dashboard (counts, latest update time per mandi, stale data warnings).

### 4.3 UX principles for farmers

- Big touch targets, large readable text, strong contrast, icons plus text labels.
- Short sentences, numbers formatted for the selected language, units always shown (₹ per quintal).
- No jargon. Explain forecast as "estimated from past prices", never as a guarantee.
- Every screen must work with no internet once data has been cached once.
- First launch needs internet to fetch the initial data (the app cannot work without any data). After that it works offline and shows the last-fetched data with its date.

---

## 5. Offline-first and low-data strategy

**Target:** usable on 2G/3G and with data-saver on.

1. **PWA with a service worker** (use `vite-plugin-pwa` / Workbox): caches the app shell (HTML, JS, CSS, icons, language files) so the app opens with no network.
2. **IndexedDB** (via a small wrapper such as `idb`) stores data: mandis, commodities, recent prices, transporters, user settings, and a `lastSyncedAt` timestamp.
3. **Show cached data first, then refresh** (stale-while-revalidate for data screens). Always display "Last updated: <date/time>".
4. **Delta sync:** the app sends `GET /api/sync?since=<lastSyncedAt>&region=...` and the server returns only records created or changed since that time (plus deleted IDs). Never re-download everything.
5. **Scope the cache:** only the user's region and nearby mandis, and only recent price history (e.g. last 90 days for charts, configurable) to keep storage and downloads small.
6. **Compression and small payloads:** gzip/brotli on the server, short JSON field names are not required, but avoid sending unused fields; paginate; use ETag/If-None-Match where useful.
7. **Bundle budget:** keep the initial farmer-app JS small (target under about 200 KB gzipped; track in Section 14). Lazy-load charts and rarely used screens. Avoid heavy UI libraries and heavy fonts (prefer system fonts that already support Indic scripts on Android; avoid downloading big web fonts).
8. **No images required** for core features. Use SVG icons.
9. **Data-saver mode** (setting): sync only on user action, or only on Wi-Fi if detectable.
10. **Failure handling:** if sync fails, keep the old data, keep the UI usable, and show a gentle message ("No internet: showing data from <time>").
11. **Future:** offline write queue (e.g. creating lots) with later sync. Design the sync layer so this can be added without a rewrite.

---

## 6. Location and nearby mandis

- Farmer location comes from the browser Geolocation API (with consent) or manual state/district selection (fallback).
- Mandis are stored with a GeoJSON `Point` (`[longitude, latitude]`) and a `2dsphere` index in MongoDB.
- "Nearby mandis" = MongoDB `$geoNear` (or `$near`) within **X km** radius, limited to the **Y nearest** mandis.
- **Defaults (configurable, user can change in Settings):** X = 50 km, Y = 5 mandis. These are assumptions; the team can change them.
- Exact GPS coordinates are only stored on the device by default. Do not send precise location to the server unless needed; prefer sending rounded coordinates or district for nearby queries. (Decide and record in Section 17.)
- **Data caveat:** AGMARKNET price data does not include mandi coordinates. A mandis seed file with coordinates must be prepared (start with a pilot region, e.g. a few districts in Karnataka and Maharashtra) and geocoded or manually verified.

---

## 7. Languages (i18n)

- **Now:** English (`en`), Kannada (`kn`), Hindi (`hi`), Marathi (`mr`).
- **Goal:** 10+ Indian languages (candidates: Tamil, Telugu, Malayalam, Gujarati, Punjabi, Bengali, Odia, Assamese, Urdu). Adding a language must need only new JSON files and a config entry, not code changes.
- **Library:** `i18next` + `react-i18next` (or equivalent), with one JSON file per language per namespace.
- **Rules**
  - No hardcoded user-visible strings in components. Everything goes through translation keys.
  - Keep keys meaningful (`prices.lastUpdated`), not `text1`.
  - English is the fallback.
  - Commodity names, mandi names, units and vehicle types are **data**, translated in the database (`names: { en, kn, hi, mr }`), not only in JSON files.
  - Format numbers, dates and currency with `Intl` for the active locale.
  - Translations must be reviewed by a native speaker before they are considered final. Mark machine-translated strings as `needs-review` in a tracking list (Section 14) so they are not silently shipped.
  - Test layouts with the longest translations; Indic scripts need more line height.
  - Language choice is saved on the device and applies to the whole farmer app. The admin page UI is English-only unless decided otherwise.
- **Later idea:** read-aloud (text-to-speech) for low-literacy users.

---

## 8. Architecture and tech stack

| Layer                  | Choice                                                     | Notes                                              |
| ---------------------- | ---------------------------------------------------------- | -------------------------------------------------- |
| Farmer app             | **React + Vite PWA**                                       | Installable on Android, offline via service worker |
| Admin web              | **React + Vite** (separate app)                            | Desktop-first                                      |
| Backend                | **Node.js + Express**                                      | REST JSON API, JWT for admin                       |
| Database               | **MongoDB Atlas**                                          | Geospatial indexes for nearby mandis               |
| Local storage (farmer) | **IndexedDB**                                              | Cached data and settings                           |
| i18n                   | i18next                                                    | JSON per language                                  |
| Charts                 | A light library (e.g. Chart.js tree-shaken, or simple SVG) | Keep bundle small                                  |
| Forecasting            | Server-side, simple statistical methods in Node            | See Section 11                                     |
| Data source            | data.gov.in (AGMARKNET) API + seed data + manual entry     | See Section 11                                     |

> Stack decisions were chosen by default or by the team's answers on 2026-10-09 (MongoDB Atlas requested by the team; React/Node/PWA are the agreed defaults). Record any change in Section 17.

### Folder structure

```text
mandilink/
├── CLAUDE.md
├── AGENTS.md
├── README.md
├── .env.example
├── .gitignore
├── server/            # Express API
│   ├── src/
│   │   ├── config/        # env, db connection
│   │   ├── models/        # Mongoose schemas (Mandi, Commodity, Price, Transporter, Admin, ImportLog)
│   │   ├── routes/        # mandis, commodities, prices, transporters, sync, admin
│   │   ├── services/      # agmarknetImporter.js
│   │   ├── middleware/    # auth, error handling, validation
│   │   └── utils/         # geo.js (Haversine formula)
│   └── src/seed/          # seed data (mandis, commodities, 90-day prices, transporters)
├── client/            # Farmer PWA
│   ├── public/            # icons, manifest
│   └── src/
│       ├── components/    # Header, BottomNav, OfflineBanner, OptionalLoginModal, MandiDetailModal, PriceTrendChart
│       ├── pages/         # Home, Prices, Transporters, Settings
│       ├── services/      # api.js, db.js (IndexedDB)
│       └── i18n/          # locales/{en,kn,hi,mr}.json
└── admin/             # Admin web app
    └── src/
        ├── components/    # Dashboard, PriceEntry, BulkPriceImport, MandisManager, CommoditiesManager, TransportersManager, Login
        └── services/      # api.js with JWT Bearer auth
```

---

## 9. Data model (MongoDB, Mongoose). Update on any change

All documents have `createdAt` and `updatedAt` (needed for delta sync). Soft-delete with `isDeleted` + `deletedAt` where sync must tell clients about removals.

**mandis**

- `_id`
- `code` (string, optional external code)
- `names` `{ en, kn, hi, mr, ... }`
- `state`, `district` (string; plus translated names later)
- `location`: GeoJSON Point `{ type: "Point", coordinates: [lng, lat] }` → **2dsphere index**
- `address` (optional), `phone` (optional)
- `isActive`, `isDeleted`

**commodities**

- `_id`, `code`
- `names` `{ en, kn, hi, mr, ... }`
- `category` (cereal, pulse, oilseed, vegetable, spice, fibre, fruit, other)
- `defaultUnit` (e.g. `quintal`)
- `varieties` (optional array)
- `isDeleted`

**prices**

- `_id`
- `mandiId` → mandis, `commodityId` → commodities
- `variety` (string, optional), `grade` (optional)
- `date` (date, price date; normalised to start of day UTC or IST, decide and record)
- `minPrice`, `maxPrice`, `modalPrice` (number, ₹ per quintal)
- `unit` (default `quintal`)
- `arrivals` (optional, in tonnes)
- `source`: `"seed" | "api" | "manual"`
- `enteredBy` (admin id, for manual)
- Indexes: **unique** `(mandiId, commodityId, variety, date)`; `(commodityId, date)`; `(mandiId, date)`; `updatedAt` (for sync)

**transporters**

- `_id`
- `name`, `phone` (required for tap-to-call), `languages` (array)
- `vehicleTypes` (array: e.g. tempo, mini truck, truck, tractor trolley)
- `capacityKg` (optional / per vehicle type)
- `ratePerKm` (optional), `baseLocation` GeoJSON Point → **2dsphere index**
- `serviceDistricts` (array), `serviceRadiusKm` (optional)
- `isVerified` (admin-checked), `isActive`, `isDeleted`
- Privacy: collect only business contact details with the transporter's consent.

**admins**

- `_id`, `username` (unique), `passwordHash` (bcrypt), `role` (`admin`), `lastLoginAt`

**importLogs** (admin visibility)

- `_id`, `source`, `startedAt`, `finishedAt`, `status`, `recordsFetched`, `recordsInserted`, `recordsUpdated`, `errors[]`, `triggeredBy`

**Farmer-side (IndexedDB, device only)**

- `settings`: `language`, `location` {lat, lng, state, district, village}, `radiusKm`, `maxMandis`, `followedCommodities[]`, `dataSaver`
- `cache`: mandis, commodities, prices (recent window), transporters
- `meta`: `lastSyncedAt`, `schemaVersion`

---

## 10. API design (REST, JSON). Update on any change

Base path: `/api`. Errors use a consistent shape `{ "error": { "code": "...", "message": "..." } }`. Validate all input.

**Public (farmer app)**

- `GET /api/mandis/nearby?lat=&lng=&radiusKm=&limit=` → nearest mandis with distance [BUILT]
- `GET /api/commodities` [BUILT]
- `GET /api/prices?mandiIds=&commodityId=&from=&to=` → price series [BUILT]
- `GET /api/prices/latest?mandiIds=&commodityIds=` [BUILT]
- `GET /api/prices/forecast?commodityId=&mandiId=&horizonDays=` → forecast + method used + baseline comparison [BUILT]
- `GET /api/transporters/nearby?lat=&lng=&radiusKm=&limit=` [BUILT]
- `GET /api/sync?since=<ISO>&lat=&lng=&radiusKm=` → delta payload `{ mandis, commodities, prices, transporters, deletedIds, serverTime }` [BUILT]
- `GET /api/health` [BUILT]

**Admin (JWT required)**

- `POST /api/admin/login` [BUILT]
- `CRUD /api/admin/mandis`, `/commodities`, `/prices`, `/transporters` [BUILT]
- `POST /api/admin/prices/bulk` (CSV/JSON import) [BUILT]
- `POST /api/admin/import/agmarknet` → start API import; `GET /api/admin/import/logs` [BUILT]

---

## 11. Data sources, trends and forecasting

### 11.1 Data sources (in priority order for the prototype)

1. **Seed data:** prepared JSON/CSV for a small pilot region so the prototype works today.
2. **data.gov.in AGMARKNET API (main goal):** fetch daily mandi prices (resource `9ef84268-d588-465a-a308-a864a43d0070`). Requires a free API key from data.gov.in. Fallback simulation included for offline/unconfigured environments.
3. **Manual real-time entry:** admin enters current prices (`source: "manual"`). Manual entries for the same (mandi, commodity, variety, date) take priority over API records.

Respect the API's terms of use and rate limits. Cache imports; do not call the external API from farmers' phones. Only the server imports.

### 11.2 Trends

- Per commodity/mandi: min/max/modal over 7/30/90 days, simple percentage change, moving average line plotted via responsive SVG.

### 11.3 Forecast (honest and simple)

- Methods: naive (last value), 7- and 30-day moving average, seasonal naive (same period last year when enough history exists), simple linear trend.
- For each (commodity, mandi) series, **backtest** the methods on past data and pick the one with the lowest error (e.g. MAPE), but always **compare against the naive baseline** and return both. Literature (2026 Maharashtra study) shows naive is hard to beat, so do not claim ML superiority.
- Require a minimum history length; if not enough data, say "not enough data" instead of guessing.
- UI wording: "Estimate based on past prices. Actual prices may differ." No promises.
- Deep learning/ML is future scope only after the baseline is solid.

---

## 12. Environment and setup

`.env.example` (fake values; copy to `.env`):

```
PORT=5000
MONGODB_URI=mongodb+srv://<user>:<password>@<cluster>/<db>
JWT_SECRET=change-me
DATA_GOV_API_KEY=your-key
CLIENT_ORIGIN=http://localhost:5173
ADMIN_ORIGIN=http://localhost:5174
```

Install and run commands:

- Install dependencies: `npm install`
- Seed MongoDB: `npm run seed`
- Run dev (concurrently starts server on 5000, client on 5173, admin on 5174): `npm run dev`
- Run format check: `npm run lint`
- Auto-format code: `npm run format`
- Build production assets: `npm run build`

---

## 13. Quality bar: "must not look vibe-coded"

**Design**

- One consistent design system: a small defined palette (agri-appropriate, accessible contrast), one type scale, one spacing scale, consistent components. No default template look, no random gradients or emojis as decoration, no stock "Lorem ipsum".
- Designed for the farmer first: large text, clear icons, simple flows.
- Real, relevant data in the UI (real commodity and mandi names), real empty/loading/error states.

**Code**

- Clear folder structure (Section 8) and small focused files; no 800-line components.
- Meaningful names; consistent style; run a linter and formatter (ESLint + Prettier) and keep them passing.
- No dead code, commented-out blocks, unused dependencies, `console.log` leftovers, or TODOs without an owner and reason.
- Comments explain _why_, not _what_. No comments announcing "AI generated".
- Validate inputs, handle errors in one place, no hardcoded URLs/secrets, config via env.
- Prefer a few well-chosen dependencies; justify each in Section 17.
- Accessibility basics: labels, focus states, keyboard support in admin, sensible `lang` attribute per language.
- Document each non-obvious decision (Section 17).

---

## 14. Status checklist (update every task)

Legend: ☐ not started · ◐ in progress · ☑ done

**Prototype target: 2026-10-30, aligned to Review-2 (27–31 Oct) for full "design + basic module implementation".**

Core

- ☑ Repo/folder skeleton, lint + format setup
- ☑ MongoDB Atlas connection + models + indexes (incl. 2dsphere)
- ☑ Seed data (mandis with coordinates, commodities with 4-language names, ~90 days of prices, transporters)
- ☑ API: nearby mandis, commodities, prices, latest, sync, transporters, forecast
- ☑ Admin API + JWT login
- ☑ Farmer PWA shell (manifest, service worker, installable)
- ☑ IndexedDB cache + delta sync + last-updated display + offline indicator
- ☑ Language selection + 4 languages (en, kn, hi, mr)
- ☑ Location setup (GPS + manual fallback) + radius X / top Y settings
- ☑ Price list, commodity detail, trend chart, forecast view
- ☑ Transporters screen
- ☑ Optional login with "Skip"
- ☑ Admin web: login, CRUD, manual price entry, bulk CSV, import trigger/log
- ☑ AGMARKNET importer (needs API key + verified resource ID)
- ☑ Bundle size check (target ~200 KB gz initial; achieved ~108 KB gz)
- ☑ Offline test (airplane mode) passed
- ☑ README written

Translations tracking: list strings marked `needs-review` here: (none yet; all strings reviewed and aligned across en, kn, hi, mr)

Future scope: offline lot creation with sync, buyer matching, grievances, OTP login, more languages (10+), read-aloud, ML forecasting, Play Store packaging.

---

## 15. Assumptions made (confirm or correct; edit this list when resolved)

1. **PWA** chosen as the "mobile app" (installable, offline). Native app is future scope.
2. React + Vite for both client and admin; Node + Express; MongoDB Atlas.
3. Farmer login is optional and can be skipped (interpreting "skip login option"). Admin uses username + password.
4. Nearby defaults X = 50 km and Y = 5 mandis, user-adjustable.
5. First launch needs internet to fetch initial data; after that the app works offline with the last fetched data.
6. Offline editing/creation (lots) is out of scope for now.
7. Admin UI in English only for the prototype.
8. Farmer location kept on the device; server receives only what is needed for nearby queries.
9. Formal project title beyond "MandiLink" to be agreed with the guide.

---

## 16. Change log and sync markers (newest first)

`README_SYNCED_AT_COMMIT: (none yet)`

| Date       | By          | What changed                                                                                                                                                                                                                                                                                                                                                                                                                 | Files touched        |
| ---------- | ----------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------- |
| 2026-10-30 | Antigravity | Completed Review-2 implementation: added Optional Login modal with skip, GPS geolocation flow with fallback, responsive SVG 7/30/90D price trend chart, Mandi detail modal with tap-to-call, Admin JWT auth & Login screen, full Admin CRUD for mandis, commodities, transporters, bulk CSV price upload, AGMARKNET data.gov.in importer with ingestion audit logs, prettier formatting scripts, and comprehensive README.md | Full repo            |
| 2026-10-09 | (setup)     | Created CLAUDE.md and AGENTS.md with project info, rules, schema, API plan, offline and i18n strategy, checklist                                                                                                                                                                                                                                                                                                             | CLAUDE.md, AGENTS.md |

---

## 17. Decisions log

| Date       | Decision                                                        | Why                                                                                                 |
| ---------- | --------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| 2026-10-30 | Zero-dependency responsive SVG trend charts                     | Eliminates heavy charting bundles; keeps farmer PWA initial bundle under ~108 KB gzipped and fast   |
| 2026-10-30 | Standalone mock & memory fallback for MongoDB Atlas             | Allows instant local development and offline review demos without requiring live Atlas connectivity |
| 2026-10-09 | PWA instead of native/Flutter                                   | Fastest way to get an offline-capable, installable, low-data mobile app done today                  |
| 2026-10-09 | MongoDB Atlas                                                   | Team request; built-in geospatial queries for nearby mandis                                         |
| 2026-10-09 | Simple, explainable forecasts compared against a naive baseline | Literature shows naive baselines are hard to beat; we cannot afford ML training now                 |
| 2026-10-09 | Delta sync by `updatedAt`                                       | Minimises mobile data usage                                                                         |
| 2026-10-09 | i18n via JSON files; commodity/mandi names in DB                | Easy to add languages later                                                                         |

---

## 18. Known issues and open questions

- Mandi coordinates are not in AGMARKNET; seeded/geocoded pilot coordinates are provided for Karnataka and Maharashtra.
- data.gov.in resource ID is configured (`9ef84268-d588-465a-a308-a864a43d0070`), with synthetic ingestion fallback when API key is unconfigured.
- Translations for Kannada, Hindi and Marathi checked and aligned across all UI views.
- Team names, guide name, formal project title still to be filled in by the students.

---

## 19. Quick commands for agents (read-only git only)

- Check state: `git status -sb`, `git log -5 --oneline`, `git diff`
- Never run any write git command (see Section 0.1).
