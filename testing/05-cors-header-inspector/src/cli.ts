#!/usr/bin/env node
import { Command } from 'commander';
import * as fs from 'fs';
import * as path from 'path';
import { inspectUrl } from './inspector';
import { StaticCorsAnalyzer } from './static-analyzer';
import { HeaderReport, LiveInspectionResult, StaticAnalysisResult } from './types';

const program = new Command();

program
  .name('header-inspector')
  .description('Inspect HTTP security headers and CORS configuration')
  .version('1.0.0')
  .option('-u, --url <urls>', 'Comma-separated URLs to inspect live')
  .option('-d, --dir <directory>', 'Source directory for static CORS analysis')
  .option('-o, --output <file>', 'Write JSON report to file')
  .action(async (opts) => {
    const liveResults: LiveInspectionResult[] = [];
    const staticResults: StaticAnalysisResult[] = [];

    // Live inspection
    if (opts.url) {
      const urls = opts.url.split(',').map((u: string) => u.trim());
      for (const url of urls) {
        console.log(`\n🌐 Inspecting: ${url}`);
        try {
          const result = await inspectUrl(url);
          liveResults.push(result);
          printLiveResult(result);
        } catch (err) {
          console.error(`  ❌ Failed to inspect ${url}: ${(err as Error).message}`);
        }
      }
    }

    // Static analysis
    if (opts.dir) {
      const sourceDir = path.resolve(opts.dir);
      if (!fs.existsSync(sourceDir)) {
        console.error(`Directory not found: ${sourceDir}`);
      } else {
        console.log(`\n🔍 Static CORS analysis: ${sourceDir}`);
        const analyzer = new StaticCorsAnalyzer();
        const results = analyzer.analyze(sourceDir);
        staticResults.push(...results);
        printStaticResults(results);
      }
    }

    if (!opts.url && !opts.dir) {
      console.log('Provide --url <url> for live inspection and/or --dir <path> for static analysis.');
      program.help();
    }

    const report: HeaderReport = {
      reportId: `headers-${Date.now()}`,
      timestamp: new Date().toISOString(),
      liveResults,
      staticResults,
      passed:
        liveResults.every((r) => r.passed) &&
        staticResults.filter((r) => r.severity === 'CRITICAL' || r.severity === 'HIGH').length === 0,
    };

    if (opts.output) {
      const outFile = path.resolve(opts.output);
      fs.mkdirSync(path.dirname(outFile), { recursive: true });
      fs.writeFileSync(outFile, JSON.stringify(report, null, 2), 'utf-8');
      console.log(`\nJSON report written to: ${outFile}`);
    }

    process.exit(report.passed ? 0 : 1);
  });

function printLiveResult(result: LiveInspectionResult): void {
  const gradeColor = result.grade.startsWith('A') ? '✅' : result.grade === 'B' ? '🟡' : '🔴';
  console.log(`  Status  : ${result.statusCode} | Time: ${result.responseTime}ms`);
  console.log(`  Score   : ${result.score}/100  Grade: ${gradeColor} ${result.grade}`);
  console.log('');

  console.log('  HEADER CHECKS');
  console.log('  ─────────────────────────────────────────────');
  for (const c of result.headerChecks) {
    const icon = c.passed ? '✅' : c.severity === 'CRITICAL' || c.severity === 'HIGH' ? '🔴' : c.severity === 'MEDIUM' ? '🟡' : '🔵';
    console.log(`  ${icon} ${c.header}`);
    console.log(`     ${c.message}`);
    if (!c.passed) console.log(`     → ${c.recommendation}`);
  }

  console.log('');
  console.log('  CORS ANALYSIS');
  console.log('  ─────────────────────────────────────────────');
  console.log(`  Allow-Origin      : ${result.corsCheck.allowOrigin ?? '(not set)'}`);
  console.log(`  Allow-Methods     : ${result.corsCheck.allowMethods ?? '(not set)'}`);
  console.log(`  Allow-Credentials : ${result.corsCheck.allowCredentials ?? '(not set)'}`);
  console.log(`  Max-Age           : ${result.corsCheck.maxAge ?? '(not set)'}`);

  if (result.corsCheck.issues.length > 0) {
    console.log('');
    for (const issue of result.corsCheck.issues) {
      console.log(`  ⚠  ${issue}`);
    }
  } else {
    console.log('  ✅ CORS configuration looks good');
  }
  console.log('');
}

function printStaticResults(results: StaticAnalysisResult[]): void {
  if (results.length === 0) {
    console.log('  ✅ No static CORS issues found\n');
    return;
  }
  for (const r of results) {
    const rel = path.relative(process.cwd(), r.file);
    const icon = r.severity === 'CRITICAL' ? '🔴' : r.severity === 'HIGH' ? '🟠' : '🟡';
    console.log(`  ${icon} [${r.severity}] ${r.issue}`);
    console.log(`     File : ${rel}:${r.line}`);
    console.log(`     Code : ${r.snippet}`);
    console.log(`     Fix  : ${r.remediation}`);
    console.log('');
  }
}

export { inspectUrl } from './inspector';
export { StaticCorsAnalyzer } from './static-analyzer';
export * from './types';

program.parse(process.argv);
