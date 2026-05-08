export interface TrafficRecord {
  id: string;
  timestamp: string;
  method: string;
  path: string;
  query: Record<string, string | string[]>;
  requestHeaders: Record<string, string>;
  requestBody: unknown;
  responseStatus: number;
  responseHeaders: Record<string, string>;
  responseBody: unknown;
  durationMs: number;
  clientIp: string;
  anomalies: Anomaly[];
  flagged: boolean;
}

export interface Anomaly {
  type: AnomalyType;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  message: string;
  detail?: string;
}

export type AnomalyType =
  | 'INJECTION_ATTEMPT'
  | 'OVERSIZED_PAYLOAD'
  | 'SUSPICIOUS_HEADER'
  | 'SENSITIVE_DATA_IN_RESPONSE'
  | 'SLOW_RESPONSE'
  | 'AUTH_MISSING'
  | 'METHOD_NOT_ALLOWED'
  | 'EXCESSIVE_PARAMS'
  | 'PROTOTYPE_POLLUTION'
  | 'PATH_TRAVERSAL';

export interface MonitorStats {
  totalRequests: number;
  flaggedRequests: number;
  statusCodes: Record<number, number>;
  slowRequests: number;
  topPaths: Record<string, number>;
  anomalyBreakdown: Record<AnomalyType, number>;
  startTime: string;
  uptime: number;
}

export interface MonitorConfig {
  targetUrl: string;
  proxyPort: number;
  maxBodySize: number;           // bytes
  slowRequestThreshold: number;  // ms
  logFile?: string;
  enableWebSocket: boolean;
  wsPort: number;
}
