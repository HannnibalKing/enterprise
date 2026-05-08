#!/usr/bin/env node
import { Command } from 'commander';
import * as fs from 'fs';
import * as path from 'path';
import { auditNpm, auditPip, auditGo } from './auditor';
import { AuditResult, DependencyReport, RemediationItem } from './types';

const program = new Command();

program
  .name('dep-auditor')
  .description('Audit npm, pip, and Go dependencies for known CVEs')
  .version('1.0.0')
  .argument('<directory>', 'Root directory to audit')
  .option('-o, --output <file>', 'Write JSON report to file')
  .option('--html <file>', 'Write HTML report to file')
  .option('--no-npm', 'Skip npm audit')
  .option('--no-pip', 'Skip pip-audit')
  .option('--no-go', 'Skip govulncheck')
  .action((directory: string, opts) => {
    const rootDir = path.resolve(directory);
    if (!fs.existsSync(rootDir)) {
      console.error(`Directory not found: ${rootDir}`);
      process.exit(1);
    }

    console.log(`\n📦 Auditing dependencies in: ${rootDir}\n`);

    const results: AuditResult[] = [];

    if (opts.npm !== false) {
      process.stdout.write('  → npm audit...');
      const r = auditNpm(rootDir);
      if (r) { results.push(r); console.log(` ✓ ${r.summary.vulnerable} vulnerable`); }
      else console.log(' (no package.json or npm not available)');
    }

    if (opts.pip !== false) {
      process.stdout.write('  → pip-audit...');
      const r = auditPip(rootDir);
      if (r) { results.push(r); console.log(` ✓ ${r.summary.vulnerable} vulnerable`); }
      else console.log(' (no requirements.txt or pip-audit not installed)');
    }

    if (opts.go !== false) {
      process.stdout.write('  → govulncheck...');
      const r = auditGo(rootDir);
      if (r) { results.push(r); console.log(` ✓ ${r.summary.vulnerable} vulnerable`); }
      else console.log(' (no go.mod or govulncheck not installed)');
    }

    const report = buildReport(rootDir, results);
    printReport(report);

    if (opts.output) {
      const outFile = path.resolve(opts.output);
      fs.mkdirSync(path.dirname(outFile), { recursive: true });
      fs.writeFileSync(outFile, JSON.stringify(report, null, 2), 'utf-8');
      console.log(`\nJSON report: ${outFile}`);
    }

    if (opts.html) {
      const outFile = path.resolve(opts.html);
      fs.mkdirSync(path.dirname(outFile), { recursive: true });
      fs.writeFileSync(outFile, buildHtml(report), 'utf-8');
      console.log(`HTML report: ${outFile}`);
    }

    process.exit(report.passed ? 0 : 1);
  });

function buildReport(rootDir: string, results: AuditResult[]): DependencyReport {
  const overall = {
    totalDependencies: results.reduce((s, r) => s + r.summary.total, 0),
    totalVulnerable: results.reduce((s, r) => s + r.summary.vulnerable, 0),
    critical: results.reduce((s, r) => s + r.summary.critical, 0),
    high: results.reduce((s, r) => s + r.summary.high, 0),
    moderate: results.reduce((s, r) => s + r.summary.moderate, 0),
    low: results.reduce((s, r) => s + r.summary.low, 0),
  };

  const remediationPlan: RemediationItem[] = results
    .flatMap((r) => r.vulnerable)
    .map((dep) => ({
      package: dep.name,
      ecosystem: dep.ecosystem,
      currentVersion: dep.version,
      fixedIn: dep.vulnerabilities.find((v) => v.fixedIn)?.fixedIn,
      action: dep.vulnerabilities.find((v) => v.fixedIn) ? 'upgrade' : 'monitor' as RemediationItem['action'],
      priority: dep.vulnerabilities.some((v) => v.severity === 'CRITICAL') ? 'IMMEDIATE'
        : dep.vulnerabilities.some((v) => v.severity === 'HIGH') ? 'SOON' : 'PLANNED' as RemediationItem['priority'],
      vulnerabilities: dep.vulnerabilities.map((v) => v.id),
    }))
    .sort((a, b) => {
      const o: Record<RemediationItem['priority'], number> = { IMMEDIATE: 0, SOON: 1, PLANNED: 2 };
      return o[a.priority] - o[b.priority];
    });

  return {
    reportId: `deps-${Date.now()}`,
    timestamp: new Date().toISOString(),
    rootDir,
    results,
    overallSummary: overall,
    passed: overall.critical === 0 && overall.high === 0,
    remediationPlan,
  };
}

