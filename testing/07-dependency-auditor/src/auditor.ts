import { execSync, spawnSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import { AuditResult, Dependency, Ecosystem, Vulnerability, VulnSeverity } from './types';

/** Run npm audit --json and parse results */
export function auditNpm(dir: string): AuditResult | null {
  const manifest = path.join(dir, 'package.json');
  if (!fs.existsSync(manifest)) return null;

  let rawOutput: string;
  try {
    rawOutput = execSync('npm audit --json', {
      cwd: dir,
      encoding: 'utf-8',
      timeout: 60_000,
      stdio: ['ignore', 'pipe', 'ignore'],
    });
  } catch (err: unknown) {
    // npm audit exits with non-zero when vulnerabilities found — capture stdout
    rawOutput = (err as { stdout?: string }).stdout ?? '';
  }

  if (!rawOutput.trim()) return null;

  let auditData: NpmAuditJson;
  try {
    auditData = JSON.parse(rawOutput) as NpmAuditJson;
  } catch {
    return null;
  }

  const dependencies: Dependency[] = [];
  const vulnMap: Record<string, Dependency> = {};

  // npm audit v2 format (npm 7+)
  if (auditData.vulnerabilities) {
    for (const [name, vuln] of Object.entries(auditData.vulnerabilities)) {
      const vulns: Vulnerability[] = (vuln.via ?? [])
        .filter((v): v is NpmViaObject => typeof v === 'object')
        .map((v) => ({
          id: String(v.source ?? `npm-${name}`),
          title: v.title ?? 'Unknown vulnerability',
          severity: normalizeSeverity(vuln.severity),
          cvssScore: v.cvss?.score,
          cve: v.cve?.[0],
          description: v.url ?? '',
          affectedVersions: v.range ?? '*',
          fixedIn: vuln.fixAvailable ? String(vuln.fixAvailable) : undefined,
          url: v.url,
        }));

      const dep: Dependency = {
        name,
        version: vuln.range ?? 'unknown',
        type: vuln.isDirect ? 'direct' : 'transitive',
        ecosystem: 'npm',
        vulnerabilities: vulns,
      };
      dependencies.push(dep);
      if (vulns.length > 0) vulnMap[name] = dep;
    }
  }

  const summary = buildSummary(dependencies);
  return {
    ecosystem: 'npm',
    manifestFile: manifest,
    dependencies,
    vulnerable: Object.values(vulnMap),
    summary,
  };
}

/** Run pip-audit --json and parse results */
export function auditPip(dir: string): AuditResult | null {
  const requirementsFiles = ['requirements.txt', 'Pipfile', 'pyproject.toml'].map((f) =>
    path.join(dir, f)
  );
  const hasRequirements = requirementsFiles.some(fs.existsSync);
  if (!hasRequirements) return null;

  const result = spawnSync('pip-audit', ['--format=json', '--skip-editable'], {
    cwd: dir,
    encoding: 'utf-8',
    timeout: 120_000,
  });

  const rawOutput = result.stdout ?? '';
  if (!rawOutput.trim()) return null;

  let data: PipAuditEntry[];
  try {
    data = JSON.parse(rawOutput) as PipAuditEntry[];
  } catch {
    return null;
  }

  const dependencies: Dependency[] = data.map((entry) => ({
    name: entry.name,
    version: entry.version,
    type: 'direct' as const,
    ecosystem: 'pip' as Ecosystem,
    vulnerabilities: (entry.vulns ?? []).map((v) => ({
      id: v.id,
      title: v.id,
      severity: 'HIGH' as VulnSeverity, // pip-audit doesn't always include severity
      description: v.description ?? '',
      affectedVersions: v.fix_versions?.join(', ') ?? '*',
      fixedIn: v.fix_versions?.[0],
      url: v.link,
    })),
  }));

  const summary = buildSummary(dependencies);
  return {
    ecosystem: 'pip',
    manifestFile: requirementsFiles.find(fs.existsSync) ?? 'requirements.txt',
    dependencies,
    vulnerable: dependencies.filter((d) => d.vulnerabilities.length > 0),
    summary,
  };
}

/** Run govulncheck and parse results */
export function auditGo(dir: string): AuditResult | null {
  const goMod = path.join(dir, 'go.mod');
  if (!fs.existsSync(goMod)) return null;

  const result = spawnSync('govulncheck', ['-json', './...'], {
    cwd: dir,
    encoding: 'utf-8',
    timeout: 120_000,
  });

  const rawOutput = result.stdout ?? '';
  if (!rawOutput.trim()) return null;

  // govulncheck outputs NDJSON lines
  const lines = rawOutput.split('\n').filter(Boolean);
  const vulns: Dependency[] = [];

  for (const line of lines) {
    try {
      const obj = JSON.parse(line) as GoVulnEntry;
      if (obj.finding) {
        vulns.push({
          name: obj.finding.osv ?? 'unknown',
          version: 'unknown',
          type: 'transitive',
          ecosystem: 'go',
          vulnerabilities: [{
            id: obj.finding.osv ?? 'unknown',
            title: obj.finding.osv ?? 'Unknown',
            severity: 'HIGH',
            description: `Call stack: ${JSON.stringify(obj.finding.trace?.map((t) => t.function))}`,
            affectedVersions: '*',
          }],
        });
      }
    } catch { /* skip malformed lines */ }
  }

  const summary = buildSummary(vulns);
  return {
    ecosystem: 'go',
    manifestFile: goMod,
    dependencies: vulns,
    vulnerable: vulns.filter((d) => d.vulnerabilities.length > 0),
    summary,
  };
}

function normalizeSeverity(s: string): VulnSeverity {
  switch (s?.toLowerCase()) {
    case 'critical': return 'CRITICAL';
    case 'high': return 'HIGH';
    case 'moderate': case 'medium': return 'MODERATE';
    case 'low': return 'LOW';
    default: return 'INFO';
  }
}

function buildSummary(deps: Dependency[]) {
  const vulnerable = deps.filter((d) => d.vulnerabilities.length > 0);
  const all = vulnerable.flatMap((d) => d.vulnerabilities);
  return {
    total: deps.length,
    vulnerable: vulnerable.length,
    critical: all.filter((v) => v.severity === 'CRITICAL').length,
    high: all.filter((v) => v.severity === 'HIGH').length,
    moderate: all.filter((v) => v.severity === 'MODERATE').length,
    low: all.filter((v) => v.severity === 'LOW').length,
  };
}

// ── Type helpers for npm audit JSON ─────────────────────────────────────────

interface NpmViaObject {
  source?: number;
  title?: string;
  url?: string;
  severity?: string;
  cvss?: { score?: number };
  cve?: string[];
  range?: string;
}

interface NpmAuditJson {
  vulnerabilities?: Record<string, {
    name: string;
    severity: string;
    isDirect: boolean;
    range: string;
    fixAvailable?: boolean | { name: string; version: string };
    via?: (string | NpmViaObject)[];
  }>;
  metadata?: { vulnerabilities: Record<string, number> };
}

interface PipAuditEntry {
  name: string;
  version: string;
  vulns?: Array<{
    id: string;
    description?: string;
    fix_versions?: string[];
    link?: string;
  }>;
}

interface GoVulnEntry {
  finding?: {
    osv?: string;
    trace?: Array<{ function?: string }>;
  };
}
