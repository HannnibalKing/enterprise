import * as fs from 'fs';
import * as path from 'path';
import { AuthFinding, AuthReport, CoverageCheck, FindingSeverity } from './types';

interface AnalyzerRule {
  id: string;
  severity: FindingSeverity;
  category: AuthFinding['category'];
  title: string;
  pattern: RegExp;
  message: string;
  cwe: string;
  remediation: string;
}

const RULES: AnalyzerRule[] = [
  // ── JWT Issues ──────────────────────────────────────────────────────────────
  {
    id: 'JWT001',
    severity: 'CRITICAL',
    category: 'JWT',
    title: 'Hardcoded JWT secret',
    pattern: /jwt\.sign\s*\([^,]+,\s*['"][^'"]{1,60}['"]\s*(?:,|\))/gi,
    message: 'JWT secret is hardcoded in source. Any developer with repo access can forge tokens.',
    cwe: 'CWE-798',
    remediation: 'Store JWT secret in process.env.JWT_SECRET (256-bit random). Rotate on breach.',
  },
  {
    id: 'JWT002',
    severity: 'CRITICAL',
    category: 'JWT',
    title: "JWT 'none' algorithm accepted",
    pattern: /algorithms?\s*:\s*\[.*['"]none['"]/gi,
    message: "Algorithm 'none' disables signature verification — tokens can be forged trivially.",
    cwe: 'CWE-347',
    remediation: "Pin algorithms to ['RS256'] or ['HS256']. Never include 'none'.",
  },
  {
    id: 'JWT003',
    severity: 'HIGH',
    category: 'JWT',
    title: 'JWT missing expiry (expiresIn)',
    pattern: /jwt\.sign\s*\([^)]*\)(?![\s\S]{0,50}expiresIn)/gi,
    message: 'JWT signed without expiresIn — tokens never expire, extending breach window indefinitely.',
    cwe: 'CWE-613',
    remediation: "Add expiresIn: '15m' (access) and '7d' (refresh) to jwt.sign() options.",
  },
  {
    id: 'JWT004',
    severity: 'HIGH',
    category: 'JWT',
    title: 'JWT secret shorter than 256 bits',
    pattern: /jwt\.sign\s*\([^,]+,\s*['"][^'"]{1,31}['"]/gi,
    message: 'JWT secret is shorter than 32 characters (256 bits), vulnerable to brute force.',
    cwe: 'CWE-326',
    remediation: 'Use a cryptographically random secret of at least 32 bytes (64 hex chars).',
  },
  {
    id: 'JWT005',
    severity: 'MEDIUM',
    category: 'JWT',
    title: 'JWT stored in localStorage',
    pattern: /localStorage\.setItem\s*\([^)]*[Tt]oken|localStorage\[['"]token['"]\]\s*=/gi,
    message: 'JWT stored in localStorage is vulnerable to XSS token theft.',
    cwe: 'CWE-922',
    remediation: 'Store JWTs in HttpOnly, Secure, SameSite=Strict cookies instead of localStorage.',
  },

  // ── Session Issues ───────────────────────────────────────────────────────────
  {
    id: 'SES001',
    severity: 'HIGH',
    category: 'Session',
    title: 'Session secret hardcoded',
    pattern: /session\s*\(\s*\{[^}]*secret\s*:\s*['"][^'"]{1,40}['"]/gi,
    message: 'Express-session secret is hardcoded. Session cookies can be forged.',
    cwe: 'CWE-798',
    remediation: 'Use process.env.SESSION_SECRET with a minimum 256-bit random value.',
  },
  {
    id: 'SES002',
    severity: 'HIGH',
    category: 'Session',
    title: 'Session cookie not HttpOnly',
    pattern: /cookie\s*:\s*\{[^}]*httpOnly\s*:\s*false/gi,
    message: 'Session cookie has httpOnly: false — readable by JavaScript, vulnerable to XSS.',
    cwe: 'CWE-1004',
    remediation: 'Set httpOnly: true on all session cookies.',
  },
  {
    id: 'SES003',
    severity: 'HIGH',
    category: 'Session',
    title: 'Session cookie not Secure in production',
    pattern: /cookie\s*:\s*\{[^}]*secure\s*:\s*false/gi,
    message: 'Session cookie has secure: false — transmitted over HTTP in plaintext.',
    cwe: 'CWE-614',
    remediation: 'Set secure: process.env.NODE_ENV === "production".',
  },
  {
    id: 'SES004',
    severity: 'MEDIUM',
    category: 'Session',
    title: 'Session missing SameSite attribute',
    pattern: /cookie\s*:\s*\{(?![\s\S]{0,150}sameSite)[^}]*\}/gi,
    message: 'Session cookie lacks SameSite attribute, enabling CSRF attacks.',
    cwe: 'CWE-1275',
    remediation: "Set sameSite: 'strict' or sameSite: 'lax' on session cookies.",
  },
  {
    id: 'SES005',
    severity: 'MEDIUM',
    category: 'Session',
    title: 'resave and saveUninitialized not configured',
    pattern: /express-session|session\(\s*\{/gi,
    message: 'Check that resave: false and saveUninitialized: false are set to prevent session fixation.',
    cwe: 'CWE-384',
    remediation: 'Set resave: false and saveUninitialized: false in session configuration.',
  },

  // ── Cookie Issues ────────────────────────────────────────────────────────────
  {
    id: 'COOK001',
    severity: 'HIGH',
    category: 'Cookie',
    title: 'Cookie set without HttpOnly',
    pattern: /res\.cookie\s*\([^)]*(?!\bhttpOnly\s*:\s*true)[^)]*\)/gi,
    message: 'Cookie set without explicit httpOnly: true flag.',
    cwe: 'CWE-1004',
    remediation: "Always set { httpOnly: true, secure: true, sameSite: 'strict' } on sensitive cookies.",
  },

  // ── CSRF Issues ──────────────────────────────────────────────────────────────
  {
    id: 'CSRF001',
    severity: 'HIGH',
    category: 'CSRF',
    title: 'No CSRF protection found',
    pattern: /app\.(post|put|patch|delete)\s*\(/gi,
    message: 'Mutating route detected. Verify CSRF tokens (csurf / double-submit cookie) are enforced.',
    cwe: 'CWE-352',
    remediation: 'Use the csurf package or implement double-submit cookie pattern on state-changing routes.',
  },

  // ── OAuth Issues ─────────────────────────────────────────────────────────────
  {
    id: 'OAUTH001',
    severity: 'HIGH',
    category: 'OAuth',
    title: 'OAuth state parameter missing',
    pattern: /oauth2?|passport\.authenticate\s*\(\s*['"]google|passport\.authenticate\s*\(\s*['"]github/gi,
    message: 'OAuth flow detected. Verify the state parameter is validated to prevent CSRF on the callback.',
    cwe: 'CWE-352',
    remediation: 'Generate and validate a PKCE code_verifier or state parameter in every OAuth flow.',
  },
  {
    id: 'OAUTH002',
    severity: 'MEDIUM',
    category: 'OAuth',
    title: 'Open redirect in OAuth callback',
    pattern: /(?:redirect_uri|returnTo|next)\s*[=:]\s*(?:req\.|body\.|query\.)[^;,\n]+/gi,
    message: 'Redirect URL derived from user input in OAuth flow — possible open redirect.',
    cwe: 'CWE-601',
    remediation: 'Validate redirect_uri against a pre-registered allowlist before redirecting.',
  },

  // ── Password Issues ──────────────────────────────────────────────────────────
  {
    id: 'PASS001',
    severity: 'CRITICAL',
    category: 'Password',
    title: 'Password compared without hashing',
    pattern: /user\.password\s*===?\s*req\.|password\s*===?\s*body\.|\.password\s*===?\s*plaintext/gi,
    message: 'Password compared in plaintext without hashing.',
    cwe: 'CWE-256',
    remediation: 'Use bcrypt.compare() or argon2.verify() for all password comparisons.',
  },
  {
    id: 'PASS002',
    severity: 'HIGH',
    category: 'Password',
    title: 'Password reset token not time-limited',
    pattern: /reset(?:Token|Code|Link)\s*=\s*(?!.*expires|.*ttl|.*expiry)/gi,
    message: 'Password reset token generated without visible expiry.',
    cwe: 'CWE-640',
    remediation: 'Reset tokens must expire within 15–60 minutes. Store hash + expiry timestamp.',
  },

  // ── MFA ─────────────────────────────────────────────────────────────────────
  {
    id: 'MFA001',
    severity: 'INFO',
    category: 'MFA',
    title: 'No MFA implementation found',
    pattern: /login|signin|authenticate/gi,
    message: 'Authentication code present but no TOTP/OTP/MFA library detected.',
    cwe: 'CWE-308',
    remediation: 'Consider adding TOTP-based MFA (speakeasy, otplib) for high-value accounts.',
  },
];

const COVERAGE_CHECKS = [
  { name: 'JWT library (jsonwebtoken)', pattern: /require\s*\(\s*['"]jsonwebtoken['"]\)|from\s+['"]jsonwebtoken['"]/, description: 'JWT library installed' },
  { name: 'Password hashing (bcrypt/argon2)', pattern: /require\s*\(\s*['"]bcrypt|require\s*\(\s*['"]argon2|from\s+['"]bcrypt|from\s+['"]argon2/, description: 'Secure password hashing' },
  { name: 'Rate limiting', pattern: /express-rate-limit|rateLimit|rate-limiter-flexible/, description: 'Rate limiting to prevent brute force' },
  { name: 'CSRF protection', pattern: /csurf|csrf|double.submit/, description: 'CSRF mitigation on state-changing routes' },
  { name: 'Helmet (security headers)', pattern: /require\s*\(\s*['"]helmet['"]\)|from\s+['"]helmet['"]/, description: 'Helmet middleware for HTTP security headers' },
  { name: 'Session management', pattern: /express-session|cookie-session/, description: 'Secure session handling' },
];

export class AuthAnalyzer {
  private allContent = '';
  private allLines: { file: string; lines: string[] }[] = [];

  analyze(rootDir: string): AuthReport {
    const files = this.collectFiles(rootDir);
    this.allContent = '';
    this.allLines = [];

    for (const f of files) {
      try {
        const content = fs.readFileSync(f, 'utf-8');
        this.allContent += content + '\n';
        this.allLines.push({ file: f, lines: content.split('\n') });
      } catch { /* skip */ }
    }

    const findings = this.runRules(rootDir);
    const coverage = this.checkCoverage();
    const summary = { critical: 0, high: 0, medium: 0, low: 0, info: 0, total: findings.length };
    for (const f of findings) {
      switch (f.severity) {
        case 'CRITICAL': summary.critical++; break;
        case 'HIGH': summary.high++; break;
        case 'MEDIUM': summary.medium++; break;
        case 'LOW': summary.low++; break;
        case 'INFO': summary.info++; break;
      }
    }

    return {
      reportId: `auth-${Date.now()}`,
      timestamp: new Date().toISOString(),
      rootDir,
      totalFiles: files.length,
      findings,
      summary,
      coverageChecks: coverage,
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

  private runRules(rootDir: string): AuthFinding[] {
    const findings: AuthFinding[] = [];

    for (const { file, lines } of this.allLines) {
      const content = lines.join('\n');

      for (const rule of RULES) {
        rule.pattern.lastIndex = 0;
        let match: RegExpExecArray | null;
        while ((match = rule.pattern.exec(content)) !== null) {
          const linesBefore = content.slice(0, match.index).split('\n');
          const lineNum = linesBefore.length;
          const snippet = lines[lineNum - 1]?.trim() ?? '';

          findings.push({
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
          });
          rule.pattern.lastIndex = 0;
          break; // one finding per file per rule to avoid noise
        }
      }
    }

    return findings;
  }

  private checkCoverage(): CoverageCheck[] {
    return COVERAGE_CHECKS.map((check) => ({
      name: check.name,
      description: check.description,
      present: check.pattern.test(this.allContent),
      severity: 'HIGH' as FindingSeverity,
    }));
  }
}
