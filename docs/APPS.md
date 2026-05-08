# Enterprise Apps — Full Reference

All 24 apps live in `apps/`. Each is a standalone **Next.js 15 App Router** project using TypeScript, JWT auth via **jose**, and password hashing via **bcryptjs**. They run fully offline — all data is seeded in-memory at startup using a deterministic LCG random generator.

---

## How Every App Works (Shared Architecture)

### Frontend
| Layer | File | Purpose |
|-------|------|---------|
| Root layout | `app/layout.tsx` | HTML shell, global CSS |
| Auth layout | `app/(app)/layout.tsx` | Renders `<AppShell>` (nav + header) |
| Pages | `app/(app)/*/page.tsx` | Each protected page |
| Shell | `components/AppShell.tsx` | Sidebar nav, logout button |
| Styles | `app/globals.css` | Dark-theme CSS variables, flex charts |

### Backend
| Layer | File | Purpose |
|-------|------|---------|
| Auth | `lib/auth.ts` | `getSessionUser()` reads JWT from cookie via **jose** |
| Types | `lib/types.ts` | All TypeScript interfaces |
| Store | `lib/store.ts` | Singleton in-memory data seeded at startup |
| Queries | `lib/queries.ts` | Pure functions that read from the store |
| Login API | `app/api/auth/login/route.ts` | POST → validates password, sets JWT cookie |
| Logout API | `app/api/auth/logout/route.ts` | POST → clears cookie |
| Middleware | `middleware.ts` | Protects all `/(app)/*` routes; redirects unauthenticated users to `/login` |

### Authentication Flow
1. User visits any `/(app)/*` route → middleware checks for JWT cookie
2. No valid JWT → redirect to `/login`
3. POST `/api/auth/login` with `{ username, password }` → server returns signed JWT cookie (12 h expiry, HS256)
4. Subsequent requests carry the cookie → middleware validates with **jose** `jwtVerify`

### Running a Single App
```bash
cd apps/<app-folder>
npm install
npm run dev       # dev server (hot reload)
npm run build     # production build
npm start         # serve production build
```

---

## Apps 00–13 — Enterprise Business Suite

### 00 — Dashboard (`00-dashboard`) · Port 3000
**Password:** `admin123`

Central executive dashboard aggregating KPIs from all business units.

**Pages:** Overview, Analytics, Reports, Team, Settings  
**Key features:** Revenue charts (CSS flex bars), user activity heatmap, department KPI cards, trend lines.  
**Backend highlights:** Single unified store seeding cross-domain metrics; queries return pre-aggregated stats.

---

### 01 — Kanban (`01-kanban`) · Port 3001
**Password:** `kanban123`

Project management board with drag-and-drop style task tracking.

**Pages:** Board, Projects, Tasks, Team, Settings  
**Key features:** Swimlane columns (To Do / In Progress / Review / Done), priority badges, assignee avatars, sprint burndown bar.  
**Backend highlights:** `KanbanTask` store with status, priority, assignee, and sprint fields.

---

### 02 — HR Portal (`02-hr-portal`) · Port 3002
**Password:** `hr123`

Human resources management system covering employees, payroll, and recruitment.

**Pages:** Dashboard, Employees, Payroll, Recruitment, Training  
**Key features:** Headcount by department bar chart, salary distribution, open role pipeline funnel, training completion %.  
**Backend highlights:** `Employee` store with department, salary, role, status, and hire date.

---

### 03 — Document Management (`03-document-mgmt`) · Port 3003
**Password:** `docs123`

Enterprise document repository with version control and access tracking.

**Pages:** Dashboard, Documents, Categories, Access, Audit  
**Key features:** Storage usage bars, document status matrix, category tree, access log table.  
**Backend highlights:** `Document` store with version, category, owner, and access-level fields.

---

### 04 — Notifications (`04-notifications`) · Port 3004
**Password:** `notify123`

Multi-channel notification centre (email, SMS, push, webhook).

**Pages:** Dashboard, Channels, Templates, Log, Settings  
**Key features:** Delivery rate bars per channel, template preview, live activity log, failure analysis.  
**Backend highlights:** `Notification` store with channel, template, delivery status, and timestamp.

---

### 05 — Casino (`05-casino`) · Port 3005
**Password:** `casino123`

Online gaming operations console tracking games, players, and revenue.

**Pages:** Dashboard, Games, Players, Revenue, Compliance  
**Key features:** Game popularity bars, active player counts, daily GGR chart, compliance flag log.  
**Backend highlights:** `GameSession` store with game type, player, wager, outcome, and revenue.

---

### 05 — CRM (`05-crm`) · Port 3005 (alt)
**Password:** `crm123`

Customer relationship management with deals, contacts, and pipeline tracking.

