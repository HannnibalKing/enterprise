#!/usr/bin/env node
import { Command } from 'commander';
import * as fs from 'fs';
import * as path from 'path';
import { ContractValidator } from './validator';
import { RouteExtractor } from './extractor';
import { ValidationReport, ContractIssue } from './types';

const program = new Command();

program
  .name('api-validator')
  .description('Validate that your API implementation matches its OpenAPI 3.x contract')
  .version('1.0.0')
  .requiredOption('-s, --spec <file>', 'Path to OpenAPI spec file (YAML or JSON)')
  .requiredOption('-d, --dir <directory>', 'Source directory to extract routes from')
  .option('-o, --output <file>', 'Write JSON report to file')
  .option('--no-fail-on-undocumented', 'Do not fail when undocumented routes are found')
  .action((opts) => {
    const specFile = path.resolve(opts.spec);
    const sourceDir = path.resolve(opts.dir);

    if (!fs.existsSync(specFile)) {
      console.error(`Spec file not found: ${specFile}`);
      process.exit(1);
    }
    if (!fs.existsSync(sourceDir)) {
      console.error(`Source directory not found: ${sourceDir}`);
      process.exit(1);
    }

    const validator = new ContractValidator();
    const extractor = new RouteExtractor();

    console.log(`\n📋 Loading spec: ${specFile}`);
    const spec = validator.loadSpec(specFile);

    console.log(`🔍 Extracting routes from: ${sourceDir}`);
    const routes = extractor.extract(sourceDir);
    console.log(`   Found ${routes.length} route(s)\n`);

    const report = validator.validate(spec, routes, specFile, sourceDir);

    printReport(report);

    if (opts.output) {
      const outFile = path.resolve(opts.output);
      fs.mkdirSync(path.dirname(outFile), { recursive: true });
      fs.writeFileSync(outFile, JSON.stringify(report, null, 2), 'utf-8');
      console.log(`\nJSON report written to: ${outFile}`);
    }

    process.exit(report.passed ? 0 : 1);
  });

function printReport(report: ValidationReport): void {
  console.log('╔══════════════════════════════════════════════════════════╗');
  console.log('║           API CONTRACT VALIDATOR                         ║');
  console.log('╚══════════════════════════════════════════════════════════╝');
  console.log(`  API         : ${report.specTitle} v${report.specVersion}`);
  console.log(`  Spec Routes : ${report.totalRoutesDefined}`);
  console.log(`  Code Routes : ${report.totalRoutesFound}`);
  console.log(`  Status      : ${report.passed ? '✅ PASSED' : '❌ FAILED'}`);
  console.log('');
  console.log('  SUMMARY');
  console.log('  ─────────────────────────────────────────');
  console.log(`  🔴 Errors   : ${report.summary.errors}`);
  console.log(`  🟡 Warnings : ${report.summary.warnings}`);
  console.log(`  ℹ  Info     : ${report.summary.info}`);
  console.log(`  Total       : ${report.summary.total}`);
  console.log('');

  if (report.issues.length === 0) {
    console.log('  ✅ All checks passed. API contract is fully compliant.');
    return;
  }

  const byCode = (a: ContractIssue, b: ContractIssue) => {
    const order: Record<ContractIssue['severity'], number> = { ERROR: 0, WARNING: 1, INFO: 2 };
    return order[a.severity] - order[b.severity];
  };

  for (const issue of [...report.issues].sort(byCode)) {
    const icon = issue.severity === 'ERROR' ? '🔴' : issue.severity === 'WARNING' ? '🟡' : 'ℹ️ ';
    console.log(`  ${icon} [${issue.code}] ${issue.message}`);
    if (issue.detail) console.log(`     → ${issue.detail}`);
  }
  console.log('');
}

program.parse(process.argv);
