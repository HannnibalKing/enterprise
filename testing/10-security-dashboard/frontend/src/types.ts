// Types shared between frontend and backend
export interface ToolReport {
  tool: string;
  label: string;
  description: string;
  lastScanned: string | null;
  status: 'pass' | 'fail' | 'unknown';
  summary: Record<string, unknown>;
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
  tools: (ToolReport & { findings: Finding[] })[];
  allFindings: Finding[];
  totals: {
    critical: number;
    high: number;
    medium: number;
    low: number;
    total: number;
  };
}