**Pages:** Dashboard, Contacts, Deals, Pipeline, Activities  
**Key features:** Deal pipeline funnel, contact segments, revenue forecast bars, activity timeline.  
**Backend highlights:** `Deal` and `Contact` store with stage, value, and owner fields.

---

### 06 — Trading (`06-trading`) · Port 3006
**Password:** `trade123`

Financial trading platform with portfolio, orders, and market data.

**Pages:** Dashboard, Portfolio, Orders, Markets, Risk  
**Key features:** P&L bars, open position table, order book simulation, VaR risk gauge.  
**Backend highlights:** `Position` and `Order` store with symbol, quantity, price, and P&L.

---

### 07 — Health (`07-health`) · Port 3007
**Password:** `health123`

Healthcare management covering patients, appointments, and lab results.

**Pages:** Dashboard, Patients, Appointments, Lab Results, Staff  
**Key features:** Patient admission bars, appointment calendar heat, lab result status matrix.  
**Backend highlights:** `Patient` and `Appointment` store with diagnosis, status, and department.

---

### 08 — Supply Chain (`08-supply-chain`) · Port 3008
**Password:** `supply123`

Supply chain visibility platform tracking inventory, suppliers, and shipments.

**Pages:** Dashboard, Inventory, Suppliers, Shipments, Analytics  
**Key features:** Stock level bars (with reorder threshold lines), shipment status pipeline, supplier scorecard.  
**Backend highlights:** `InventoryItem` and `Shipment` store with quantity, SKU, supplier, and ETA.

---

### 09 — Realty (`09-realty`) · Port 3009
**Password:** `realty123`

Real estate portfolio management with properties, listings, and transactions.

**Pages:** Dashboard, Properties, Listings, Transactions, Analytics  
**Key features:** Property value distribution bars, listing status funnel, transaction volume chart.  
**Backend highlights:** `Property` store with address, value, type, status, and occupancy.

---

### 10 — Legal (`10-legal`) · Port 3010 (alt)
**Password:** `legal123`

Legal matter management with cases, contracts, and billing.

**Pages:** Dashboard, Cases, Contracts, Billing, Deadlines  
**Key features:** Case status matrix, contract expiry countdown bars, billing utilisation %, deadline calendar.  
**Backend highlights:** `LegalCase` and `Contract` store with matter type, stage, attorney, and billing hours.

---

### 11 — Manufacturing (`11-manufacturing`) · Port 3011 (alt)
**Password:** `mfg123`

Manufacturing operations covering production lines, quality control, and maintenance.

**Pages:** Dashboard, Production, Quality, Maintenance, Inventory  
**Key features:** OEE bars per line, defect rate trends, maintenance schedule calendar, WIP inventory levels.  
**Backend highlights:** `ProductionRun` and `QualityEvent` store with line, shift, units, and defect count.

---

### 12 — Finance (`12-finance`) · Port 3012 (alt)
**Password:** `finance123`

Corporate finance with GL, budgets, forecasts, and expense reports.

**Pages:** Dashboard, General Ledger, Budget, Forecast, Expenses  
**Key features:** Actual vs. budget variance bars, GL balance sheet, expense category breakdown, 12-month forecast trend.  
**Backend highlights:** `GLEntry` and `Budget` store with account, period, actuals, and forecast values.

---

### 13 — PMO (`13-pmo`) · Port 3013 (alt)
**Password:** `pmo123`

Project Management Office tracking programmes, projects, risks, and resources.

**Pages:** Dashboard, Projects, Risks, Resources, Reports  
**Key features:** Portfolio health heatmap, risk matrix (probability × impact), resource utilisation bars, RAG status rollup.  
**Backend highlights:** `Project` and `Risk` store with budget, schedule variance, owner, and risk level.

---

## Apps 14–23 — Space & Aerospace Operations Suite

All space apps share the same auth architecture. The cookie name and default password differ per app (see table below).

| # | App | Cookie | Password | Accent |
|---|-----|--------|----------|--------|
| 14 | APOLLO CMD | `apollo_session` | `mission123` | Orange |
| 15 | STARFIRE | `starfire_session` | `launch123` | Red |
| 16 | ORION TRACK | `orion_session` | `orbital123` | Blue |
| 17 | NEXUS TLM | `nexus_tlm_session` | `tlm123` | Green |
| 18 | ARTEMIS OPS | `artemis_session` | `crew123` | Teal |
| 19 | RAPTOR LAB | `raptor_session` | `propulsion123` | Amber |
| 20 | ATLAS OPS | `atlas_session` | `payload123` | Purple |
| 21 | SENTINEL | `sentinel_session` | `range123` | Red |
| 22 | DEEP SPACE | `dsn_session` | `dsn123` | Cyan |
| 23 | VANGUARD | `fleet_session` | `fleet123` | Slate |

