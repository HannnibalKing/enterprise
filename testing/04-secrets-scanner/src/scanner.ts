import * as fs from 'fs';
import * as path from 'path';
import { SECRET_PATTERNS } from './patterns';
import { SecretFinding, SecretsReport } from './types';

// Files/dirs always excluded from scanning
const EXCLUDE_DIRS = ['node_modules', 'dist', 'build', '.git', 'coverage', '__pycache__', '.next', '.nuxt'];
const EXCLUDE_FILES = ['.lock', '.map', '.min.js', '.min.css', 'package-lock.json', 'yarn.lock'];
const SCAN_EXTENSIONS = [
  '.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs',
  '.py', '.go', '.rb', '.java', '.php', '.cs',
  '.env', '.env.local', '.env.production', '.env.staging',
  '.yaml', '.yml', '.json', '.toml', '.ini', '.cfg', '.conf',
  '.sh', '.bash', '.zsh', '.fish',
  '.tf', '.tfvars',
];

// Characters used for entropy analysis
const BASE64_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
const HEX_CHARS = '0123456789abcdefABCDEF';

/** Shannon entropy of a string */
function shannonEntropy(str: string, charset: string): number {
  const freq = new Map<string, number>();
  for (const c of str) {
    if (charset.includes(c)) freq.set(c, (freq.get(c) ?? 0) + 1);
  }
  let entropy = 0;
  for (const count of freq.values()) {
    const p = count / str.length;
    entropy -= p * Math.log2(p);
  }
  return entropy;
}

/** Redact a secret, keeping first 4 and last 4 chars */
function redact(s: string): string {
  if (s.length <= 8) return '***REDACTED***';
  return `${s.slice(0, 4)}${'*'.repeat(Math.min(s.length - 8, 20))}${s.slice(-4)}`;
}

export class SecretsScanner {
  private allowlist: RegExp[];

  constructor(allowlistPatterns: string[] = []) {
    this.allowlist = allowlistPatterns.map((p) => new RegExp(p));
  }

  scan(rootDir: string): SecretsReport {
    const start = Date.now();
    const files = this.collectFiles(rootDir);
    const findings: SecretFinding[] = [];
    let totalLines = 0;

    for (const file of files) {
      let content: string;
      try {
        content = fs.readFileSync(file, 'utf-8');
      } catch {
        continue;
      }

      const lines = content.split('\n');
      totalLines += lines.length;

      // Pattern-based detection
      for (const rule of SECRET_PATTERNS) {
        rule.pattern.lastIndex = 0;
        let match: RegExpExecArray | null;

        while ((match = rule.pattern.exec(content)) !== null) {
          const raw = match[0];

          // Skip if allowlisted
          if (this.allowlist.some((a) => a.test(raw))) continue;

          // Skip false positives
          if (rule.falsePositiveFilter?.test(raw)) continue;

          const linesBefore = content.slice(0, match.index).split('\n');
          const lineNum = linesBefore.length;
          const col = linesBefore[linesBefore.length - 1].length + 1;
          const snippet = lines[lineNum - 1]?.trim() ?? '';

          if (!this.isAlreadyFound(findings, file, lineNum, rule.id)) {
            findings.push({
              id: `${rule.id}-${path.relative(rootDir, file)}-${lineNum}`,
              ruleId: rule.id,
              ruleName: rule.name,
              provider: rule.provider,
              severity: rule.severity,
              file,
              line: lineNum,
              column: col,
              snippet: redact(snippet),
              raw: redact(raw),
              type: 'pattern',
            });
          }

          rule.pattern.lastIndex = 0;
          break; // one finding per rule per file
        }
      }

      // Entropy-based detection on each line
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        // Look for quoted strings that might be secrets
        const quotedStrings = line.match(/['"`]([A-Za-z0-9+/=\-_]{20,60})['"`]/g);
        if (!quotedStrings) continue;

        for (const qs of quotedStrings) {
          const val = qs.slice(1, -1);

          const b64Entropy = shannonEntropy(val, BASE64_CHARS);
          const hexEntropy = shannonEntropy(val, HEX_CHARS);

          const isHighEntropy = b64Entropy > 4.5 || hexEntropy > 3.5;
          if (!isHighEntropy) continue;

          // Skip common false-positives
          if (/process\.env|example|placeholder|test|mock|dummy|lorem|ipsum/i.test(line)) continue;
          if (this.allowlist.some((a) => a.test(val))) continue;

          const lineNum = i + 1;
          if (!this.isAlreadyFound(findings, file, lineNum, 'ENTROPY')) {
            findings.push({
              id: `ENTROPY-${path.relative(rootDir, file)}-${lineNum}`,
              ruleId: 'ENTROPY001',
              ruleName: 'High-entropy string',
              provider: 'Generic',
              severity: 'MEDIUM',
              file,
              line: lineNum,
              column: line.indexOf(qs) + 1,
              snippet: redact(line.trim()),
              raw: redact(val),
              type: 'entropy',
              entropy: Math.max(b64Entropy, hexEntropy),
            });
          }
        }
      }
    }

    const summary = {
      critical: findings.filter((f) => f.severity === 'CRITICAL').length,
      high: findings.filter((f) => f.severity === 'HIGH').length,
      medium: findings.filter((f) => f.severity === 'MEDIUM').length,
      total: findings.length,
    };

    return {
      reportId: `secrets-${Date.now()}`,
      timestamp: new Date().toISOString(),
      rootDir,
      filesScanned: files.length,
      linesScanned: totalLines,
      findings,
      summary,
      passed: summary.critical === 0 && summary.high === 0,
    };
  }

  private isAlreadyFound(findings: SecretFinding[], file: string, line: number, ruleId: string): boolean {
    return findings.some((f) => f.file === file && f.line === line && f.ruleId === ruleId);
  }

  private collectFiles(dir: string): string[] {
    const results: string[] = [];
    let entries: fs.Dirent[];
    try { entries = fs.readdirSync(dir, { withFileTypes: true }); } catch { return results; }

    for (const e of entries) {
      const full = path.join(dir, e.name);
      if (e.isDirectory()) {
        if (!EXCLUDE_DIRS.includes(e.name)) results.push(...this.collectFiles(full));
      } else if (e.isFile()) {
        const ext = path.extname(e.name).toLowerCase();
        const base = e.name.toLowerCase();
        if (SCAN_EXTENSIONS.includes(ext) || base.startsWith('.env')) {
          if (!EXCLUDE_FILES.some((ex) => base.endsWith(ex))) {
            results.push(full);
          }
        }
      }
    }
    return results;
  }
}
