import * as fs from 'fs';
import * as path from 'path';

export interface ToolReport {
  tool: string;
  label: string;
  description: string;
  reportPath: string;
  lastScanned: string | null;
  status: 'pass' | 'fail' | 'unknown';
  summary: Record<string, unknown>;
  findings: Finding[];
}

export interface Finding {
  id: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INFO';
  title: string;
  file?: string;
  line?: number;
  message: string;
  tool: string;
}

export interface DashboardData {
  timestamp: string;
  overallScore: number;
  overallStatus: 'pass' | 'fail' | 'unknown';
  tools: ToolReport[];
  allFindings: Finding[];
  totals: {
    critical: number;
    high: number;
    medium: number;
    low: number;
    total: number;
  };
}

const TOOLS: { tool: string; label: string; description: string; file: string }[] = [
  { tool: '01-security-scanner', label: 'Security Scanner', description: 'OWASP Top 10 static analysis', file: 'security-report.json' },
  { tool: '02-api-contract-validator', label: 'API Contract Validator', description: 'OpenAPI spec vs implementation', file: 'api-report.json' },
  { tool: '03-auth-flow-analyzer', label: 'Auth Flow Analyzer', description: 'JWT / Session / OAuth issues', file: 'auth-report.json' },
  { tool: '04-secrets-scanner', label: 'Secrets Scanner', description: '50+ secret patterns + entropy', file: 'secrets-report.json' },
  { tool: '05-cors-header-inspector', label: 'CORS & Headers', description: 'Security header inspection', file: 'headers-report.json' },
  { tool: '06-api-traffic-monitor', label: 'Traffic Monitor', description: 'Runtime proxy anomaly detection', file: 'traffic-report.json' },
  { tool: '07-dependency-auditor', label: 'Dependency Auditor', description: 'CVE scanning (npm/pip/Go)', file: 'audit-report.json' },
  { tool: '08-input-validation-checker', label: 'Input Validation', description: 'Missing validation detection', file: 'validation-report.json' },
  { tool: '09-tls-auditor', label: 'TLS/SSL Auditor', description: 'TLS version, cipher, cert chain', file: 'tls-report.json' },
];

const BASE_DIR = path.resolve(__dirname, '..', '..');

/** Parse a JSON report file and extract normalized findings */
function parseReport(toolEntry: typeof TOOLS[0], reportsDir: string): ToolReport {
  const reportPath = path.join(reportsDir, toolEntry.tool, toolEntry.file);
  const result: ToolReport = {
    tool: toolEntry.tool,
    label: toolEntry.label,
    description: toolEntry.description,
    reportPath,
    lastScanned: null,
    status: 'unknown',
    summary: {},
    findings: [],
  };

  if (!fs.existsSync(reportPath)) return result;

  let raw: Record<string, unknown>;
  try {
    raw = JSON.parse(fs.readFileSync(reportPath, 'utf-8'));
  } catch {
    return result;
  }

  result.lastScanned = (raw.timestamp as string) ?? null;
  result.status = (raw.passed as boolean) === true ? 'pass' : 'fail';
  result.summary = (raw.summary as Record<string, unknown>) ?? {};

  // Normalize findings from different report formats
  const rawIssues: unknown[] = (raw.issues as unknown[]) ?? (raw.findings as unknown[]) ?? (raw.vulnerabilities as unknown[]) ?? [];
  result.findings = rawIssues.slice(0, 200).map((item, i) => {
    const issue = item as Record<string, unknown>;
    return {
      id: (issue.id as string) ?? `${toolEntry.tool}-${i}`,
      severity: normalizeSeverity(issue.severity as string),
      title: (issue.title as string) ?? (issue.rule as string) ?? 'Finding',
      file: issue.file as string | undefined,
      line: issue.line as number | undefined,
      message: (issue.message as string) ?? (issue.description as string) ?? '',
      tool: toolEntry.label,
    };
  });

  return result;
}

function normalizeSeverity(s?: string): Finding['severity'] {
  if (!s) return 'INFO';
  const u = s.toUpperCase();
  if (u === 'CRITICAL') return 'CRITICAL';
  if (u === 'HIGH') return 'HIGH';
  if (u === 'MEDIUM' || u === 'MODERATE') return 'MEDIUM';
  if (u === 'LOW') return 'LOW';
  return 'INFO';
}

export function loadDashboardData(reportsDir = path.join(BASE_DIR, 'reports')): DashboardData {
  const tools = TOOLS.map((t) => parseReport(t, reportsDir));

  const allFindings: Finding[] = tools.flatMap((t) => t.findings);

  const totals = {
    critical: allFindings.filter((f) => f.severity === 'CRITICAL').length,
    high: allFindings.filter((f) => f.severity === 'HIGH').length,
    medium: allFindings.filter((f) => f.severity === 'MEDIUM').length,
    low: allFindings.filter((f) => f.severity === 'LOW').length,
    total: allFindings.length,
  };

  const known = tools.filter((t) => t.status !== 'unknown');
  const passing = known.filter((t) => t.status === 'pass').length;
  const overallScore = known.length > 0 ? Math.round((passing / known.length) * 100) : 0;

  return {
    timestamp: new Date().toISOString(),
    overallScore,
    overallStatus: totals.critical === 0 && totals.high === 0 ? 'pass' : 'fail',
    tools,
    allFindings,
    totals,
  };
}
