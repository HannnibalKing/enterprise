export type HeaderSeverity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INFO' | 'PASS';

export interface HeaderCheck {
  header: string;
  expected: string;
  actual: string | null;
  severity: HeaderSeverity;
  passed: boolean;
  message: string;
  recommendation: string;
  reference: string;
}

export interface CorsCheck {
  allowOrigin: string | null;
  allowMethods: string | null;
  allowHeaders: string | null;
  exposeHeaders: string | null;
  allowCredentials: string | null;
  maxAge: string | null;
  issues: string[];
  passed: boolean;
}

export interface LiveInspectionResult {
  url: string;
  statusCode: number;
  responseTime: number;
  headers: Record<string, string>;
  headerChecks: HeaderCheck[];
  corsCheck: CorsCheck;
  score: number;        // 0–100
  grade: 'A+' | 'A' | 'B' | 'C' | 'D' | 'F';
  passed: boolean;
}

export interface StaticAnalysisResult {
  file: string;
  line: number;
  issue: string;
  severity: HeaderSeverity;
  snippet: string;
  remediation: string;
}

export interface HeaderReport {
  reportId: string;
  timestamp: string;
  liveResults: LiveInspectionResult[];
  staticResults: StaticAnalysisResult[];
  passed: boolean;
}
