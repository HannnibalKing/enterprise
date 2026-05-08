#!/usr/bin/env node
import { Command } from 'commander';
import * as path from 'path';
import * as fs from 'fs';
import { Scanner } from './scanner';
import { Reporter } from './reporter';
import { ScanOptions, Vulnerability } from './types';

const program = new Command();

program
  .name('security-scanner')
  .description('Enterprise OWASP Top 10 static security scanner for AI-generated codebases')
  .version('1.0.0')
  .argument('<directory>', 'Root directory to scan')
  .option('-o, --output <file>', 'Write report to file (auto-detects format from extension)')
  .option(
    '-f, --format <format>',
    'Output format: table | json | html',
    'table'
  )
  .option(
    '-s, --severity <levels>',
    'Comma-separated severity levels to include (CRITICAL,HIGH,MEDIUM,LOW,INFO)',
    'CRITICAL,HIGH,MEDIUM,LOW,INFO'
  )
  .option(
    '--fail-on <severity>',
    'Exit with code 1 if any finding at this severity or above (CRITICAL|HIGH|MEDIUM|LOW)',
    'HIGH'
  )
  .option('--exclude <dirs>', 'Additional comma-separated directories to exclude')
  .action(async (directory: string, opts) => {
    const rootDir = path.resolve(directory);

    if (!fs.existsSync(rootDir)) {
      console.error(`Directory not found: ${rootDir}`);
      process.exit(1);
    }

    const severityLevels = opts.severity.split(',').map((s: string) => s.trim().toUpperCase()) as Vulnerability['severity'][];
    const extraExcludes = opts.exclude ? opts.exclude.split(',').map((s: string) => s.trim()) : [];

    const options: ScanOptions = {
      rootDir,
      severity: severityLevels,
      exclude: [...(extraExcludes)],
      output: opts.format as ScanOptions['output'],
      outputFile: opts.output,
      failOn: opts.failOn?.toUpperCase() as Vulnerability['severity'],
    };

    console.log(`\n🔍 Scanning: ${rootDir}\n`);
    const start = Date.now();

    const scanner = new Scanner(options);
    const results = await scanner.scan();
    const duration = Date.now() - start;

    const reporter = new Reporter();
    const report = reporter.buildReport(results, rootDir, duration);

    // Determine output format
    let format = opts.format as 'table' | 'json' | 'html';
    if (opts.output) {
      if (opts.output.endsWith('.html')) format = 'html';
      else if (opts.output.endsWith('.json')) format = 'json';
    }

    if (format === 'json') {
      const out = reporter.toJson(report);
      if (opts.output) {
        reporter.writeReport(report, opts.output, 'json');
        console.log(`Report written to: ${opts.output}`);
      } else {
        console.log(out);
      }
    } else if (format === 'html') {
      if (opts.output) {
        reporter.writeReport(report, opts.output, 'html');
        console.log(`HTML report written to: ${opts.output}`);
      } else {
        console.error('HTML format requires --output <file>');
        process.exit(1);
      }
    } else {
      console.log(reporter.toTable(report));
      if (opts.output) {
        reporter.writeReport(report, opts.output, 'json');
        console.log(`JSON report also written to: ${opts.output}`);
      }
    }

    // Exit code based on failOn threshold
    const SEVERITY_ORDER: Vulnerability['severity'][] = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW', 'INFO'];
    const failIdx = SEVERITY_ORDER.indexOf(options.failOn ?? 'HIGH');
    const hasFailing = results
      .flatMap((r) => r.vulnerabilities)
      .some((v) => SEVERITY_ORDER.indexOf(v.severity) <= failIdx);

    process.exit(hasFailing ? 1 : 0);
  });

program.parse(process.argv);
