export interface SpaceUser {
  id: string; name: string; role: string; passwordHash: string;
}
export interface Mission {
  id: string; name: string; type: string; status: string; phase: string;
  crew: string[]; launchDate: string; duration: number; altitude: number;
  inclination: number; objective: string;
}
export interface TelemetryPoint {
  id: string; missionId: string; timestamp: string; parameter: string;
  value: number; unit: string; status: 'nominal'|'caution'|'warning';
}
export interface Anomaly {
  id: string; missionId: string; timestamp: string; severity: 'low'|'medium'|'high'|'critical';
  system: string; description: string; status: 'open'|'investigating'|'resolved';
}
export interface Store {
  users: SpaceUser[];
  missions: Mission[];
  telemetry: TelemetryPoint[];
  anomalies: Anomaly[];
}
