import * as tls from 'tls';
import * as https from 'https';
import { URL } from 'url';

export type CheckSeverity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'PASS' | 'INFO';

export interface TlsCheck {
  name: string;
  passed: boolean;
  severity: CheckSeverity;
  value: string;
  message: string;
  recommendation?: string;
  reference?: string;
}

export interface CertInfo {
  subject: string;
  issuer: string;
  validFrom: string;
  validTo: string;
  daysUntilExpiry: number;
  serialNumber: string;
  fingerprint: string;
  san: string[];
  selfSigned: boolean;
  keyStrength?: number;
  signatureAlgorithm: string;
}

export interface TlsAuditResult {
  host: string;
  port: number;
  timestamp: string;
  negotiatedProtocol: string;
  negotiatedCipher: string;
  checks: TlsCheck[];
  certInfo: CertInfo | null;
  score: number;
  grade: 'A+' | 'A' | 'B' | 'C' | 'D' | 'F';
  passed: boolean;
  errors: string[];
}

// Weak / deprecated protocols
const WEAK_PROTOCOLS = new Set(['SSLv2', 'SSLv3', 'TLSv1', 'TLSv1.1']);

// Weak cipher pattern substrings
const WEAK_CIPHER_PATTERNS = [
  'NULL', 'EXPORT', 'anon', 'RC4', 'DES', '3DES', 'MD5', 'IDEA', 'SEED', 'CAMELLIA_128',
];

// Perfect forward secrecy keyword
const PFS_PATTERNS = ['ECDHE', 'DHE'];

/** Evaluate a negotiated cipher suite */
function evaluateCipher(cipher: string): { pfs: boolean; weak: boolean; reason?: string } {
  const pfs = PFS_PATTERNS.some((p) => cipher.toUpperCase().includes(p));
  const weakMatch = WEAK_CIPHER_PATTERNS.find((w) => cipher.toUpperCase().includes(w));
  return { pfs, weak: !!weakMatch, reason: weakMatch };
}

