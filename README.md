# Enterprise — Full-Stack App Portfolio

A portfolio of **24 enterprise-grade web applications** and **10 security audit tools**, all built with Next.js 15, TypeScript, and JWT authentication.

---

## Repository Structure

```
Enterprise/
├── apps/                     # 24 Next.js 15 applications (00–23)
│   ├── 00-dashboard/         # Executive KPI dashboard
│   ├── 01-kanban/            # Project management board
│   ├── 02-hr-portal/         # HR & payroll
│   ├── 03-document-mgmt/     # Document repository
│   ├── 04-notifications/     # Multi-channel notifications
│   ├── 05-casino/            # Gaming operations
│   ├── 05-crm/               # Customer relationship management
│   ├── 06-trading/           # Financial trading platform
│   ├── 07-health/            # Healthcare management
│   ├── 08-supply-chain/      # Supply chain visibility
│   ├── 09-realty/            # Real estate portfolio
│   ├── 10-legal/             # Legal matter management
│   ├── 11-manufacturing/     # Manufacturing operations
│   ├── 12-finance/           # Corporate finance & GL
│   ├── 13-pmo/               # Project Management Office
│   ├── 14-mission-control/   # Space mission command (APOLLO CMD)
│   ├── 15-launch-ops/        # Launch campaign ops (STARFIRE)
│   ├── 16-orbital/           # Orbital mechanics tracking (ORION TRACK)
│   ├── 17-telemetry/         # Multi-spacecraft telemetry (NEXUS TLM)
│   ├── 18-crew/              # Crew operations (ARTEMIS OPS)
│   ├── 19-propulsion/        # Engine test lab (RAPTOR LAB)
│   ├── 20-payload/           # Payload integration (ATLAS OPS)
│   ├── 21-range/             # Range safety (SENTINEL)
│   ├── 22-dsn/               # Deep Space Network (DEEP SPACE)
│   └── 23-fleet/             # Vehicle fleet (VANGUARD)
│
├── testing/                  # 10 security audit tools
│   ├── 01-security-scanner/  # OWASP Top 10 static analysis
│   ├── 02-api-contract-validator/
│   ├── 03-auth-flow-analyzer/
│   ├── 04-secrets-scanner/
│   ├── 05-cors-header-inspector/
│   ├── 06-api-traffic-monitor/
│   ├── 07-dependency-auditor/
│   ├── 08-input-validation-checker/
│   ├── 09-tls-auditor/
│   └── 10-security-dashboard/
│
├── docs/
│   ├── APPS.md               # Full reference for all 24 apps
│   └── TOOLS.md              # Full reference for all 10 security tools
│
├── reports/                  # Output directory for security scan reports
├── run-all-scans.js          # Orchestrates all 9 CLI tools against a target
└── vulnerable-app/           # Intentionally vulnerable app for tool testing
```

---

## Quick Start — Apps

### Prerequisites
- Node.js 20+
- npm 9+

### Run a single app
```bash
cd apps/00-dashboard
npm install
npm run dev     # dev server with hot reload → http://localhost:3000
```

### Login credentials
Every app uses `admin` as the username. Passwords vary per app:

| App | Password | Port |
|-----||------|
| 00-dashboard | `` | 3000 |
| 01-kanban | `` | 3001 |
| 02-hr-portal | `` | 3002 |
| 03-document-mgmt | `` | 3003 |
| 04-notifications | `` | 3004 |
| 05-casino | `` | 3005 |
| 05-crm | `` | 3005 |
| 06-trading | `` | 3006 |
| 07-health | `` | 3007 |
| 08-supply-chain | `` | 3008 |
| 09-realty | `` | 3009 |
| 10-legal | `` | 3010 |
| 11-manufacturing | `` | 3011 |
| 12-finance | `` | 3012 |
| 13-pmo | `` | 3013 |
| 14-mission-control | `` | 3014 |
| 15-launch-ops | `` | 3015 |
| 16-orbital | `` | 3016 |
| 17-telemetry | `` | 3017 |
| 18-crew | `` | 3018 |
| 19-propulsion | `` | 3019 |
| 20-payload | `` | 3020 |
| 21-range | `` | 3021 |
| 22-dsn | `` | 3022 |
| 23-fleet | `` | 3023 |

### Build for production
```bash
cd apps/<app-name>
npm run build   # compiles to .next/
npm start       # serves on the configured port
```

---

## Quick Start — Security Tools

### Install and build all tools
```powershell
cd testing
Get-ChildItem -Directory | ForEach-Object {
    Push-Location $_.FullName ; npm install ; npm run build ; Pop-Location
}
```

### Run all scans against an app
```bash
node run-all-scans.js --target ./apps/14-mission-control
# Reports saved to reports/<timestamp>/
```

### View results in the dashboard
```bash
cd testing/10-security-dashboard
npm run install:all
npm run build
npm start       # → http://localhost:4000
# Then: Import Report → select JSON files from reports/
```

See [docs/TOOLS.md](docs/TOOLS.md) for the full reference.

---

## Tech Stack

### Apps (all 24)
| Layer | Technology |
|-------|-|
| Framework | Next.js 15.3 (App Router) |
| Language | TypeScript 5 (strict mode) |
| Auth | jose v5 (JWT HS256, 12h expiry) + bcryptjs |
| Styling | CSS custom properties, dark theme |
| Charts | CSS-only flex bars (no chart library) |
| Data | In-memory singleton store (LCG seeded) |
| Routing | Middleware-protected `/(app)/*` routes |

### Security Tools
| Layer | Technology |
|-------|-|
| Runtime | Node.js 20 |
| Language | TypeScript |
| CLI framework | commander / yargs |
| Testing | Jest |
| Dashboard frontend | React + Vite |
| Dashboard backend | Express |

---

## Documentation

- [docs/APPS.md](docs/APPS.md) — Architecture deep-dive and page-by-page reference for all 24 apps
- [docs/TOOLS.md](docs/TOOLS.md) — Installation, usage, and examples for all 10 security tools
- [testing/README.md](testing/README.md) — Security suite quick-start and CLI cheatsheet
