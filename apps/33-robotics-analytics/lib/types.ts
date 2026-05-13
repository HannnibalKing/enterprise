// Robotics Analytics types
export interface AnalyticsReport {
  id: string;
  title: string;
  createdAt: Date;
  metrics: Record<string, number>;
  summary: string;
}

export interface PerformanceMetric {
  robotId: string;
  timestamp: Date;
  metric: string;
  value: number;
}

export interface TrendAnalysis {
  id: string;
  metric: string;
  dataPoints: { timestamp: Date; value: number }[];
  trend: "upward" | "downward" | "stable";
}
