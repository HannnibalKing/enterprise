#!/usr/bin/env node
import { Command } from 'commander';
import * as fs from 'fs';
import * as path from 'path';
import { AuthAnalyzer } from './analyzer';
import { AuthReport, AuthFinding } from './types';

const program = new Command();

program
  .name('auth-analyzer')
  .description('Analyze authentication and session security in AI-generated codebases')
  .version('1.0.0')
  .argument('<directory>', 'Root directory to analyze')
  .option('-o, --output <file>', 'Write JSON report to file')
  .action((directory: string, opts) => {
    const rootDir = path.resolve(directory);
    if (!fs.existsSync(rootDir)) {
      console.error(`Directory not found: ${rootDir}`);
      process.exit(1);
    }

    console.log(`\n🔐 Analyzing auth flows in: ${rootDir}\n`);
    const analyzer = new AuthAnalyzer();
    const report = analyzer.analyze(rootDir);

    printReport(report);

    if (opts.output) {
      const outFile = path.resolve(opts.output);
      fs.mkdirSync(path.dirname(outFile), { recursive: true });
      fs.writeFileSync(outFile, JSON.stringify(report, null, 2), 'utf-8');
      console.log(`\nJSON report written to: ${outFile}`);
    }

    process.exit(report.passed ? 0 : 1);
  });

function printReport(report: AuthReport): void {
  const SEV_ICON: Record<AuthFinding['severity'], string> = {
    CRITICAL: '🔴', HIGH: '🟠', MEDIUM: '🟡', LOW: '🔵', INFO: 'ℹ️ ',
  };

  console.log('╔══════════════════════════════════════════════════════════╗');
  console.log('║           AUTH FLOW ANALYZER                             ║');
  console.log('╚══════════════════════════════════════════════════════════╝');
  console.log(`  Target  : ${report.rootDir}`);
  console.log(`  Files   : ${report.totalFiles}`);
  console.log(`  Status  : ${report.passed ? '✅ PASSED' : '❌ FAILED'}`);
  console.log('');
  console.log('  SUMMARY');
  console.log('  ──────────────────────────────────');
  console.log(`  🔴 CRITICAL : ${report.summary.critical}`);
  console.log(`  🟠 HIGH     : ${report.summary.high}`);
  console.log(`  🟡 MEDIUM   : ${report.summary.medium}`);
  console.log(`  🔵 LOW      : ${report.summary.low}`);
  console.log(`  Total       : ${report.summary.total}`);
  console.log('');

  console.log('  COVERAGE CHECKS');
  console.log('  ──────────────────────────────────');
  for (const c of report.coverageChecks) {
    console.log(`  ${c.present ? '✅' : '❌'} ${c.name} – ${c.description}`);
  }
  console.log('');

  if (report.findings.length === 0) {
    console.log('  ✅ No auth issues found.');
    return;
  }

  console.log('  FINDINGS');
  console.log('  ──────────────────────────────────');
  const sorted = [...report.findings].sort((a, b) => {
    const order = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW', 'INFO'];
    return order.indexOf(a.severity) - order.indexOf(b.severity);
  });

  for (const f of sorted) {
    const rel = path.relative(process.cwd(), f.file);
    console.log('');
    console.log(`  ${SEV_ICON[f.severity]} [${f.severity}] [${f.category}] ${f.title}`);
    console.log(`  CWE  : ${f.cwe}`);
    console.log(`  File : ${rel}:${f.line}`);
    console.log(`  Code : ${f.snippet}`);
    console.log(`  ⚠    ${f.message}`);
    console.log(`  ✔    ${f.remediation}`);
    console.log('  ' + '─'.repeat(58));
  }
  console.log('');
}

export { AuthAnalyzer } from './analyzer';
export * from './types';

program.parse(process.argv);
