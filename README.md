# Enterprise — Full-Stack App Portfolio

A portfolio of **35 enterprise web applications** and **10 security audit tools**. The repository contains runnable demos, architecture examples, and intentionally vulnerable fixtures; individual status and limitations are documented in the project documentation.

---

## Repository Structure

```
Enterprise/
├── apps/                     # 35 applications (00–33; 05 has two legacy app names)
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
│   ├── APPS.md               # Full reference for all 35 apps
│   └── TOOLS.md              # Full reference for all 10 security tools
│
├── reports/                  # Output directory for security scan reports
├── run-all-scans.js          # Orchestrates 7 static CLI scans against a target
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

### Local authentication configuration

Demo passwords and JWT signing secrets are not stored in this repository. The seeded accounts use `DEMO_PASSWORD` when set; otherwise, a fresh random password is generated at startup. Set both environment variables locally before starting an authenticated demo. Do not commit `.env` files or expose these values in logs, screenshots, or issue reports.

For PowerShell, generate process-local values before running the app:

```powershell
$env:JWT_SECRET = [Convert]::ToBase64String([Security.Cryptography.RandomNumberGenerator]::GetBytes(32))
$env:DEMO_PASSWORD = [Convert]::ToBase64String([Security.Cryptography.RandomNumberGenerator]::GetBytes(24))
```

Some seeded demo users are available from the app's login screen. These in-memory examples are for local learning only; configure a secret manager, managed user store, and unique credentials before any deployment.

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

The orchestrator installs dependencies from each tool's lockfile and builds the seven static scanners before execution. A nonzero scanner result means findings were detected and is recorded in the JSON report; it does not mean the orchestrator failed. The API traffic monitor and TLS auditor require a live endpoint and are run separately.

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

### Apps (all 35)
| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15.3 (App Router) |
| Language | TypeScript 5 (strict mode) |
| Auth | jose v5 (JWT HS256, 12h expiry) + bcryptjs |
| Styling | CSS custom properties, dark theme |
| Charts | CSS-only flex bars (no chart library) |
| Data | In-memory singleton store (LCG seeded) |
| Routing | Middleware-protected `/(app)/*` routes |

### Security Tools
| Layer | Technology |
|-------|-----------|
| Runtime | Node.js 20 |
| Language | TypeScript |
| CLI framework | commander / yargs |
| Testing | Jest |
| Dashboard frontend | React + Vite |
| Dashboard backend | Express |

---

## Documentation

- [docs/APPS.md](docs/APPS.md) — Architecture deep-dive and page-by-page reference for all 35 apps
- [docs/TOOLS.md](docs/TOOLS.md) — Installation, usage, and examples for all 10 security tools
- [testing/README.md](testing/README.md) — Security suite quick-start and CLI cheatsheet
