import { Anomaly, AnomalyType } from './types';

// Patterns indicating injection attacks
const INJECTION_PATTERNS: RegExp[] = [
  /<script[\s>]/i,               // XSS
  /javascript:/i,                 // XSS via href
  /on\w+\s*=/i,                  // DOM event injection
  /(?:SELECT|INSERT|UPDATE|DELETE|DROP|UNION)\s+/i,  // SQL
  /\$\{[^}]+\}/,                 // template injection
  /\.\.\//,                      // path traversal
  /__proto__|constructor\[/,     // prototype pollution
  /\{\s*\$where\s*:/,           // NoSQL injection
];

const PATH_TRAVERSAL_PATTERNS = /\.\.[/\\]|%2e%2e[/\\%]/i;

const SENSITIVE_RESPONSE_PATTERNS: RegExp[] = [
  /"password"\s*:/i,
  /"passwordHash"\s*:/i,
  /"ssn"\s*:/i,
  /"creditCard"\s*:/i,
  /"cvv"\s*:/i,
  /"secret"\s*:\s*"[^"]+"/i,
  /-----BEGIN\s+(?:RSA\s+)?PRIVATE\s+KEY-----/,
  /"apiKey"\s*:\s*"[^"]{20,}"/i,
  /eyJ[A-Za-z0-9\-_]+\.eyJ[A-Za-z0-9\-_]+\.[A-Za-z0-9\-_]+/,  // JWT
];

const SUSPICIOUS_HEADERS: Record<string, string> = {
  'x-forwarded-for': 'Possible IP spoofing attempt',
  'x-original-url': 'URL override header — may be used to bypass routing restrictions',
  'x-rewrite-url': 'URL rewrite header — potential ACL bypass',
  'transfer-encoding': 'Chunked TE desync risk (HTTP request smuggling)',
};

export function detectAnomalies(
  method: string,
  urlPath: string,
  query: Record<string, string | string[]>,
  requestHeaders: Record<string, string>,
  requestBody: unknown,
  responseStatus: number,
  responseBody: unknown,
  durationMs: number,
  maxBodySize: number,
  slowThreshold: number
): Anomaly[] {
  const anomalies: Anomaly[] = [];
  const bodyStr = typeof requestBody === 'string' ? requestBody : JSON.stringify(requestBody ?? '');
  const responseStr = typeof responseBody === 'string' ? responseBody : JSON.stringify(responseBody ?? '');
  const queryStr = JSON.stringify(query);

  // ── Injection attempts ──────────────────────────────────────────────────────
  const combined = `${urlPath}?${queryStr}${bodyStr}`;
  for (const p of INJECTION_PATTERNS) {
    if (p.test(combined)) {
      const type: AnomalyType = combined.includes('__proto__') || combined.includes('constructor[')
        ? 'PROTOTYPE_POLLUTION'
        : /\.\.\//. test(combined)
        ? 'PATH_TRAVERSAL'
        : 'INJECTION_ATTEMPT';
      anomalies.push({
        type,
        severity: 'CRITICAL',
        message: `Potential injection pattern detected`,
        detail: `Matched: ${p.toString().slice(0, 80)}`,
      });
      break;
    }
  }

  // ── Path traversal ──────────────────────────────────────────────────────────
  if (PATH_TRAVERSAL_PATTERNS.test(urlPath)) {
    anomalies.push({
      type: 'PATH_TRAVERSAL',
      severity: 'HIGH',
      message: 'Path traversal sequence detected in URL',
      detail: urlPath,
    });
  }

  // ── Oversized payload ───────────────────────────────────────────────────────
  if (bodyStr.length > maxBodySize) {
    anomalies.push({
      type: 'OVERSIZED_PAYLOAD',
      severity: 'MEDIUM',
      message: `Request body size ${bodyStr.length} bytes exceeds limit of ${maxBodySize} bytes`,
    });
  }

  // ── Suspicious headers ──────────────────────────────────────────────────────
  for (const [hdr, reason] of Object.entries(SUSPICIOUS_HEADERS)) {
    if (requestHeaders[hdr.toLowerCase()]) {
      anomalies.push({
        type: 'SUSPICIOUS_HEADER',
        severity: 'MEDIUM',
        message: `Suspicious header: ${hdr}`,
        detail: reason,
      });
    }
  }

  // ── Sensitive data in response ──────────────────────────────────────────────
  for (const p of SENSITIVE_RESPONSE_PATTERNS) {
    if (p.test(responseStr)) {
      anomalies.push({
        type: 'SENSITIVE_DATA_IN_RESPONSE',
        severity: 'HIGH',
        message: 'Response body may contain sensitive data (password/secret/key/JWT)',
        detail: `Pattern: ${p.toString().slice(0, 60)}`,
      });
      break;
    }
  }

  // ── Missing auth on sensitive methods ───────────────────────────────────────
  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method.toUpperCase())) {
    const authHeader = requestHeaders['authorization'] || requestHeaders['cookie'] || requestHeaders['x-api-key'];
    if (!authHeader) {
      anomalies.push({
        type: 'AUTH_MISSING',
        severity: 'MEDIUM',
        message: `${method.toUpperCase()} request has no Authorization, Cookie, or API key header`,
      });
    }
  }

  // ── Excessive query params ──────────────────────────────────────────────────
  const paramCount = Object.keys(query).length;
  if (paramCount > 20) {
    anomalies.push({
      type: 'EXCESSIVE_PARAMS',
      severity: 'LOW',
      message: `${paramCount} query parameters — possible parameter pollution attack`,
    });
  }

  // ── Slow response ───────────────────────────────────────────────────────────
  if (durationMs > slowThreshold) {
    anomalies.push({
      type: 'SLOW_RESPONSE',
      severity: 'LOW',
      message: `Response took ${durationMs}ms (threshold: ${slowThreshold}ms) — possible DoS or ReDoS`,
    });
  }

  return anomalies;
}
