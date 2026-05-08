import * as fs from 'fs';
import * as path from 'path';
import { ScanReport, ScanResult, Vulnerability } from './types';

const SEVERITY_ORDER: Vulnerability['severity'][] = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW', 'INFO'];

export class Reporter {
  buildReport(
    results: ScanResult[],
    rootDir: string,
    duration: number
  ): ScanReport {
    const allVulns = results.flatMap((r) => r.vulnerabilities);
    const summary = {
      critical: 0, high: 0, medium: 0, low: 0, info: 0, total: allVulns.length,
    };
    for (const v of allVulns) {
      switch (v.severity) {
        case 'CRITICAL': summary.critical++; break;
        case 'HIGH': summary.high++; break;
        case 'MEDIUM': summary.medium++; break;
        case 'LOW': summary.low++; break;
        case 'INFO': summary.info++; break;
      }
    }

    return {
      scanId: `scan-${Date.now()}`,
      timestamp: new Date().toISOString(),
      rootDir,
      totalFiles: results.length,
      totalLines: results.reduce((a, r) => a + r.linesScanned, 0),
      duration,
      summary,
      results,
      passed: summary.critical === 0 && summary.high === 0,
    };
  }

  toJson(report: ScanReport): string {
    return JSON.stringify(report, null, 2);
  }

  toTable(report: ScanReport): string {
    const lines: string[] = [];
    lines.push('');
    lines.push('╔══════════════════════════════════════════════════════════════╗');
    lines.push('║         ENTERPRISE SECURITY SCANNER – OWASP TOP 10          ║');
    lines.push('╚══════════════════════════════════════════════════════════════╝');
    lines.push(`  Scan ID  : ${report.scanId}`);
    lines.push(`  Target   : ${report.rootDir}`);
    lines.push(`  Files    : ${report.totalFiles}  |  Lines: ${report.totalLines.toLocaleString()}`);
    lines.push(`  Duration : ${report.duration}ms`);
    lines.push(`  Status   : ${report.passed ? '✅ PASSED' : '❌ FAILED'}`);
    lines.push('');
    lines.push('  SUMMARY');
    lines.push('  ─────────────────────────────────────────');
    lines.push(`  🔴 CRITICAL : ${report.summary.critical}`);
    lines.push(`  🟠 HIGH     : ${report.summary.high}`);
    lines.push(`  🟡 MEDIUM   : ${report.summary.medium}`);
    lines.push(`  🔵 LOW      : ${report.summary.low}`);
    lines.push(`  ⚪ INFO     : ${report.summary.info}`);
    lines.push(`  Total       : ${report.summary.total}`);
    lines.push('');

    if (report.summary.total === 0) {
      lines.push('  No vulnerabilities found. Great work!');
      lines.push('');
      return lines.join('\n');
    }

    lines.push('  FINDINGS');
    lines.push('  ─────────────────────────────────────────');

    const sorted = report.results
      .flatMap((r) => r.vulnerabilities)
      .sort((a, b) => SEVERITY_ORDER.indexOf(a.severity) - SEVERITY_ORDER.indexOf(b.severity));

    for (const v of sorted) {
      const rel = path.relative(report.rootDir, v.file);
      lines.push('');
      lines.push(`  [${v.severity.padEnd(8)}] ${v.rule} – ${v.category}`);
      lines.push(`  OWASP: ${v.owaspCategory}`);
      lines.push(`  CWE  : ${v.cwe}`);
      lines.push(`  File : ${rel}:${v.line}:${v.column}`);
      lines.push(`  ❯    ${v.snippet}`);
      lines.push(`  ⚠    ${v.message}`);
      lines.push(`  ✔    ${v.remediation}`);
      lines.push('  ' + '─'.repeat(60));
    }

    lines.push('');
    return lines.join('\n');
  }

