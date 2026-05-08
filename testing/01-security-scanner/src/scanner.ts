import * as fs from 'fs';
import * as path from 'path';
import { ScanResult, ScanOptions, Vulnerability } from './types';
import { RULES } from './rules';

const DEFAULT_EXTENSIONS = ['.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs', '.py'];
const DEFAULT_EXCLUDE = ['node_modules', 'dist', 'build', '.git', 'coverage', '__pycache__'];

export class Scanner {
  private options: ScanOptions;

  constructor(options: ScanOptions) {
    this.options = {
      ...options,
      include: options.include ?? DEFAULT_EXTENSIONS,
      exclude: options.exclude ?? DEFAULT_EXCLUDE,
    };
  }

  /** Recursively collect files matching extensions, respecting exclude list */
  collectFiles(dir: string): string[] {
    const results: string[] = [];
    let entries: fs.Dirent[];
    try {
      entries = fs.readdirSync(dir, { withFileTypes: true });
    } catch {
      return results;
    }

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        const excluded = (this.options.exclude ?? []).some(
          (ex) => entry.name === ex || fullPath.includes(ex)
        );
        if (!excluded) results.push(...this.collectFiles(fullPath));
      } else if (entry.isFile()) {
        const ext = path.extname(entry.name).toLowerCase();
        if ((this.options.include ?? []).includes(ext)) {
          results.push(fullPath);
        }
      }
    }
    return results;
  }

  /** Scan a single file and return all found vulnerabilities */
  scanFile(filePath: string): ScanResult {
    const start = Date.now();
    const vulnerabilities: Vulnerability[] = [];

    let content: string;
    try {
      content = fs.readFileSync(filePath, 'utf-8');
    } catch {
      return { file: filePath, vulnerabilities: [], linesScanned: 0, duration: 0 };
    }

    const lines = content.split('\n');

    for (const rule of RULES) {
      // Skip rules that target specific file types if this file doesn't match
      if (rule.fileTypes) {
        const ext = path.extname(filePath).toLowerCase();
        if (!rule.fileTypes.includes(ext)) continue;
      }

      // Filter by requested severity
      if (this.options.severity && !this.options.severity.includes(rule.severity)) continue;

      // Reset regex state before each scan
      rule.pattern.lastIndex = 0;
      let match: RegExpExecArray | null;

      while ((match = rule.pattern.exec(content)) !== null) {
        const index = match.index;
        const linesBefore = content.slice(0, index).split('\n');
        const lineNumber = linesBefore.length;
        const column = linesBefore[linesBefore.length - 1].length + 1;
        const snippet = lines[lineNumber - 1]?.trim() ?? '';

        vulnerabilities.push({
          id: `${rule.id}-${filePath}-${lineNumber}`,
          rule: rule.id,
          category: rule.category,
          severity: rule.severity,
          message: rule.message,
          file: filePath,
          line: lineNumber,
          column,
          snippet,
          owaspCategory: rule.owaspCategory,
          cwe: rule.cwe,
          remediation: rule.remediation,
        });
      }

      // Always reset after scan
      rule.pattern.lastIndex = 0;
    }

    return {
      file: filePath,
      vulnerabilities,
      linesScanned: lines.length,
      duration: Date.now() - start,
    };
  }

  /** Run full scan across all collected files */
  async scan(): Promise<ScanResult[]> {
    const files = this.collectFiles(this.options.rootDir);
    const results: ScanResult[] = [];

    for (const file of files) {
      results.push(this.scanFile(file));
    }

    return results;
  }
}
