import * as fs from 'fs';
import * as path from 'path';

export type IssueSeverity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INFO';

export interface ValidationIssue {
  id: string;
  severity: IssueSeverity;
  category: string;
  title: string;
  message: string;
  file: string;
  line: number;
  snippet: string;
  cwe: string;
  remediation: string;
  validationLibrary?: string;
}

export interface RouteValidationProfile {
  method: string;
  path: string;
  file: string;
  line: number;
  hasBodyValidation: boolean;
  hasParamValidation: boolean;
  hasQueryValidation: boolean;
  hasSanitization: boolean;
  hasTypeCoercion: boolean;
  validationLibraries: string[];
  issues: ValidationIssue[];
}

export interface ValidationReport {
  reportId: string;
  timestamp: string;
  rootDir: string;
  filesAnalyzed: number;
  routesFound: number;
  routesWithIssues: number;
  issues: ValidationIssue[];
  profiles: RouteValidationProfile[];
  summary: {
    critical: number;
    high: number;
    medium: number;
    low: number;
    total: number;
  };
  coverage: {
    routesWithValidation: number;
    routesWithoutValidation: number;
    validationCoveragePercent: number;
  };
  passed: boolean;
}

// ── Validation library detection patterns ─────────────────────────────────────
export const VALIDATION_LIBRARIES: Record<string, RegExp> = {
  'zod': /from\s+['"]zod['"]|require\s*\(['"]zod['"]\)/,
  'joi': /from\s+['"]joi['"]|require\s*\(['"]joi['"]\)/,
  'yup': /from\s+['"]yup['"]|require\s*\(['"]yup['"]\)/,
  'class-validator': /from\s+['"]class-validator['"]|@IsString|@IsNumber|@IsEmail/,
  'express-validator': /from\s+['"]express-validator['"]|body\(|param\(|query\(/,
  'celebrate': /from\s+['"]celebrate['"]|celebrate\(/,
  'ajv': /from\s+['"]ajv['"]|new Ajv/,
  'superstruct': /from\s+['"]superstruct['"]/,
  'valibot': /from\s+['"]valibot['"]/,
};

interface AnalyzerRule {
  id: string;
  severity: IssueSeverity;
  category: string;
  title: string;
  pattern: RegExp;
  counterPattern?: RegExp;  // if present in same context, skip
  message: string;
  cwe: string;
  remediation: string;
}

const ANALYZER_RULES: AnalyzerRule[] = [
  {
    id: 'VAL001',
    severity: 'CRITICAL',
    category: 'SQL',
    title: 'Unvalidated input in DB query',
    pattern: /(?:query|execute|raw)\s*\(`[^`]*\$\{req\.|`[^`]*\$\{body\.|`[^`]*\$\{params\./gi,
    message: 'req.body/params/query used directly in a template-literal DB query without validation.',
    cwe: 'CWE-89',
    remediation: 'Validate all inputs with Zod/Joi before use. Use parameterized queries/ORM methods.',
  },
  {
    id: 'VAL002',
    severity: 'HIGH',
    category: 'Missing Body Validation',
    title: 'req.body used without schema validation',
    pattern: /req\.body\.\w+(?!\s*;?\s*(?:\/\/.*)?$)(?![\s\S]{0,400}(?:\.parse|\.validate|schema|validator|celebrate|z\.|Joi\.|yup\.))/gi,
    message: 'req.body property accessed without visible schema validation in surrounding context.',
    cwe: 'CWE-20',
    remediation: 'Use Zod (z.object({}).parse(req.body)), Joi, or express-validator to validate the request body.',
  },
  {
    id: 'VAL003',
    severity: 'HIGH',
    category: 'Missing Param Validation',
    title: 'req.params used without validation',
    pattern: /req\.params\.\w+(?![\s\S]{0,200}(?:parseInt|Number|z\.|Joi\.|isUUID|isNumeric|validate))/gi,
    message: 'Route parameter accessed without type coercion or validation.',
    cwe: 'CWE-20',
    remediation: 'Validate route params: IDs should use parseInt() or UUID validation before DB queries.',
  },
  {
    id: 'VAL004',
    severity: 'MEDIUM',
    category: 'Missing Query Validation',
    title: 'req.query used without sanitization',
    pattern: /req\.query\.\w+(?![\s\S]{0,200}(?:parseInt|Number|trim|encodeURI|z\.|Joi\.|validate))/gi,
    message: 'Query string parameter used without validation or type coercion.',
    cwe: 'CWE-20',
    remediation: 'Validate query parameters with express-validator or Zod .query() schemas.',
  },
  {
    id: 'VAL005',
    severity: 'HIGH',
    category: 'Missing Sanitization',
    title: 'String input not sanitized before HTML output',
    pattern: /res\.(?:send|render)\s*\([^)]*req\.(?:body|params|query)\.\w+/gi,
    message: 'User input passed directly to response without sanitization — XSS risk.',
    cwe: 'CWE-79',
    remediation: 'Sanitize user input with DOMPurify (client) or xss/sanitize-html (server) before rendering.',
  },
  {
    id: 'VAL006',
    severity: 'MEDIUM',
    category: 'Type Coercion',
    title: 'Numeric ID not coerced from string',
    pattern: /WHERE\s+id\s*=\s*(?:req\.params\.id|body\.id|params\.id)(?![\s\S]{0,100}parseInt|Number)/gi,
    message: 'Numeric ID used in query without parseInt() / Number() coercion.',
    cwe: 'CWE-704',
    remediation: "Use parseInt(req.params.id, 10) and validate isNaN() before queries.",
  },
  {
    id: 'VAL007',
    severity: 'HIGH',
    category: 'File Upload',
    title: 'File upload without MIME type validation',
    pattern: /multer|upload\.single|upload\.array|req\.file(?![\s\S]{0,300}mimetype|allowedTypes|fileFilter)/gi,
    message: 'File upload detected without visible MIME type or extension validation.',
    cwe: 'CWE-434',
    remediation: 'Validate file MIME types using fileFilter in multer and verify magic bytes server-side.',
  },
  {
    id: 'VAL008',
    severity: 'MEDIUM',
    category: 'Email Validation',
    title: 'Email field not validated',
    pattern: /body\.email|req\.body\.email(?![\s\S]{0,200}@IsEmail|isEmail|validate.*email|z\.string\(\)\.email)/gi,
    message: 'Email field used without format validation.',
    cwe: 'CWE-20',
    remediation: 'Validate email format with z.string().email(), Joi.string().email(), or @IsEmail().',
  },
  {
    id: 'VAL009',
    severity: 'HIGH',
    category: 'Prototype Pollution via merge',
    title: 'Object.assign / spread with unvalidated input',
    pattern: /Object\.assign\s*\(\s*\w+\s*,\s*req\.body\)|{\s*\.\.\.\s*req\.body\s*}/gi,
    message: 'Merging req.body directly into objects risks prototype pollution.',
    cwe: 'CWE-1321',
    remediation: 'Validate and destructure only known properties from req.body before merging.',
  },
  {
    id: 'VAL010',
    severity: 'MEDIUM',
    category: 'Pagination',
    title: 'Unbounded pagination limit',
    pattern: /limit\s*[=:]\s*req\.(?:body|query)\.(?:limit|pageSize|size)(?![\s\S]{0,200}Math\.min|maxLimit|MAX_LIMIT)/gi,
    message: 'Pagination limit taken from user input without upper bound — DoS risk.',
    cwe: 'CWE-770',
    remediation: 'Enforce: limit = Math.min(parseInt(req.query.limit ?? 20, 10), MAX_PAGE_SIZE)',
  },
];

export class ValidationChecker {
  check(rootDir: string): ValidationReport {
    const files = this.collectFiles(rootDir);
    const allIssues: ValidationIssue[] = [];
    const profiles: RouteValidationProfile[] = [];
    let filesAnalyzed = 0;

    for (const file of files) {
      let content: string;
      try { content = fs.readFileSync(file, 'utf-8'); filesAnalyzed++; } catch { continue; }

      const lines = content.split('\n');

      // Detect which validation libraries are imported
      const detectedLibs: string[] = [];
      for (const [lib, pattern] of Object.entries(VALIDATION_LIBRARIES)) {
        if (pattern.test(content)) detectedLibs.push(lib);
      }

      // Run issue rules
      for (const rule of ANALYZER_RULES) {
        rule.pattern.lastIndex = 0;
        let match: RegExpExecArray | null;

        while ((match = rule.pattern.exec(content)) !== null) {
          // Skip if counter-pattern matches same context
          if (rule.counterPattern) {
            const start = Math.max(0, match.index - 400);
            const end = Math.min(content.length, match.index + 400);
            const ctx = content.slice(start, end);
            if (rule.counterPattern.test(ctx)) {
              rule.pattern.lastIndex = 0;
              break;
            }
          }

          const linesBefore = content.slice(0, match.index).split('\n');
          const lineNum = linesBefore.length;
          const snippet = lines[lineNum - 1]?.trim() ?? '';

          allIssues.push({
            id: `${rule.id}-${path.relative(rootDir, file)}-${lineNum}`,
            severity: rule.severity,
            category: rule.category,
            title: rule.title,
            message: rule.message,
            file,
            line: lineNum,
            snippet,
            cwe: rule.cwe,
            remediation: rule.remediation,
            validationLibrary: detectedLibs[0],
          });

          rule.pattern.lastIndex = 0;
          break; // one finding per rule per file to avoid noise
        }
      }
    }

    const summary = {
      critical: allIssues.filter((i) => i.severity === 'CRITICAL').length,
      high: allIssues.filter((i) => i.severity === 'HIGH').length,
      medium: allIssues.filter((i) => i.severity === 'MEDIUM').length,
      low: allIssues.filter((i) => i.severity === 'LOW').length,
      total: allIssues.length,
    };

    const filesWithIssues = new Set(allIssues.map((i) => i.file)).size;

    return {
      reportId: `validation-${Date.now()}`,
      timestamp: new Date().toISOString(),
      rootDir,
      filesAnalyzed,
      routesFound: profiles.length,
      routesWithIssues: filesWithIssues,
      issues: allIssues,
      profiles,
      summary,
      coverage: {
        routesWithValidation: 0,
        routesWithoutValidation: 0,
        validationCoveragePercent: 0,
      },
      passed: summary.critical === 0 && summary.high === 0,
    };
  }

  private collectFiles(dir: string): string[] {
    const results: string[] = [];
    const EXCLUDES = ['node_modules', 'dist', 'build', '.git', 'coverage'];
    const EXTS = ['.ts', '.tsx', '.js', '.jsx', '.mjs'];
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