  toHtml(report: ScanReport): string {
    const rows = report.results
      .flatMap((r) => r.vulnerabilities)
      .sort((a, b) =>
        SEVERITY_ORDER.indexOf(a.severity) - SEVERITY_ORDER.indexOf(b.severity)
      )
      .map((v) => {
        const rel = path.relative(report.rootDir, v.file);
        const sev = v.severity.toLowerCase();
        return `
        <tr class="sev-${sev}">
          <td><span class="badge badge-${sev}">${v.severity}</span></td>
          <td>${v.rule}</td>
          <td>${esc(v.category)}</td>
          <td>${esc(v.owaspCategory)}</td>
          <td>${esc(v.cwe)}</td>
          <td><code>${esc(rel)}:${v.line}</code></td>
          <td><code>${esc(v.snippet)}</code></td>
          <td>${esc(v.message)}</td>
        </tr>`;
      }).join('\n');

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Security Scan Report – ${new Date(report.timestamp).toLocaleString()}</title>
  <style>
    body { font-family: system-ui, sans-serif; background: #0d1117; color: #c9d1d9; margin: 0; padding: 2rem; }
    h1 { color: #58a6ff; border-bottom: 1px solid #30363d; padding-bottom: .5rem; }
    .meta { color: #8b949e; font-size: .9rem; margin-bottom: 1.5rem; }
    .summary { display: flex; gap: 1rem; margin-bottom: 2rem; }
    .card { background: #161b22; border: 1px solid #30363d; border-radius: 8px; padding: 1rem 1.5rem; }
    .card .num { font-size: 2rem; font-weight: bold; }
    .card.critical .num { color: #ff4d4f; }
    .card.high .num { color: #fa8c16; }
    .card.medium .num { color: #fadb14; }
    .card.low .num { color: #52c41a; }
    table { width: 100%; border-collapse: collapse; font-size: .85rem; }
    th { background: #161b22; padding: .6rem .8rem; text-align: left; border-bottom: 1px solid #30363d; }
    td { padding: .5rem .8rem; border-bottom: 1px solid #21262d; vertical-align: top; }
    tr:hover td { background: #161b22; }
    .badge { display: inline-block; padding: .2rem .5rem; border-radius: 4px; font-weight: 600; font-size: .75rem; }
    .badge-critical { background: #ff4d4f; color: #fff; }
    .badge-high { background: #fa8c16; color: #fff; }
    .badge-medium { background: #fadb14; color: #000; }
    .badge-low { background: #52c41a; color: #fff; }
    .badge-info { background: #1677ff; color: #fff; }
    code { background: #0d1117; padding: .1rem .3rem; border-radius: 3px; font-size: .8rem; }
    .status-pass { color: #52c41a; font-weight: bold; }
    .status-fail { color: #ff4d4f; font-weight: bold; }
  </style>
</head>
<body>
  <h1>🔒 Security Scan Report</h1>
  <div class="meta">
    <strong>Scan ID:</strong> ${report.scanId} &nbsp;|&nbsp;
    <strong>Time:</strong> ${new Date(report.timestamp).toLocaleString()} &nbsp;|&nbsp;
    <strong>Target:</strong> ${esc(report.rootDir)} &nbsp;|&nbsp;
    <strong>Files Scanned:</strong> ${report.totalFiles} &nbsp;|&nbsp;
    <strong>Duration:</strong> ${report.duration}ms &nbsp;|&nbsp;
    <strong>Status:</strong>
    <span class="${report.passed ? 'status-pass' : 'status-fail'}">${report.passed ? 'PASSED' : 'FAILED'}</span>
  </div>
  <div class="summary">
    <div class="card critical"><div class="num">${report.summary.critical}</div>CRITICAL</div>
    <div class="card high"><div class="num">${report.summary.high}</div>HIGH</div>
    <div class="card medium"><div class="num">${report.summary.medium}</div>MEDIUM</div>
    <div class="card low"><div class="num">${report.summary.low}</div>LOW</div>
    <div class="card"><div class="num">${report.summary.total}</div>TOTAL</div>
  </div>
  <table>
    <thead>
      <tr>
        <th>Severity</th><th>Rule</th><th>Category</th><th>OWASP</th><th>CWE</th>
        <th>Location</th><th>Snippet</th><th>Description</th>
      </tr>
    </thead>
    <tbody>${rows || '<tr><td colspan="8" style="text-align:center;padding:2rem;color:#52c41a">✅ No vulnerabilities found</td></tr>'}</tbody>
  </table>
</body>
</html>`;
  }

  writeReport(report: ScanReport, outputFile: string, format: 'json' | 'html'): void {
    const content = format === 'json' ? this.toJson(report) : this.toHtml(report);
    fs.mkdirSync(path.dirname(outputFile), { recursive: true });
    fs.writeFileSync(outputFile, content, 'utf-8');
  }
}

function esc(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