---

### 14 — Mission Control (`14-mission-control`) · Port 3014
**App name:** APOLLO CMD

Space mission command and control centre tracking active and historical missions.

**Pages:**
- **Dashboard** — Active missions count, spacecraft online, crew in orbit, critical alerts; mission timeline
- **Missions** — Full mission list: status badge, launch date, inclination, crew size, orbit type
- **Spacecraft** — Vehicle registry with subsystem health bars (power, thermal, comms, propulsion)
- **Telemetry** — Live telemetry stream table: signal strength, battery, temperature, status indicator
- **Alerts** — Active anomaly log with severity badges and acknowledgement status

**Data model highlights:** `Mission`, `Spacecraft`, `TelemetryReading` — deterministic data seeded for 12 missions, 8 spacecraft, and a rolling telemetry buffer.

---

### 15 — Launch Operations (`15-launch-ops`) · Port 3015
**App name:** STARFIRE

Launch campaign management from assembly to liftoff.

**Pages:**
- **Dashboard** — Upcoming launches count, vehicles in processing, weather holds, launch windows; next launch countdown
- **Launches** — Campaign table: vehicle, pad, window, payload mass, status badge
- **Vehicles** — Rocket fleet cards with stage count, flight heritage, and readiness indicator
- **Weather** — Launch site weather: wind, visibility, ceiling, lightning probability, GO/NO-GO
- **Scrubs** — Historical scrub log with reason codes, duration, and recovery action

**Data model highlights:** `LaunchCampaign`, `LaunchVehicle`, `WeatherWindow` — 10 campaigns across two pads.

---

### 16 — Orbital Mechanics (`16-orbital`) · Port 3016
**App name:** ORION TRACK

Satellite constellation tracking and orbital analysis tool.

**Pages:**
- **Dashboard** — Total tracked objects, active satellites, debris count, conjunction alerts; orbital regime distribution bars
- **Objects** — Full catalogue table: NORAD ID, type, orbit (LEO/MEO/GEO/HEO), inclination, altitude
- **Conjunctions** — Close-approach events: TCA, miss distance, probability of collision, mitigation actions
- **Manoeuvres** — Planned delta-V burns: object, burn date, delta-V magnitude, purpose
- **Ground Stations** — Station coverage map table: location, elevation mask, supported bands, passes today

**Data model highlights:** `OrbitalObject`, `Conjunction`, `Manoeuvre` — 40+ tracked objects, 15 conjunctions.

---

### 17 — Telemetry (`17-telemetry`) · Port 3017
**App name:** NEXUS TLM

Deep telemetry monitoring system for multi-spacecraft fleet.

**Pages:**
- **Dashboard** — Spacecraft online, nominal channels, warning/caution counts, data rate; health matrix
- **Spacecraft** — Per-vehicle deep-dive: subsystem status, last contact time, orbit, battery %
- **Channels** — All telemetry channels: engineering unit, current value, limits (red/yellow), status
- **Anomalies** — Anomaly log: channel, value at trigger, severity, duration, resolution status
- **Reports** — Aggregated health reports by vehicle and time period

**Data model highlights:** `TelemetryChannel`, `Anomaly` — 200+ channels across 8 spacecraft with realistic engineering values.

---

### 18 — Crew Operations (`18-crew`) · Port 3018
**App name:** ARTEMIS OPS

Crew management, scheduling, and health monitoring for human spaceflight.

**Pages:**
- **Dashboard** — Crew in orbit, upcoming EVAs, certifications expiring, open medical flags; crew roster cards
- **Crew** — Full crew directory: role, mission, status, training level, certification list
- **Schedule** — Weekly crew activity schedule: task type, duration, priority, crew assignment
- **EVA** — Extravehicular activity log: EVA number, crew, duration, objectives, outcome
- **Medical** — Health monitoring: crew member, metric, value, trend, flag status

**Data model highlights:** `CrewMember`, `EVARecord`, `MedicalRecord` — 12 crew members across active and standby rotations.

---

### 19 — Propulsion (`19-propulsion`) · Port 3019
**App name:** RAPTOR LAB

Rocket engine test and performance data management system.

**Pages:**
- **Dashboard** — Total engines, operational count, total test firings, failed tests; engine performance matrix; recent test runs table
- **Engines** — Engine cards: thrust (kN), specific impulse (Isp vacuum), propellant type, status, chamber pressure
- **Tests** — Full test run log: engine, date, duration, thrust achieved, chamber pressure, pass/partial/fail result
- **Performance** — Isp vacuum bars, thrust comparison bars, pass-rate bars per engine
- **Components** — Component inventory: part number, material, quantity, status (in-stock/low/out), supplier

