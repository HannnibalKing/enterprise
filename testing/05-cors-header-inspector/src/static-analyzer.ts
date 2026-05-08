import * as fs from 'fs';
import * as path from 'path';
import { StaticAnalysisResult, HeaderSeverity } from './types';

interface StaticRule {
  id: string;
  pattern: RegExp;
  issue: string;
  severity: HeaderSeverity;
  remediation: string;
}

const STATIC_RULES: StaticRule[] = [
  {
    id: 'CORS001',
    pattern: /origin\s*:\s*['"]\*['"]|cors\s*\(\s*\{[^}]*origin\s*:\s*['"]\*['"]/gi,
    issue: 'CORS wildcard origin (*) in configuration',
    severity: 'HIGH',
    remediation: "Replace '*' with an explicit allowlist: ['https://app.example.com']",
  },
  {
    id: 'CORS002',
    pattern: /credentials\s*:\s*true[^}]*origin\s*:\s*['"]\*['"]|origin\s*:\s*['"]\*['"]\s*[,}][^}]*credentials\s*:\s*true/gi,
    issue: 'Wildcard CORS origin combined with credentials: true (invalid and dangerous)',
    severity: 'CRITICAL',
    remediation: 'CORS credentials require an explicit origin, never a wildcard.',
  },
  {
    id: 'CORS003',
    pattern: /allowedOrigins\s*:\s*(?:req\.headers\.origin|req\.get\s*\(\s*['"]origin['"]\))/gi,
    issue: 'CORS origin reflected from request header without validation',
    severity: 'HIGH',
    remediation: 'Validate the requested origin against a pre-defined allowlist.',
  },
  {
    id: 'HDR001',
    pattern: /helmet\s*\(\s*\{[^}]*contentSecurityPolicy\s*:\s*false/gi,
    issue: 'helmet() called with CSP disabled',
    severity: 'HIGH',
    remediation: 'Enable CSP in helmet and configure a strict policy.',
  },
  {
    id: 'HDR002',
    pattern: /res\.setHeader\s*\(\s*['"]X-Powered-By['"]/gi,
    issue: "X-Powered-By header explicitly set, exposing server technology",
    severity: 'LOW',
    remediation: "Use helmet() or app.disable('x-powered-by') to suppress this header.",
  },
  {
    id: 'HDR003',
    pattern: /helmet\s*\(\s*\{[^}]*hsts\s*:\s*false/gi,
    issue: 'HSTS explicitly disabled in helmet configuration',
    severity: 'HIGH',
    remediation: 'Enable HSTS: hsts: { maxAge: 31536000, includeSubDomains: true, preload: true }',
  },
  {
    id: 'HDR004',
    pattern: /Access-Control-Allow-Origin['"]\s*:\s*['"]\*['"]/gi,
    issue: 'Hardcoded CORS wildcard in manual header',
    severity: 'HIGH',
    remediation: 'Set an explicit origin and validate against an allowlist.',
  },
];

export class StaticCorsAnalyzer {
  analyze(sourceDir: string): StaticAnalysisResult[] {
    const results: StaticAnalysisResult[] = [];
    const files = this.collectFiles(sourceDir);

    for (const file of files) {
      let content: string;
      try { content = fs.readFileSync(file, 'utf-8'); } catch { continue; }
      const lines = content.split('\n');

      for (const rule of STATIC_RULES) {
        rule.pattern.lastIndex = 0;
        let match: RegExpExecArray | null;
        while ((match = rule.pattern.exec(content)) !== null) {
          const linesBefore = content.slice(0, match.index).split('\n');
          const lineNum = linesBefore.length;
          results.push({
            file,
            line: lineNum,
            issue: rule.issue,
            severity: rule.severity,
            snippet: lines[lineNum - 1]?.trim() ?? '',
            remediation: rule.remediation,
          });
          rule.pattern.lastIndex = 0;
          break;
        }
      }
    }
    return results;
  }

  private collectFiles(dir: string): string[] {
    const results: string[] = [];
    const EXCLUDES = ['node_modules', 'dist', 'build', '.git'];
    const EXTS = ['.ts', '.js', '.mjs', '.tsx', '.jsx'];
    let entries: fs.Dirent[];
    try { entries = fs.readdirSync(dir, { withFileTypes: true }); } catch { return results; }
    for (const e of entries) {
      const full = path.join(dir, e.name);
      if (e.isDirectory() && !EXCLUDES.includes(e.name)) results.push(...this.collectFiles(full));
      else if (e.isFile() && EXTS.includes(path.extname(e.name).toLowerCase())) results.push(full);
    }
    return results;
  }
}
