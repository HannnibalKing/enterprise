import * as https from 'https';
import * as http from 'http';
import { URL } from 'url';
import {
  LiveInspectionResult,
  HeaderCheck,
  CorsCheck,
  HeaderSeverity,
} from './types';

interface HeaderRule {
  header: string;
  check: (value: string | null) => { passed: boolean; severity: HeaderSeverity; message: string };
  recommendation: string;
  reference: string;
}

const HEADER_RULES: HeaderRule[] = [
  {
    header: 'strict-transport-security',
    check: (v) => {
      if (!v) return { passed: false, severity: 'HIGH', message: 'HSTS header missing. All traffic must use HTTPS.' };
      if (!v.includes('max-age=')) return { passed: false, severity: 'HIGH', message: 'HSTS missing max-age directive.' };
      const maxAge = parseInt(v.match(/max-age=(\d+)/)?.[1] ?? '0', 10);
      if (maxAge < 31536000) return { passed: false, severity: 'MEDIUM', message: `HSTS max-age ${maxAge} is below recommended 31536000 (1 year).` };
      if (!v.includes('includeSubDomains')) return { passed: false, severity: 'LOW', message: 'HSTS missing includeSubDomains.' };
      return { passed: true, severity: 'PASS', message: `HSTS configured correctly: ${v}` };
    },
    recommendation: 'Set: Strict-Transport-Security: max-age=31536000; includeSubDomains; preload',
    reference: 'https://owasp.org/www-project-secure-headers/#strict-transport-security',
  },
  {
    header: 'content-security-policy',
    check: (v) => {
      if (!v) return { passed: false, severity: 'HIGH', message: 'Content-Security-Policy header is missing.' };
      if (v.includes("'unsafe-inline'")) return { passed: false, severity: 'HIGH', message: "CSP contains 'unsafe-inline', which allows XSS attacks." };
      if (v.includes("'unsafe-eval'")) return { passed: false, severity: 'HIGH', message: "CSP contains 'unsafe-eval', which enables code injection." };
      if (v.includes('*') && v.includes('script-src')) return { passed: false, severity: 'HIGH', message: 'CSP script-src has wildcard (*), any origin can load scripts.' };
      return { passed: true, severity: 'PASS', message: 'CSP header present and looks reasonable.' };
    },
    recommendation: "Set CSP with 'strict-dynamic', nonces, or explicit source lists. Avoid 'unsafe-*'.",
    reference: 'https://csp.withgoogle.com/docs/strict-csp.html',
  },
  {
    header: 'x-frame-options',
    check: (v) => {
      if (!v && true /* CSP frame-ancestors doesn't replace x-frame-options in all browsers */) {
        return { passed: false, severity: 'MEDIUM', message: 'X-Frame-Options missing. Page can be embedded in iframes (clickjacking risk).' };
      }
      if (v && !['DENY', 'SAMEORIGIN'].includes(v.toUpperCase())) {
        return { passed: false, severity: 'MEDIUM', message: `Unexpected X-Frame-Options value: ${v}` };
      }
      return { passed: true, severity: 'PASS', message: `X-Frame-Options: ${v}` };
    },
    recommendation: 'Set X-Frame-Options: DENY or SAMEORIGIN. Prefer CSP frame-ancestors.',
    reference: 'https://owasp.org/www-project-secure-headers/#x-frame-options',
  },
  {
    header: 'x-content-type-options',
    check: (v) => {
      if (!v || v.toLowerCase() !== 'nosniff') {
        return { passed: false, severity: 'MEDIUM', message: 'X-Content-Type-Options: nosniff missing. Browser MIME sniffing enabled.' };
      }
      return { passed: true, severity: 'PASS', message: 'X-Content-Type-Options: nosniff ✓' };
    },
    recommendation: 'Set: X-Content-Type-Options: nosniff',
    reference: 'https://owasp.org/www-project-secure-headers/#x-content-type-options',
  },
  {
    header: 'referrer-policy',
    check: (v) => {
      const safe = ['no-referrer', 'strict-origin', 'strict-origin-when-cross-origin', 'same-origin'];
      if (!v) return { passed: false, severity: 'LOW', message: 'Referrer-Policy not set. Referrers may leak sensitive URLs.' };
      if (!safe.some((s) => v.toLowerCase().includes(s))) {
        return { passed: false, severity: 'LOW', message: `Referrer-Policy '${v}' may leak URLs. Consider 'strict-origin-when-cross-origin'.` };
      }
      return { passed: true, severity: 'PASS', message: `Referrer-Policy: ${v} ✓` };
    },
    recommendation: "Set: Referrer-Policy: strict-origin-when-cross-origin",
    reference: 'https://owasp.org/www-project-secure-headers/#referrer-policy',
  },
  {
    header: 'permissions-policy',
    check: (v) => {
      if (!v) return { passed: false, severity: 'INFO', message: 'Permissions-Policy not set. Browser features (camera, microphone, geolocation) are unrestricted.' };
      return { passed: true, severity: 'PASS', message: `Permissions-Policy set: ${v.slice(0, 80)}...` };
    },
    recommendation: "Set: Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=()",
    reference: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Permissions-Policy',
  },
  {
    header: 'x-powered-by',
    check: (v) => {
      if (v) return { passed: false, severity: 'LOW', message: `X-Powered-By: ${v} leaks server technology information.` };
      return { passed: true, severity: 'PASS', message: 'X-Powered-By not present ✓' };
    },
    recommendation: 'Remove X-Powered-By header. Use helmet() to suppress it automatically.',
    reference: 'https://owasp.org/www-project-secure-headers/#x-powered-by',
  },
  {
    header: 'server',
    check: (v) => {
      if (v && /[0-9]/.test(v)) return { passed: false, severity: 'LOW', message: `Server header '${v}' exposes version information.` };
      return { passed: true, severity: 'PASS', message: v ? `Server: ${v} (no version)` : 'Server header not present ✓' };
    },
    recommendation: 'Configure server to suppress version numbers in the Server header.',
    reference: 'https://owasp.org/www-project-secure-headers/',
  },
  {
    header: 'cache-control',
    check: (v) => {
      if (!v) return { passed: false, severity: 'INFO', message: 'Cache-Control not set on this response.' };
      return { passed: true, severity: 'PASS', message: `Cache-Control: ${v}` };
    },
    recommendation: 'For sensitive pages set: Cache-Control: no-store, private',
    reference: 'https://owasp.org/www-project-secure-headers/#cache-control',
  },
];

