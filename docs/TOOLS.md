# Enterprise Security Tools — Full Reference

10 standalone CLI/server tools for auditing, monitoring, and visualising the security posture of full-stack applications. All tools live in the `testing/` directory and are independent npm packages written in TypeScript.

---

## Prerequisites

| Requirement | Minimum | Notes |
|-------------|---------|-------|
| Node.js | 20+ | All tools |
| npm | 9+ | All tools |
| Python + pip-audit | optional | Tool 07 — pip dependency scanning |
| Go + govulncheck | optional | Tool 07 — Go dependency scanning |

---

## Install & Build All Tools

```powershell
# PowerShell — install + build every tool at once
cd testing
Get-ChildItem -Directory | ForEach-Object {
    Push-Location $_.FullName
    Write-Host "==> $($_.Name)"
    npm install
    npm run build
    Pop-Location
}
```

Or use the provided batch runner from the repo root:

```bash
node run-all-scans.js
```

---

## Tool-by-Tool Reference

---

### 01 — Security Scanner (`01-security-scanner`)

**Purpose:** Static OWASP Top 10 analysis — scans TypeScript/JavaScript source files for 20+ security anti-patterns.

**What it detects:**
- SQL/NoSQL injection (string interpolation in queries)
- XSS — unescaped user input in responses
- Hardcoded credentials and secrets
- Missing authentication/authorisation checks
- Insecure `eval()`, `dangerouslySetInnerHTML`, prototype pollution
- Unsafe `child_process` calls
- Missing rate limiting, CSRF protection

**Install & build:**
```bash
cd testing/01-security-scanner
npm install
npm run build
```

**Run (dev — no build required):**
```bash
npx ts-node src/cli.ts <target-directory> [options]
```

**Run (production — faster):**
```bash
npm run build
node dist/cli.js <target-directory> [options]
```

**Options:**
| Flag | Description |
|------|-------------|
| `-f table` | Output as formatted table (default) |
| `-f json` | Output as JSON |
| `-f html` | Output as HTML report |
| `--severity high` | Filter to high severity only |

**Example:**
```bash
# Scan the mission-control app
npx ts-node src/cli.ts ../../apps/14-mission-control -f table

# Output JSON report
npx ts-node src/cli.ts ../../apps/00-dashboard -f json > report.json
```

**Run tests:**
```bash
npm test
```

---

### 02 — API Contract Validator (`02-api-contract-validator`)

**Purpose:** Validates that Express/Fastify/Next.js API routes match an OpenAPI 3.x specification — catches undocumented endpoints and schema mismatches.

**What it detects:**
- Routes in code with no matching OpenAPI path
- OpenAPI paths with no matching route in code
- Request/response body schema violations
- Missing required parameters
- Wrong HTTP method declarations

**Install & build:**
```bash
cd testing/02-api-contract-validator
npm install
npm run build
```

**Run:**
```bash
npx ts-node src/cli.ts -s <openapi-spec.yaml> -d <source-directory>
```

**Options:**
| Flag | Description |
|------|-------------|
| `-s <file>` | Path to OpenAPI 3.x YAML or JSON spec |
| `-d <dir>` | Source directory to scan for route files |
| `-f json` | JSON output |
| `-f table` | Table output (default) |

**Example:**
```bash
npx ts-node src/cli.ts -s ./openapi.yaml -d ../../apps/00-dashboard/app/api
```

**Run tests:**
```bash
npm test
```

---

### 03 — Auth Flow Analyzer (`03-auth-flow-analyzer`)

**Purpose:** Deep inspection of authentication and session security — JWT configuration, cookie flags, OAuth 2.0 flows, CSRF, MFA gaps.

**What it detects:**
- JWT signed with weak/hardcoded secrets
- JWT missing expiry (`exp` claim)
- `algorithm: none` or symmetric alg on public APIs
- Cookies missing `HttpOnly`, `Secure`, or `SameSite` flags
- OAuth state parameter not validated
- Sessions not invalidated on logout
- Missing CSRF tokens on state-changing requests
- No MFA enforcement on privileged routes

**Install & build:**
```bash
cd testing/03-auth-flow-analyzer
npm install
npm run build
```

**Run:**
```bash
npx ts-node src/cli.ts <source-directory>
```

**Example:**
```bash
# Analyse all space apps at once
npx ts-node src/cli.ts ../../apps
```

**Run tests:**
```bash
npm test
```

---

### 04 — Secrets Scanner (`04-secrets-scanner`)

