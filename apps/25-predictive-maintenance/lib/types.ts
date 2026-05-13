// Predictive Maintenance types
export interface Equipment {
  id: string;
  name: string;
  type: string;
  location: string;
  lastMaintenance: Date;
  healthScore: number;
  failureRisk: "low" | "medium" | "high" | "critical";
}

export interface MaintenancePrediction {
  equipmentId: string;
  predictedFailureDate: Date;
  confidence: number;
  recommendedAction: string;
  estimatedDowntime: number;
}

export interface SensorData {
  equipmentId: string;
  timestamp: Date;
  temperature: number;
  vibration: number;
  pressure: number;
  efficiency: number;
}
