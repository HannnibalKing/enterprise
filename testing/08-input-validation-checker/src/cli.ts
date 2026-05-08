#!/usr/bin/env node
import { Command } from 'commander';
import * as fs from 'fs';
import * as path from 'path';
import { ValidationChecker } from './checker';
import { ValidationReport, ValidationIssue } from './checker';

const program = new Command();

program
  .name('validation-checker')
  .description('Detect missing input validation and sanitization in AI-generated route handlers')
  .version('1.0.0')
  .argument('<directory>', 'Root directory to check')
  .option('-o, --output <file>', 'Write JSON report to file')
  .action((directory: string, opts) => {
    const rootDir = path.resolve(directory);
    if (!fs.existsSync(rootDir)) {
      console.error(`Directory not found: ${rootDir}`);
      process.exit(1);
    }

    console.log(`\n✅ Checking input validation in: ${rootDir}\n`);
    const checker = new ValidationChecker();
    const report = checker.check(rootDir);

    printReport(report);

    if (opts.output) {
      const outFile = path.resolve(opts.output);
      fs.mkdirSync(path.dirname(outFile), { recursive: true });
      fs.writeFileSync(outFile, JSON.stringify(report, null, 2), 'utf-8');
      console.log(`\nJSON report: ${outFile}`);
    }

    process.exit(report.passed ? 0 : 1);
  });

function printReport(report: ValidationReport): void {
  const SEV_ICON: Record<ValidationIssue['severity'], string> = {
    CRITICAL: '🔴', HIGH: '🟠', MEDIUM: '🟡', LOW: '🔵', INFO: 'ℹ️ ',
  };

  console.log('╔══════════════════════════════════════════════════════════╗');
  console.log('║           INPUT VALIDATION CHECKER                       ║');
  console.log('╚══════════════════════════════════════════════════════════╝');
  console.log(`  Files     : ${report.filesAnalyzed}`);
  console.log(`  Status    : ${report.passed ? '✅ PASSED' : '❌ FAILED'}`);
  console.log('');
  console.log('  SUMMARY');
  console.log('  ─────────────────────────────────────────');
  console.log(`  🔴 CRITICAL : ${report.summary.critical}`);
  console.log(`  🟠 HIGH     : ${report.summary.high}`);
  console.log(`  🟡 MEDIUM   : ${report.summary.medium}`);
  console.log(`  Total       : ${report.summary.total}`);
  console.log('');

  if (report.issues.length === 0) {
    console.log('  ✅ All inputs appear to be validated. Great work!');
    return;
  }

  const sorted = [...report.issues].sort((a, b) => {
    const o = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW', 'INFO'];
    return o.indexOf(a.severity) - o.indexOf(b.severity);
  });

  for (const issue of sorted) {
    const rel = path.relative(process.cwd(), issue.file);
    console.log('');
    console.log(`  ${SEV_ICON[issue.severity]} [${issue.severity}] [${issue.category}] ${issue.title}`);
    console.log(`  CWE  : ${issue.cwe}`);
    console.log(`  File : ${rel}:${issue.line}`);
    console.log(`  Code : ${issue.snippet}`);
    console.log(`  ⚠    ${issue.message}`);
    console.log(`  ✔    ${issue.remediation}`);
    if (issue.validationLibrary) {
      console.log(`  ℹ    ${issue.validationLibrary} is imported — verify it validates this specific input`);
    }
    console.log('  ' + '─'.repeat(58));
  }

  console.log('');
  console.log('  RECOMMENDED VALIDATION LIBRARIES');
  console.log('  ─────────────────────────────────────────');
  console.log('  • Zod        (TypeScript-first, excellent DX): npm i zod');
  console.log('  • Joi        (battle-tested, rich API):        npm i joi');
  console.log('  • class-validator (NestJS ecosystem):          npm i class-validator');
  console.log('  • express-validator (Express-native):          npm i express-validator');
  console.log('');
}

export { ValidationChecker } from './checker';
export type { ValidationReport, ValidationIssue } from './checker';

program.parse(process.argv);