**Data model highlights:** `Engine`, `TestRun`, `EngineComponent` — 8 engines (Merlin, Raptor, RL-10, etc.), 50 test runs, 60 components.

---

### 20 — Payload (`20-payload`) · Port 3020
**App name:** ATLAS OPS

Payload integration and manifest management for launch campaigns.

**Pages:**
- **Dashboard** — Total payloads, encapsulated count, delayed count, active manifests; payload type distribution bars; delayed milestone list
- **Payloads** — Payload table: name, type badge (Science/Commercial/Military/Government), mass (kg), target orbit, status, integration complete flag
- **Manifests** — Manifest cards: launch vehicle, launch date, embedded payload list with mass and status
- **Processing** — Processing pipeline per active payload: step name, status bar (complete/in-progress/pending)
- **Integration** — Milestone tracker: milestone name, payload, planned date, actual date, status badge (complete/in-progress/pending/delayed)

**Data model highlights:** `Payload`, `LaunchManifest`, `IntegrationMilestone` — 14 payloads, 5 manifests, 30 milestones.

---

### 21 — Range Safety (`21-range`) · Port 3021
**App name:** SENTINEL

Launch range safety system: hazard zones, clearances, weather, and incidents.

**Pages:**
- **Dashboard** — Active hazards, pending/granted clearances, open incidents, launch GO window; today's weather summary
- **Hazards** — Hazard zone registry: zone name, type, radius (km), status (active/inactive/standby), activation time, clearance requirement
- **Clearances** — Clearance log: zone, authority, issued/expires timestamps, conditions, status (pending/granted/expired/revoked)
- **Weather** — Weather data table: wind speed (knots), wind direction, visibility (nm), cloud ceiling (ft), lightning flag, forecast string
- **Incidents** — Incident log: date, severity badge, system affected, description, resolution status

**Data model highlights:** `HazardZone`, `Clearance`, `WeatherData`, `Incident` — 7 zones, 5 clearances, 20 weather readings, 10 incidents.

---

### 22 — Deep Space Network (`22-dsn`) · Port 3022
**App name:** DEEP SPACE

Ground station network management for deep-space communications.

**Pages:**
- **Dashboard** — Total antennas, active contacts, scheduled contacts, stations online; per-station health bars; active contact list
- **Stations** — 3 complexes (Goldstone, Madrid, Canberra): station location (lat/lon), antenna list with diameter, bands, and status
- **Contacts** — Contact schedule table: antenna ID, spacecraft, start/end time, uplink (kbps), downlink (Mbps), status badge
- **Links** — Link budget table: contact, EIRP (dBW), SNR (dB), range (km), round-trip light time (sec), bit error rate
- **Schedule** — Contacts grouped by station complex with per-station antenna assignment and data rate columns

**Data model highlights:** `Station`, `Antenna`, `DSNContact`, `LinkBudget` — 3 stations, 12 antennas, 40 contacts, 40 link budgets.

---

### 23 — Fleet (`23-fleet`) · Port 3023
**App name:** VANGUARD

Reusable launch vehicle fleet management: readiness, launches, and maintenance.

**Pages:**
- **Dashboard** — Total vehicles, operational count, total launches, pending maintenance tasks; readiness bars per vehicle; recent launches
- **Vehicles** — Vehicle cards: location, readiness score bar, total flight count, pending maintenance count, status badge
- **Launches** — Launch history table: date, mission, payload, outcome (Success/Partial/Failure), landing outcome, boostback burn flag
- **Maintenance** — Maintenance task table: vehicle, task type, status badge (scheduled/in-progress/complete/overdue), priority, assigned team
- **Readiness** — GO/NO-GO assessment per vehicle: readiness score, operational status, pending maintenance — all three must pass for GO

**Data model highlights:** `FleetVehicle`, `LaunchRecord`, `MaintenanceTask` — 8 vehicles, 20 launch records, 16 maintenance tasks.

---

## Running All Apps Simultaneously

Each app runs on its own port (00 → 3000, 01 → 3001, … 23 → 3023). To start them all in parallel:

```powershell
# PowerShell — start all in background (Windows)
$ports = @{}
Get-ChildItem apps -Directory | Where-Object { $_.Name -match "^\d{2}-" } | ForEach-Object {
    $port = 3000 + [int]($_.Name.Substring(0,2))
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$($_.FullName)'; npm start -- -p $port"
}
```

Or with `concurrently` from the repo root:

```bash
npx concurrently \
  "cd apps/00-dashboard && npm start -- -p 3000" \
  "cd apps/01-kanban && npm start -- -p 3001" \
  ...
```

> **Note:** Each app must be built first (`npm run build`) before `npm start` will work.