function printReport(report: DependencyReport): void {
  console.log('\n╔══════════════════════════════════════════════════════════╗');
  console.log('║           DEPENDENCY AUDITOR                             ║');
  console.log('╚══════════════════════════════════════════════════════════╝');
  console.log(`  Dependencies : ${report.overallSummary.totalDependencies}`);
  console.log(`  Vulnerable   : ${report.overallSummary.totalVulnerable}`);
  console.log(`  Status       : ${report.passed ? '✅ PASSED' : '❌ FAILED'}`);
  console.log('');
  console.log('  SEVERITY BREAKDOWN');
  console.log('  ─────────────────────────────────────────');
  console.log(`  🔴 CRITICAL  : ${report.overallSummary.critical}`);
  console.log(`  🟠 HIGH      : ${report.overallSummary.high}`);
  console.log(`  🟡 MODERATE  : ${report.overallSummary.moderate}`);
  console.log(`  🔵 LOW       : ${report.overallSummary.low}`);
  console.log('');

  if (report.remediationPlan.length > 0) {
    console.log('  REMEDIATION PLAN');
    console.log('  ─────────────────────────────────────────');
    for (const item of report.remediationPlan) {
      const icon = item.priority === 'IMMEDIATE' ? '🔴' : item.priority === 'SOON' ? '🟠' : '🟡';
      const fix = item.fixedIn ? `upgrade to ${item.fixedIn}` : item.action;
      console.log(`  ${icon} [${item.priority.padEnd(9)}] [${item.ecosystem.padEnd(4)}] ${item.package}@${item.currentVersion} → ${fix}`);
      console.log(`             CVEs: ${item.vulnerabilities.slice(0, 3).join(', ')}${item.vulnerabilities.length > 3 ? ' +more' : ''}`);
    }
    console.log('');
  }
}

function buildHtml(report: DependencyReport): string {
  const rows = report.remediationPlan.map((item) => `
    <tr>
      <td><span class="badge badge-${item.priority.toLowerCase()}">${item.priority}</span></td>
      <td>${esc(item.package)}</td>
      <td>${item.ecosystem}</td>
      <td><code>${esc(item.currentVersion)}</code></td>
      <td>${item.fixedIn ? `<code>${esc(item.fixedIn)}</code>` : '—'}</td>
      <td>${item.action}</td>
      <td>${item.vulnerabilities.slice(0, 3).map(v => `<code>${esc(v)}</code>`).join(' ')}</td>
    </tr>`).join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Dependency Audit Report</title>
  <style>
    body{font-family:system-ui,sans-serif;background:#0d1117;color:#c9d1d9;padding:2rem}
    h1{color:#58a6ff;border-bottom:1px solid #30363d;padding-bottom:.5rem}
    .summary{display:flex;gap:1rem;margin-bottom:2rem;flex-wrap:wrap}
    .card{background:#161b22;border:1px solid #30363d;border-radius:8px;padding:1rem 1.5rem}
    .card .num{font-size:2rem;font-weight:bold}
    .card.critical .num{color:#ff4d4f}.card.high .num{color:#fa8c16}
    table{width:100%;border-collapse:collapse;font-size:.85rem}
    th{background:#161b22;padding:.6rem .8rem;text-align:left;border-bottom:1px solid #30363d}
    td{padding:.5rem .8rem;border-bottom:1px solid #21262d;vertical-align:top}
    .badge{display:inline-block;padding:.2rem .5rem;border-radius:4px;font-weight:600;font-size:.75rem}
    .badge-immediate{background:#ff4d4f;color:#fff}
    .badge-soon{background:#fa8c16;color:#fff}
    .badge-planned{background:#fadb14;color:#000}
    code{background:#0d1117;padding:.1rem .3rem;border-radius:3px;font-size:.8rem}
  </style>
</head>
<body>
  <h1>📦 Dependency Audit Report</h1>
  <p style="color:#8b949e">Generated: ${new Date(report.timestamp).toLocaleString()} | Target: ${esc(report.rootDir)}</p>
  <div class="summary">
    <div class="card critical"><div class="num">${report.overallSummary.critical}</div>CRITICAL</div>
    <div class="card high"><div class="num">${report.overallSummary.high}</div>HIGH</div>
    <div class="card"><div class="num">${report.overallSummary.moderate}</div>MODERATE</div>
    <div class="card"><div class="num">${report.overallSummary.totalVulnerable}</div>VULNERABLE</div>
    <div class="card"><div class="num">${report.overallSummary.totalDependencies}</div>TOTAL</div>
  </div>
  <table>
    <thead><tr><th>Priority</th><th>Package</th><th>Ecosystem</th><th>Current</th><th>Fix</th><th>Action</th><th>CVEs</th></tr></thead>
    <tbody>${rows || '<tr><td colspan="7" style="text-align:center;padding:2rem;color:#52c41a">✅ No vulnerable dependencies found</td></tr>'}</tbody>
  </table>
</body>
</html>`;
}

function esc(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

export { auditNpm, auditPip, auditGo } from './auditor';
export * from './types';

program.parse(process.argv);
