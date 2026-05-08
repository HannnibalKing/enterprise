export type VulnSeverity = 'CRITICAL' | 'HIGH' | 'MODERATE' | 'LOW' | 'INFO';
export type Ecosystem = 'npm' | 'pip' | 'go' | 'cargo';

export interface Vulnerability {
  id: string;
  title: string;
  severity: VulnSeverity;
  cvssScore?: number;
  cve?: string;
  cwe?: string;
  description: string;
  affectedVersions: string;
  fixedIn?: string;
  url?: string;
}

export interface Dependency {
  name: string;
  version: string;
  type: 'direct' | 'transitive';
  ecosystem: Ecosystem;
  vulnerabilities: Vulnerability[];
  isOutdated?: boolean;
  latestVersion?: string;
}

export interface AuditResult {
  ecosystem: Ecosystem;
  manifestFile: string;
  dependencies: Dependency[];
  vulnerable: Dependency[];
  summary: {
    total: number;
    vulnerable: number;
    critical: number;
    high: number;
    moderate: number;
    low: number;
  };
}

export interface DependencyReport {
  reportId: string;
  timestamp: string;
  rootDir: string;
  results: AuditResult[];
  overallSummary: {
    totalDependencies: number;
    totalVulnerable: number;
    critical: number;
    high: number;
    moderate: number;
    low: number;
  };
  passed: boolean;
  remediationPlan: RemediationItem[];
}

export interface RemediationItem {
  package: string;
  ecosystem: Ecosystem;
  currentVersion: string;
  fixedIn?: string;
  action: 'upgrade' | 'replace' | 'remove' | 'monitor';
  priority: 'IMMEDIATE' | 'SOON' | 'PLANNED';
  vulnerabilities: string[];
}
