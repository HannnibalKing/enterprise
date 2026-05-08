export type FindingSeverity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INFO';

export interface AuthFinding {
  id: string;
  severity: FindingSeverity;
  category: 'JWT' | 'Session' | 'OAuth' | 'Cookie' | 'CSRF' | 'MFA' | 'Password' | 'General';
  title: string;
  message: string;
  file: string;
  line: number;
  snippet: string;
  cwe: string;
  remediation: string;
}

export interface AuthReport {
  reportId: string;
  timestamp: string;
  rootDir: string;
  totalFiles: number;
  findings: AuthFinding[];
  summary: {
    critical: number;
    high: number;
    medium: number;
    low: number;
    info: number;
    total: number;
  };
  coverageChecks: CoverageCheck[];
  passed: boolean;
}

export interface CoverageCheck {
  name: string;
  present: boolean;
  severity: FindingSeverity;
  description: string;
}
