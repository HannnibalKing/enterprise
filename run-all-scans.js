#!/usr/bin/env node
/**
 * run-all-scans.js
 * Master script — runs all 9 Enterprise security tools against the vulnerable-app
 * and saves JSON reports into reports/ for the security dashboard.
 *
 * Usage:  node run-all-scans.js [--target <dir>] [--reports <dir>]
 */

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const ROOT = path.resolve(__dirname);
const TESTING_DIR = path.join(ROOT, 'testing');
const TARGET_DIR = process.argv.includes('--target')
  ? path.resolve(process.argv[process.argv.indexOf('--target') + 1])
  : path.join(ROOT, 'vulnerable-app');
const REPORTS_DIR = process.argv.includes('--reports')
  ? path.resolve(process.argv[process.argv.indexOf('--reports') + 1])
  : path.join(ROOT, 'reports');

const GREEN = '\x1b[32m';
const RED = '\x1b[31m';
const CYAN = '\x1b[36m';
const YELLOW = '\x1b[33m';
const RESET = '\x1b[0m';

function log(color, msg) { console.log(color + msg + RESET); }

const scans = [
  {
    id: '01-security-scanner',
    label: 'Security Scanner (OWASP)',
    cmd: (out) => `node dist/cli.js "${TARGET_DIR}" -f json -o "${out}"`,
    report: 'security-report.json',
  },
  {
    id: '02-api-contract-validator',
    label: 'API Contract Validator',
    cmd: (out) => `node dist/cli.js -s "${path.join(TARGET_DIR, 'openapi.yaml')}" -d "${path.join(TARGET_DIR, 'src')}" -o "${out}"`,
    report: 'api-report.json',
  },
  {
    id: '03-auth-flow-analyzer',
    label: 'Auth Flow Analyzer',
    cmd: (out) => `node dist/cli.js "${TARGET_DIR}" -o "${out}"`,
    report: 'auth-report.json',
  },
  {
    id: '04-secrets-scanner',
    label: 'Secrets Scanner',
    cmd: (out) => `node dist/cli.js "${TARGET_DIR}" -o "${out}"`,
    report: 'secrets-report.json',
  },
  {
    id: '05-cors-header-inspector',
    label: 'CORS & Headers Inspector (static)',
    cmd: (out) => `node dist/cli.js -d "${path.join(TARGET_DIR, 'src')}" -o "${out}"`,
    report: 'headers-report.json',
  },
  {
    id: '07-dependency-auditor',
    label: 'Dependency Auditor',
    cmd: (out) => `node dist/cli.js "${TARGET_DIR}" -o "${out}"`,
    report: 'audit-report.json',
  },
  {
    id: '08-input-validation-checker',
    label: 'Input Validation Checker',
    cmd: (out) => `node dist/cli.js "${TARGET_DIR}" -o "${out}"`,
    report: 'validation-report.json',
  },
];

async function main() {
  log(CYAN, '\n╔══════════════════════════════════════════════════════════╗');
  log(CYAN, '║         ENTERPRISE SECURITY SUITE — MASTER SCAN          ║');
  log(CYAN, '╚══════════════════════════════════════════════════════════╝\n');
  log('', `Target  : ${TARGET_DIR}`);
  log('', `Reports : ${REPORTS_DIR}\n`);

  fs.mkdirSync(REPORTS_DIR, { recursive: true });

  const results = [];

  for (const scan of scans) {
    const toolDir = path.join(TESTING_DIR, scan.id);
    if (!fs.existsSync(toolDir)) {
      log(YELLOW, `  ⚠  Skipping ${scan.label} — tool directory not found`);
      continue;
    }

    const reportDir = path.join(REPORTS_DIR, scan.id);
    fs.mkdirSync(reportDir, { recursive: true });
    const reportFile = path.join(reportDir, scan.report);

    log(CYAN, `\n  ▶ ${scan.label}`);
    const cmd = scan.cmd(reportFile);

    const start = Date.now();
    let exitCode = 0;
    try {
      execSync(cmd, { cwd: toolDir, stdio: 'pipe' });
    } catch (err) {
      // Non-zero exit = findings found (expected). Only log actual errors.
      exitCode = err.status ?? 1;
      if (err.stderr && err.stderr.toString().trim()) {
        log(YELLOW, `    stderr: ${err.stderr.toString().trim().split('\n')[0]}`);
      }
    }

    const elapsed = ((Date.now() - start) / 1000).toFixed(1);

    if (fs.existsSync(reportFile)) {
      let report = {};
      try { report = JSON.parse(fs.readFileSync(reportFile, 'utf-8')); } catch { /* ignore */ }
      const summary = report.summary ?? {};
      const passed = report.passed === true;
      const icon = passed ? `${GREEN}✅` : `${RED}❌`;
      const summaryStr = Object.entries(summary).map(([k, v]) => `${k}:${v}`).join('  ') || `exit:${exitCode}`;
      log('', `    ${icon}${RESET} ${summaryStr}  (${elapsed}s)`);
      results.push({ tool: scan.label, passed, summary, elapsed });
    } else {
      log(YELLOW, `    ⚠  No report file generated (${elapsed}s)`);
      results.push({ tool: scan.label, passed: null, summary: {}, elapsed });
    }
  }

  // ── Summary table ──────────────────────────────────────────────────────────
  log(CYAN, '\n╔══════════════════════════════════════════════════════════╗');
  log(CYAN, '║                    SCAN COMPLETE                         ║');
  log(CYAN, '╚══════════════════════════════════════════════════════════╝\n');

  const passCount = results.filter((r) => r.passed === true).length;
  const failCount = results.filter((r) => r.passed === false).length;

  for (const r of results) {
    const icon = r.passed === true ? `${GREEN}✅` : r.passed === false ? `${RED}❌` : `${YELLOW}⚠`;
    log('', `  ${icon}${RESET} ${r.tool}`);
  }

  log('', `\n  ${GREEN}Passed: ${passCount}${RESET}  ${RED}Failed/Findings: ${failCount}${RESET}`);
  log('', `\n  Reports saved to: ${REPORTS_DIR}`);
  log('', `  Launch dashboard: cd testing/10-security-dashboard && node dist/server.js --reports-dir "${REPORTS_DIR}"\n`);
}

main().catch(console.error);