function checkCors(headers: Record<string, string>): CorsCheck {
  const allowOrigin = headers['access-control-allow-origin'] ?? null;
  const allowMethods = headers['access-control-allow-methods'] ?? null;
  const allowHeaders = headers['access-control-allow-headers'] ?? null;
  const exposeHeaders = headers['access-control-expose-headers'] ?? null;
  const allowCredentials = headers['access-control-allow-credentials'] ?? null;
  const maxAge = headers['access-control-max-age'] ?? null;
  const issues: string[] = [];

  if (allowOrigin === '*') {
    issues.push('CORS wildcard (*) origin allows any domain to make cross-origin requests.');
  }
  if (allowOrigin === '*' && allowCredentials === 'true') {
    issues.push('CRITICAL: CORS wildcard origin with credentials=true is invalid and allows credential theft.');
  }
  if (allowMethods?.toUpperCase().includes('TRACE')) {
    issues.push('CORS allows TRACE method which can be exploited for XST attacks.');
  }
  if (!maxAge) {
    issues.push('No Access-Control-Max-Age set. Browsers will preflight every request (performance impact).');
  }
  if (allowHeaders === '*') {
    issues.push('Wildcard Access-Control-Allow-Headers allows sending any header including sensitive ones.');
  }

  return {
    allowOrigin, allowMethods, allowHeaders, exposeHeaders, allowCredentials, maxAge,
    issues,
    passed: issues.filter((i) => i.startsWith('CRITICAL') || i.startsWith('CORS wildcard')).length === 0,
  };
}

function calculateScore(checks: HeaderCheck[]): number {
  const weights: Record<HeaderSeverity, number> = {
    CRITICAL: 30, HIGH: 15, MEDIUM: 8, LOW: 3, INFO: 1, PASS: 0,
  };
  let deduction = 0;
  for (const c of checks) {
    if (!c.passed) deduction += weights[c.severity] ?? 0;
  }
  return Math.max(0, 100 - deduction);
}

function scoreToGrade(score: number): LiveInspectionResult['grade'] {
  if (score >= 90) return 'A+';
  if (score >= 80) return 'A';
  if (score >= 65) return 'B';
  if (score >= 50) return 'C';
  if (score >= 35) return 'D';
  return 'F';
}

export async function inspectUrl(targetUrl: string): Promise<LiveInspectionResult> {
  const start = Date.now();
  const parsed = new URL(targetUrl);
  const isHttps = parsed.protocol === 'https:';

  return new Promise((resolve, reject) => {
    const options = {
      hostname: parsed.hostname,
      port: parsed.port || (isHttps ? 443 : 80),
      path: parsed.pathname + parsed.search,
      method: 'GET',
      headers: {
        'User-Agent': 'Enterprise-Header-Inspector/1.0',
        'Origin': 'https://inspector.example.com',
      },
      rejectUnauthorized: false, // We handle cert checks in TLS auditor
      timeout: 10000,
    };

    const transport = isHttps ? https : http;
    const req = transport.request(options, (res) => {
      const responseTime = Date.now() - start;
      const rawHeaders: Record<string, string> = {};

      for (let i = 0; i < res.rawHeaders.length; i += 2) {
        rawHeaders[res.rawHeaders[i].toLowerCase()] = res.rawHeaders[i + 1];
      }

      const headerChecks: HeaderCheck[] = HEADER_RULES.map((rule) => {
        const actual = rawHeaders[rule.header] ?? null;
        const result = rule.check(actual);
        return {
          header: rule.header,
          expected: rule.recommendation,
          actual,
          severity: result.severity,
          passed: result.passed,
          message: result.message,
          recommendation: rule.recommendation,
          reference: rule.reference,
        };
      });

      const corsCheck = checkCors(rawHeaders);
      const score = calculateScore(headerChecks);

      res.destroy(); // We don't need the body

      resolve({
        url: targetUrl,
        statusCode: res.statusCode ?? 0,
        responseTime,
        headers: rawHeaders,
        headerChecks,
        corsCheck,
        score,
        grade: scoreToGrade(score),
        passed: score >= 65,
      });
    });

    req.on('error', reject);
    req.on('timeout', () => { req.destroy(); reject(new Error('Request timed out')); });
    req.end();
  });
}
