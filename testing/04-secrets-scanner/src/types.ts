export interface SecretPattern {
  id: string;
  name: string;
  provider: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  pattern: RegExp;
  falsePositiveFilter?: RegExp;
}

export interface SecretFinding {
  id: string;
  ruleId: string;
  ruleName: string;
  provider: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  file: string;
  line: number;
  column: number;
  snippet: string;           // redacted form
  raw: string;               // full match (only in JSON, redacted in console)
  type: 'pattern' | 'entropy';
  entropy?: number;
  commit?: string;
}

export interface SecretsReport {
  reportId: string;
  timestamp: string;
  rootDir: string;
  filesScanned: number;
  linesScanned: number;
  findings: SecretFinding[];
  summary: {
    critical: number;
    high: number;
    medium: number;
    total: number;
  };
  passed: boolean;
}
