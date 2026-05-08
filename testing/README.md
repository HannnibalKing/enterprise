# 🔐 Enterprise Security Suite

A collection of **10 enterprise-grade security tools** for auditing, monitoring, and visualizing the security posture of full-stack applications — with a focus on AI-generated code.

---

## Tools Overview

| # | Tool | Purpose | CLI |
|---|------|---------|-----|
| 01 | **Security Scanner** | OWASP Top 10 static analysis (20+ rules) | `security-scanner <dir>` |
| 02 | **API Contract Validator** | OpenAPI spec vs. route implementation | `api-validator -s spec.yaml -d src/` |
| 03 | **Auth Flow Analyzer** | JWT, session, OAuth, CSRF, MFA issues | `auth-analyzer <dir>` |
| 04 | **Secrets Scanner** | 50+ secret patterns + Shannon entropy | `secrets-scanner <dir>` |
| 05 | **CORS & Headers Inspector** | Live HTTP headers + static CORS analysis | `header-inspector -u https://app.example.com` |
| 06 | **API Traffic Monitor** | Runtime proxy with real-time anomaly detection | `npm start` (proxy mode) |
| 07 | **Dependency Auditor** | CVE scanning for npm, pip, Go | `dep-auditor <dir>` |
| 08 | **Input Validation Checker** | Missing validation in route handlers | `validation-checker <dir>` |
| 09 | **TLS/SSL Auditor** | Protocol, cipher, cert, HSTS inspection | `tls-auditor api.example.com` |
| 10 | **Security Dashboard** | Unified React web UI aggregating all reports | `security-dashboard` |

---

## Prerequisites

- **Node.js 20+** and **npm 9+**
- Optional: `pip-audit` (Python deps): `pip install pip-audit`
- Optional: `govulncheck` (Go deps): `go install golang.org/x/vuln/cmd/govulncheck@latest`

---

## Quick Start

Each tool is a standalone npm package. To use a tool:

```bash
cd <tool-directory>
npm install
npm run build
```

Then run via the CLI or `npx`:

```bash
# 01 — OWASP static scan
cd 01-security-scanner
npx ts-node src/cli.ts ../my-app -f table

# 02 — API contract validation
cd 02-api-contract-validator
npx ts-node src/cli.ts -s ../my-app/openapi.yaml -d ../my-app/src

# 03 — Auth flow analysis
cd 03-auth-flow-analyzer
npx ts-node src/cli.ts ../my-app

# 04 — Secrets scan
cd 04-secrets-scanner
npx ts-node src/cli.ts ../my-app

# 05 — CORS & security headers
cd 05-cors-header-inspector
npx ts-node src/cli.ts -u https://api.example.com -d ../my-app/src

# 06 — API traffic monitor (proxy)
cd 06-api-traffic-monitor
TARGET_URL=http://localhost:3000 PROXY_PORT=8080 npx ts-node src/index.ts

# 07 — Dependency CVE audit
cd 07-dependency-auditor
npx ts-node src/cli.ts ../my-app

# 08 — Input validation check
cd 08-input-validation-checker
npx ts-node src/cli.ts ../my-app

# 09 — TLS/SSL audit
cd 09-tls-auditor
npx ts-node src/cli.ts api.example.com,app.example.com

# 10 — Security Dashboard
cd 10-security-dashboard
npm run install:all
npm run build
node dist/server.js --reports-dir ../reports
# Visit http://localhost:4000
```

---

## Saving Reports for the Dashboard

Tool 10 aggregates JSON reports from all other tools. Save reports to the `reports/` directory:

```bash
mkdir -p reports/01-security-scanner
cd 01-security-scanner
npx ts-node src/cli.ts ../my-app -f json -o ../reports/01-security-scanner/security-report.json
```

| Tool | Expected report file |
|------|---------------------|
| 01 | `reports/01-security-scanner/security-report.json` |
| 02 | `reports/02-api-contract-validator/api-report.json` |
| 03 | `reports/03-auth-flow-analyzer/auth-report.json` |
| 04 | `reports/04-secrets-scanner/secrets-report.json` |
| 05 | `reports/05-cors-header-inspector/headers-report.json` |
| 06 | `reports/06-api-traffic-monitor/traffic-report.json` |
| 07 | `reports/07-dependency-auditor/audit-report.json` |
| 08 | `reports/08-input-validation-checker/validation-report.json` |
| 09 | `reports/09-tls-auditor/tls-report.json` |

---

## Architecture

```
Enterprise/
├── 01-security-scanner/        # OWASP static analysis
├── 02-api-contract-validator/  # OpenAPI contract testing
├── 03-auth-flow-analyzer/      # Authentication security
├── 04-secrets-scanner/         # Secret detection + entropy
├── 05-cors-header-inspector/   # HTTP security headers
├── 06-api-traffic-monitor/     # Runtime proxy monitoring
├── 07-dependency-auditor/      # CVE dependency scanning
├── 08-input-validation-checker/ # Input validation analysis
├── 09-tls-auditor/             # TLS/SSL inspection
├── 10-security-dashboard/      # React web dashboard
│   ├── src/                    # Express + WebSocket backend
│   └── frontend/               # React + Recharts + Vite UI
└── reports/                    # JSON output from all tools
```

Each tool:
- **TypeScript 5.4**, compiled to `dist/`
- **Commander** CLI with `--output` for JSON reports
- Zero runtime secrets — stateless analysis
- Exit code `0` = pass, `1` = findings requiring attention

---

## CI/CD Integration

```yaml
# GitHub Actions example
- name: Security Scan
  run: |
    cd 01-security-scanner && npm ci && npm run build
    node dist/cli.js ${{ github.workspace }} --fail-on HIGH --output security-report.json

- name: Secrets Check
  run: |
    cd 04-secrets-scanner && npm ci && npm run build
    node dist/cli.js ${{ github.workspace }} --output secrets-report.json

- name: TLS Audit
  run: |
    cd 09-tls-auditor && npm ci && npm run build
    node dist/cli.js ${{ env.PRODUCTION_HOST }} --output tls-report.json

- name: Upload Reports
  uses: actions/upload-artifact@v4
  with:
    name: security-reports
    path: "**/*-report.json"
```

---

## Detection Coverage

| Category | Tool(s) | CWEs Covered |
|----------|---------|-------------|
| Injection (SQLi, XSS, SSTI) | 01, 08 | CWE-89, CWE-79, CWE-94 |
| Broken Authentication | 03 | CWE-287, CWE-798, CWE-916 |
| Sensitive Data Exposure | 04, 05 | CWE-200, CWE-312 |
| Security Misconfiguration | 01, 05, 09 | CWE-16, CWE-693 |
| Vulnerable Dependencies | 07 | CVE database |
| Improper Input Validation | 08 | CWE-20, CWE-1321 |
| TLS/Certificate Issues | 09 | CWE-297, CWE-326 |
| API Contract Violations | 02 | OWASP API Top 10 |
| Runtime Anomalies | 06 | OWASP API Top 10 |

---

## License

MIT