/** Connect to a host, perform TLS handshake, and collect metadata */
export async function auditTls(host: string, port = 443): Promise<TlsAuditResult> {
  const checks: TlsCheck[] = [];
  const errors: string[] = [];
  let certInfo: CertInfo | null = null;
  let negotiatedProtocol = 'unknown';
  let negotiatedCipher = 'unknown';

  const connectStart = Date.now();

  await new Promise<void>((resolve) => {
    const socket = tls.connect(
      {
        host,
        port,
        servername: host,
        rejectUnauthorized: true,
        timeout: 10_000,
        // Try all secure protocols; Node will negotiate highest mutual
        minVersion: 'TLSv1',
      },
      () => {
        negotiatedProtocol = socket.getProtocol() ?? 'unknown';
        const cipher = socket.getCipher();
        negotiatedCipher = cipher ? `${cipher.name} (${cipher.version})` : 'unknown';
        const peerCert = socket.getPeerCertificate(true);

        // ── Certificate checks ──────────────────────────────────────────────
        if (peerCert && peerCert.subject) {
          const now = new Date();
          const validTo = new Date(peerCert.valid_to);
          const validFrom = new Date(peerCert.valid_from);
          const daysLeft = Math.floor((validTo.getTime() - now.getTime()) / 86_400_000);
          const selfSigned = peerCert.subject.CN === peerCert.issuer.CN;

          certInfo = {
            subject: JSON.stringify(peerCert.subject),
            issuer: JSON.stringify(peerCert.issuer),
            validFrom: validFrom.toISOString(),
            validTo: validTo.toISOString(),
            daysUntilExpiry: daysLeft,
            serialNumber: peerCert.serialNumber ?? 'unknown',
            fingerprint: peerCert.fingerprint ?? 'unknown',
            san: (peerCert.subjectaltname ?? '').split(',').map((s) => s.trim()),
            selfSigned,
            signatureAlgorithm: String((peerCert as unknown as Record<string, unknown>)['sigalg'] ?? 'unknown'),
          };

          checks.push({
            name: 'Certificate not expired',
            passed: daysLeft > 0,
            severity: daysLeft > 0 ? 'PASS' : 'CRITICAL',
            value: `${daysLeft} days remaining`,
            message: daysLeft > 0 ? `Certificate valid for ${daysLeft} more days` : 'Certificate is EXPIRED',
            recommendation: 'Automate renewal with certbot or ACM. Alert at 30 days remaining.',
          });

          checks.push({
            name: 'Certificate expiry warning (< 30 days)',
            passed: daysLeft > 30,
            severity: daysLeft > 30 ? 'PASS' : daysLeft > 0 ? 'HIGH' : 'CRITICAL',
            value: `${daysLeft} days`,
            message: daysLeft > 30 ? `Expires in ${daysLeft} days` : `Certificate expires in ${daysLeft} days — renew immediately`,
            recommendation: 'Set up automated renewal and 30-day expiry alerts.',
          });

          checks.push({
            name: 'Not self-signed',
            passed: !selfSigned,
            severity: selfSigned ? 'CRITICAL' : 'PASS',
            value: selfSigned ? 'SELF-SIGNED' : 'CA-signed',
            message: selfSigned ? 'Self-signed certificate will be rejected by browsers' : 'Certificate signed by a trusted CA',
            recommendation: "Use Let's Encrypt, DigiCert, or other trusted CA.",
          });

          checks.push({
            name: 'Subject Alternative Name (SAN) present',
            passed: certInfo.san.length > 0 && certInfo.san[0] !== '',
            severity: certInfo.san.length > 0 ? 'PASS' : 'HIGH',
            value: certInfo.san.slice(0, 3).join(', '),
            message: certInfo.san.length > 0 ? `SAN includes: ${certInfo.san.slice(0, 3).join(', ')}` : 'No SANs defined — CN-only certificates are deprecated',
            recommendation: 'All modern certificates must include Subject Alternative Names.',
          });

          // Check for weak signature algorithm
          const sigAlg = certInfo.signatureAlgorithm.toLowerCase();
          const weakSig = sigAlg.includes('md5') || sigAlg.includes('sha1');
          checks.push({
            name: 'Strong signature algorithm',
            passed: !weakSig,
            severity: weakSig ? 'HIGH' : 'PASS',
            value: certInfo.signatureAlgorithm,
            message: weakSig
              ? `Weak signature algorithm: ${certInfo.signatureAlgorithm}`
              : `Signature algorithm OK: ${certInfo.signatureAlgorithm}`,
            recommendation: 'Use SHA-256 or better for certificate signatures.',
          });
        }

        // ── Protocol checks ─────────────────────────────────────────────────
        const protoWeak = WEAK_PROTOCOLS.has(negotiatedProtocol);
        checks.push({
          name: 'TLS protocol version',
          passed: !protoWeak,
          severity: negotiatedProtocol === 'SSLv3' ? 'CRITICAL' : protoWeak ? 'HIGH' : 'PASS',
          value: negotiatedProtocol,
          message: protoWeak
            ? `Deprecated protocol negotiated: ${negotiatedProtocol}`
            : `TLS protocol OK: ${negotiatedProtocol}`,
          recommendation: 'Disable TLSv1.0 and TLSv1.1. Require TLSv1.2 minimum, prefer TLSv1.3.',
          reference: 'https://www.rfc-editor.org/rfc/rfc8996',
        });

        // ── Cipher checks ───────────────────────────────────────────────────
        const { pfs, weak, reason } = evaluateCipher(cipher?.name ?? '');
        checks.push({
          name: 'No weak cipher suite',
          passed: !weak,
          severity: weak ? 'HIGH' : 'PASS',
          value: cipher?.name ?? 'unknown',
          message: weak
            ? `Weak cipher negotiated: ${cipher?.name} (${reason})`
            : `Cipher suite OK: ${cipher?.name}`,
          recommendation: 'Disable NULL, EXPORT, RC4, DES, 3DES, and anon ciphers.',
        });

        checks.push({
          name: 'Perfect Forward Secrecy (PFS)',
          passed: pfs,
          severity: pfs ? 'PASS' : 'MEDIUM',
          value: pfs ? 'Enabled' : 'Not enabled',
          message: pfs ? 'PFS enabled via ECDHE/DHE key exchange' : 'No PFS — past sessions exposed if private key is compromised',
          recommendation: 'Prefer ECDHE cipher suites for Perfect Forward Secrecy.',
        });

        socket.destroy();
        resolve();
      }
    );

    socket.on('error', (err) => {
      if (err.message.includes('certificate')) {
        checks.push({
          name: 'Certificate validation',
          passed: false,
          severity: 'CRITICAL',
          value: 'INVALID',
          message: `Certificate error: ${err.message}`,
          recommendation: 'Ensure certificate chain is complete and trusted.',
        });
      } else {
        errors.push(`TLS connection error: ${err.message}`);
      }
      resolve();
    });

    socket.on('timeout', () => {
      errors.push('Connection timed out');
      socket.destroy();
      resolve();
    });
  });

  // ── HTTPS headers check ──────────────────────────────────────────────────
  await new Promise<void>((resolve) => {
    const req = https.request(
      { hostname: host, port, path: '/', method: 'GET', timeout: 8000, rejectUnauthorized: false },
      (res) => {
        const hsts = res.headers['strict-transport-security'];
        checks.push({
          name: 'HSTS header present',
          passed: !!hsts,
          severity: hsts ? 'PASS' : 'HIGH',
          value: hsts ?? '(not set)',
          message: hsts ? `HSTS: ${hsts}` : 'HSTS header missing',
          recommendation: 'Set: Strict-Transport-Security: max-age=31536000; includeSubDomains; preload',
          reference: 'https://hstspreload.org/',
        });

        if (hsts) {
          const maxAgeMatch = hsts.match(/max-age=(\d+)/);
          const maxAge = maxAgeMatch ? parseInt(maxAgeMatch[1], 10) : 0;
          checks.push({
            name: 'HSTS max-age ≥ 1 year',
            passed: maxAge >= 31_536_000,
            severity: maxAge >= 31_536_000 ? 'PASS' : 'MEDIUM',
            value: `max-age=${maxAge}`,
            message: maxAge >= 31_536_000 ? 'HSTS max-age is at least 1 year' : `HSTS max-age ${maxAge} is less than 1 year`,
            recommendation: 'Set max-age to at least 31536000 (1 year) for HSTS preloading.',
          });

          checks.push({
            name: 'HSTS includeSubDomains',
            passed: hsts.includes('includeSubDomains'),
            severity: hsts.includes('includeSubDomains') ? 'PASS' : 'LOW',
            value: hsts.includes('includeSubDomains') ? 'present' : 'missing',
            message: hsts.includes('includeSubDomains') ? 'includeSubDomains present' : 'HSTS missing includeSubDomains',
          });
        }

        res.destroy();
        resolve();
      }
    );
    req.on('error', () => resolve());
    req.on('timeout', () => { req.destroy(); resolve(); });
    req.end();
  });

  // ── Score calculation ────────────────────────────────────────────────────
  const weights: Record<CheckSeverity, number> = {
    CRITICAL: 40, HIGH: 20, MEDIUM: 10, LOW: 3, PASS: 0, INFO: 0,
  };
  let deduction = 0;
  for (const c of checks) {
    if (!c.passed) deduction += weights[c.severity] ?? 0;
  }
  const score = Math.max(0, 100 - deduction);

  const grade: TlsAuditResult['grade'] =
    score >= 90 ? 'A+' : score >= 80 ? 'A' : score >= 65 ? 'B' : score >= 50 ? 'C' : score >= 35 ? 'D' : 'F';

  return {
    host,
    port,
    timestamp: new Date().toISOString(),
    negotiatedProtocol,
    negotiatedCipher,
    checks,
    certInfo,
    score,
    grade,
    passed: score >= 65,
    errors,
  };
}
