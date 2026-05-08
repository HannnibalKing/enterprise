#!/usr/bin/env node
import { Command } from 'commander';
import * as fs from 'fs';
import * as path from 'path';
import { auditTls, TlsAuditResult } from './auditor';

const program = new Command();

program
  .name('tls-auditor')
  .description('Audit TLS/SSL configuration, certificate chain, cipher suites, and HSTS')
  .version('1.0.0')
  .argument('<hosts>', 'Comma-separated hostnames or URLs to audit (e.g. api.example.com,app.example.com)')
  .option('-p, --port <port>', 'Default port for bare hostnames', '443')
  .option('-o, --output <file>', 'Write JSON report to file')
  .action(async (hostsArg: string, opts) => {
    const defaultPort = parseInt(opts.port, 10);

    const targets = hostsArg.split(',').map((h) => {
      h = h.trim();
      try {
        const u = new URL(h);
        return { host: u.hostname, port: parseInt(u.port || '443', 10) };
      } catch {
        return { host: h, port: defaultPort };
      }
    });

    console.log('\n🔒 TLS/SSL AUDITOR\n');

    const results: TlsAuditResult[] = [];
    for (const target of targets) {
      console.log(`  Auditing ${target.host}:${target.port}...`);
      try {
        const result = await auditTls(target.host, target.port);
        results.push(result);
        printResult(result);
      } catch (err) {
        console.error(`  ❌ Failed: ${(err as Error).message}`);
      }
    }

    const report = {
      reportId: `tls-${Date.now()}`,
      timestamp: new Date().toISOString(),
      results,
      passed: results.every((r) => r.passed),
    };

    if (opts.output) {
      const outFile = path.resolve(opts.output);
      fs.mkdirSync(path.dirname(outFile), { recursive: true });
      fs.writeFileSync(outFile, JSON.stringify(report, null, 2), 'utf-8');
      console.log(`\nJSON report: ${outFile}`);
    }

    process.exit(report.passed ? 0 : 1);
  });

function printResult(r: TlsAuditResult): void {
  const gradeIcon = r.grade.startsWith('A') ? '🟢' : r.grade === 'B' ? '🟡' : '🔴';
  console.log('');
  console.log(`  ┌─ ${r.host}:${r.port}`);
  console.log(`  │  Grade     : ${gradeIcon} ${r.grade}  (${r.score}/100)`);
  console.log(`  │  Protocol  : ${r.negotiatedProtocol}`);
  console.log(`  │  Cipher    : ${r.negotiatedCipher}`);

  if (r.certInfo) {
    console.log(`  │  Cert      : valid ${r.certInfo.daysUntilExpiry} more days`);
    console.log(`  │  Issuer    : ${r.certInfo.issuer}`);
  }

  console.log('  │');
  console.log('  │  CHECKS');
  for (const c of r.checks) {
    const icon = c.passed ? '  ✅' : c.severity === 'CRITICAL' ? '  🔴' : c.severity === 'HIGH' ? '  🟠' : '  🟡';
    console.log(`  │  ${icon} ${c.name}: ${c.value}`);
    if (!c.passed) {
      console.log(`  │       ⚠  ${c.message}`);
      if (c.recommendation) console.log(`  │       → ${c.recommendation}`);
    }
  }

  if (r.errors.length > 0) {
    console.log('  │');
    console.log('  │  ERRORS');
    for (const e of r.errors) console.log(`  │  ❌ ${e}`);
  }

  console.log('  └──────────────────────────────────────────────────────');
  console.log('');
}

export { auditTls } from './auditor';
export type { TlsAuditResult } from './auditor';

program.parse(process.argv);