**Purpose:** Finds leaked secrets, API keys, passwords, and tokens using 200+ regex patterns and Shannon entropy analysis.

**What it detects (pattern categories):**
- AWS / GCP / Azure / Stripe / Twilio / Slack / GitHub keys
- Private key PEM blocks
- Database connection strings with credentials
- `.env` values committed to source
- High-entropy strings (> 4.5 bits/char) likely to be tokens
- Passwords hardcoded in source

**Install & build:**
```bash
cd testing/04-secrets-scanner
npm install
npm run build
```

**Run:**
```bash
npx ts-node src/cli.ts <target-directory> [options]
```

**Options:**
| Flag | Description |
|------|-------------|
| `--entropy-threshold 4.5` | Shannon entropy threshold (default 4.5) |
| `--include-tests` | Also scan test files |
| `-f json` | JSON output |

**Example:**
```bash
npx ts-node src/cli.ts ../../apps/14-mission-control
npx ts-node src/cli.ts ../../apps -f json > secrets-report.json
```

**Run tests:**
```bash
npm test
```

---

### 05 — CORS & Headers Inspector (`05-cors-header-inspector`)

**Purpose:** Two-mode tool — (1) makes live HTTP requests to inspect security headers, (2) statically analyses source code for CORS misconfigurations.

**What it checks:**
- Live headers: `Content-Security-Policy`, `Strict-Transport-Security`, `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`
- CORS: wildcard origins, missing `credentials` flag, overly broad `allowedOrigins`
- Static: Express/Next.js `cors()` config, `Access-Control-Allow-Origin: *` with credentials

**Install & build:**
```bash
cd testing/05-cors-header-inspector
npm install
npm run build
```

**Run (live URL scan):**
```bash
npx ts-node src/cli.ts -u https://api.example.com
```

**Run (static source scan):**
```bash
npx ts-node src/cli.ts -d ../../apps/00-dashboard/src
```

**Run both:**
```bash
npx ts-node src/cli.ts -u http://localhost:3000 -d ../../apps/00-dashboard
```

**Run tests:**
```bash
npm test
```

---

### 06 — API Traffic Monitor (`06-api-traffic-monitor`)

**Purpose:** Runtime HTTP proxy that intercepts every request and response between a frontend and backend, logging payloads and detecting anomalies in real time.

**What it monitors:**
- All request/response headers and bodies
- Anomalies: unusually large payloads, unexpected status codes (500s), slow responses
- Authentication header presence (missing Bearer tokens)
- Sensitive data leaking in responses (PII patterns)
- Rate: requests per second per IP

**Install & build:**
```bash
cd testing/06-api-traffic-monitor
npm install
npm run build
```

**Run (proxy mode — intercept traffic):**
```bash
# Point your app's API calls at localhost:8080 instead of the real backend
TARGET_URL=http://localhost:3000 PROXY_PORT=8080 npx ts-node src/proxy.ts
```

**Environment variables:**
| Variable | Default | Description |
|----------|---------|-------------|
| `TARGET_URL` | required | The real backend URL to forward requests to |
| `PROXY_PORT` | `8080` | Port the proxy listens on |
| `LOG_BODIES` | `true` | Log request/response bodies |
| `ANOMALY_THRESHOLD_MS` | `2000` | Response time threshold for slow-response alert |

**Example — monitor a space app:**
```bash
# Start the space app on port 3014
cd apps/14-mission-control && npm start -- -p 3014

# In another terminal, start the proxy in front of it
cd testing/06-api-traffic-monitor
TARGET_URL=http://localhost:3014 PROXY_PORT=8080 npx ts-node src/proxy.ts

# Then visit http://localhost:8080 — all traffic is logged
```

**Run tests:**
```bash
npm test
```

---

### 07 — Dependency Auditor (`07-dependency-auditor`)

**Purpose:** Multi-ecosystem CVE scanner — checks npm (`package-lock.json`), Python (`requirements.txt`), and Go (`go.sum`) dependencies against known vulnerability databases.

**What it reports:**
- CVE ID, CVSS score, severity (Critical/High/Medium/Low)
- Affected package + version range
- Fixed version (if available)
- Remediation command (`npm install <pkg>@<fixed>`)

**Install & build:**
```bash
cd testing/07-dependency-auditor
npm install
npm run build

# Optional: install Python and Go scanners
pip install pip-audit
go install golang.org/x/vuln/cmd/govulncheck@latest
```

**Run:**
```bash
npx ts-node src/cli.ts <target-directory>
```

