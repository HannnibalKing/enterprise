export interface Vulnerability {
  id: string;
  rule: string;
  category: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INFO';
  message: string;
  file: string;
  line: number;
  column: number;
  snippet: string;
  owaspCategory: string;
  cwe: string;
  remediation: string;
}

export interface ScanResult {
  file: string;
  vulnerabilities: Vulnerability[];
  linesScanned: number;
  duration: number;
}

export interface ScanReport {
  scanId: string;
  timestamp: string;
  rootDir: string;
  totalFiles: number;
  totalLines: number;
  duration: number;
  summary: {
    critical: number;
    high: number;
    medium: number;
    low: number;
    info: number;
    total: number;
  };
  results: ScanResult[];
  passed: boolean;
}

export interface ScanRule {
  id: string;
  name: string;
  category: string;
  severity: Vulnerability['severity'];
  owaspCategory: string;
  cwe: string;
  pattern: RegExp;
  message: string;
  remediation: string;
  fileTypes?: string[];
}

export interface ScanOptions {
  rootDir: string;
  include?: string[];
  exclude?: string[];
  severity?: Vulnerability['severity'][];
  output?: 'json' | 'table' | 'html';
  outputFile?: string;
  failOn?: Vulnerability['severity'];
}
