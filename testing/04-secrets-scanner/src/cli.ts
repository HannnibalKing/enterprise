#!/usr/bin/env node
import { Command } from 'commander';
import * as fs from 'fs';
import * as path from 'path';
import { SecretsScanner } from './scanner';
import { SecretsReport, SecretFinding } from './types';

const program = new Command();

program
  .name('secrets-scanner')
  .description('Detect leaked secrets, API keys, and credentials in AI-generated codebases')
  .version('1.0.0')
  .argument('<directory>', 'Root directory to scan')
  .option('-o, --output <file>', 'Write JSON report to file')
  .option('--allowlist <patterns>', 'Comma-separated regex patterns to ignore (e.g. test_,example_)')
  .option('--no-entropy', 'Disable high-entropy string detection')
  .action((directory: string, opts) => {
    const rootDir = path.resolve(directory);
    if (!fs.existsSync(rootDir)) {
      console.error(`Directory not found: ${rootDir}`);
      process.exit(1);
    }

    const allowlist = opts.allowlist
      ? opts.allowlist.split(',').map((p: string) => p.trim())
      : [];

    console.log(`\n🔑 Scanning for secrets in: ${rootDir}\n`);

    const scanner = new SecretsScanner(allowlist);
    const report = scanner.scan(rootDir);

    printReport(report);

    if (opts.output) {
      const outFile = path.resolve(opts.output);
      fs.mkdirSync(path.dirname(outFile), { recursive: true });
      fs.writeFileSync(outFile, JSON.stringify(report, null, 2), 'utf-8');
      console.log(`\nJSON report written to: ${outFile}`);
    }

    process.exit(report.passed ? 0 : 1);
  });

function printReport(report: SecretsReport): void {
  const SEV_ICON: Record<SecretFinding['severity'], string> = {
    CRITICAL: '🔴', HIGH: '🟠', MEDIUM: '🟡',
  };

  console.log('╔══════════════════════════════════════════════════════════╗');
  console.log('║           SECRETS SCANNER                                ║');
  console.log('╚══════════════════════════════════════════════════════════╝');
  console.log(`  Target    : ${report.rootDir}`);
  console.log(`  Files     : ${report.filesScanned}`);
  console.log(`  Lines     : ${report.linesScanned.toLocaleString()}`);
  console.log(`  Status    : ${report.passed ? '✅ PASSED' : '❌ FAILED – SECRETS FOUND'}`);
  console.log('');
  console.log('  SUMMARY');
  console.log('  ─────────────────────────────────────────');
  console.log(`  🔴 CRITICAL : ${report.summary.critical}`);
  console.log(`  🟠 HIGH     : ${report.summary.high}`);
  console.log(`  🟡 MEDIUM   : ${report.summary.medium}`);
  console.log(`  Total       : ${report.summary.total}`);
  console.log('');

  if (report.findings.length === 0) {
    console.log('  ✅ No secrets detected. Nice work.');
    console.log('');
    return;
  }

  console.log('  FINDINGS (values are redacted)');
  console.log('  ─────────────────────────────────────────');

  for (const f of report.findings) {
    const rel = path.relative(process.cwd(), f.file);
    console.log('');
    console.log(`  ${SEV_ICON[f.severity]} [${f.severity}] [${f.provider}] ${f.ruleName}`);
    console.log(`  File    : ${rel}:${f.line}:${f.column}`);
    console.log(`  Match   : ${f.raw}`);
    console.log(`  Context : ${f.snippet}`);
    if (f.type === 'entropy' && f.entropy !== undefined) {
      console.log(`  Entropy : ${f.entropy.toFixed(2)} bits (threshold: 4.5 B64 / 3.5 hex)`);
    }
    console.log('  ' + '─'.repeat(58));
  }
  console.log('');
  console.log('  ⚠  NEXT STEPS:');
  console.log('  1. Rotate ALL identified secrets immediately.');
  console.log('  2. Move secrets to environment variables or a secrets manager.');
  console.log('  3. Add .env files to .gitignore before next commit.');
  console.log('  4. Use git-filter-repo to purge secrets from history.');
  console.log('');
}

export { SecretsScanner } from './scanner';
export * from './types';

program.parse(process.argv);