**Example:**
```bash
# Audit a single app
npx ts-node src/cli.ts ../../apps/06-trading

# Audit all apps
npx ts-node src/cli.ts ../../apps
```

**Run tests:**
```bash
npm test
```

---

### 08 — Input Validation Checker (`08-input-validation-checker`)

**Purpose:** Scans Express/Fastify/Next.js route handlers for missing input validation and sanitisation — the root cause of injection vulnerabilities.

**What it detects:**
- Route params (`req.params.*`) used directly without validation
- Query strings (`req.query.*`) passed to DB queries or HTML output
- Request bodies (`req.body.*`) without schema validation (zod, joi, yup, etc.)
- Missing sanitisation before database writes
- Unvalidated file upload fields
- Direct use of `parseInt()` / `parseFloat()` without NaN checks

**Install & build:**
```bash
cd testing/08-input-validation-checker
npm install
npm run build
```

**Run:**
```bash
npx ts-node src/cli.ts <target-directory>
```

**Example:**
```bash
npx ts-node src/cli.ts ../../apps/07-health/app/api
```

**Run tests:**
```bash
npm test
```

---

### 09 — TLS/SSL Auditor (`09-tls-auditor`)

**Purpose:** Connects to live HTTPS endpoints and audits TLS configuration — protocol versions, cipher suites, certificate validity, HSTS, and OCSP stapling.

**What it checks:**
- TLS protocol version (flags TLS 1.0 / 1.1 / SSL 3.0 as insecure)
- Cipher suite strength (flags RC4, DES, 3DES, export ciphers)
- Certificate chain validity, expiry, hostname match, self-signed detection
- HSTS header: presence, `max-age`, `includeSubDomains`, `preload`
- OCSP stapling status

**Install & build:**
```bash
cd testing/09-tls-auditor
npm install
npm run build
```

**Run:**
```bash
npx ts-node src/cli.ts <hostname>[,<hostname2>,...]
```

**Example:**
```bash
# Single host
npx ts-node src/cli.ts api.example.com

# Multiple hosts at once
npx ts-node src/cli.ts api.example.com,app.example.com,admin.example.com
```

**Run tests:**
```bash
npm test
```

---

### 10 — Security Dashboard (`10-security-dashboard`)

**Purpose:** Unified web UI that aggregates reports from all 9 CLI tools into a real-time React dashboard — import JSON reports, view findings by severity, filter by tool or category.

**Architecture:**
- **Backend:** Node.js/Express server (`src/server.ts`) — serves the React app and exposes a REST API for report ingestion
- **Frontend:** React app (`frontend/`) — built with Vite, displays aggregated findings

**Install:**
```bash
cd testing/10-security-dashboard
npm run install:all    # installs both server and frontend dependencies
```

**Build:**
```bash
npm run build          # builds server + frontend
# or separately:
npm run build:server
npm run build:frontend
```

**Run (development — hot reload):**
```bash
# Terminal 1: start backend
npm run dev:server     # → http://localhost:4000

# Terminal 2: start frontend (Vite)
npm run dev:frontend   # → http://localhost:5173
```

**Run (production):**
```bash
npm run build
npm start              # serves everything from http://localhost:4000
```

**Using the dashboard:**
1. Open `http://localhost:4000` (or `5173` in dev mode)
2. Use **Import Report** to load JSON output from any of the 9 CLI tools
3. View findings grouped by tool, severity, category, or file
4. Use the filter bar to drill down by severity (Critical / High / Medium / Low / Info)
5. Export a combined PDF/HTML report from the **Reports** tab

---

## Run All Scans at Once

The `run-all-scans.js` script at the repo root orchestrates all 9 CLI tools against a target directory and saves JSON reports to `reports/`.

```bash
# From repo root
node run-all-scans.js --target ./apps/14-mission-control

# Scan all apps
node run-all-scans.js --target ./apps

# Results saved to reports/<timestamp>/
```

Then load the reports into the Security Dashboard for a unified view.

---

## Typical Security Audit Workflow

```
1. Install all tools       →  cd testing && npm install (each tool)
2. Build all tools         →  npm run build (each tool)
3. Run all scans           →  node run-all-scans.js --target ./apps/<app>
4. View in dashboard       →  cd 10-security-dashboard && npm start
5. Import JSON reports     →  Dashboard UI → Import Report
6. Triage findings         →  Filter by Critical/High first
7. Fix issues in apps      →  Edit apps/<app>/...
8. Re-run affected tools   →  Verify findings resolved
```
