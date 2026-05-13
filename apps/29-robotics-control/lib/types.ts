// Robotics Control types
export interface Robot {
  id: string;
  name: string;
  status: "idle" | "active" | "error" | "offline";
  batteryLevel: number;
  position: { x: number; y: number; z: number };
  orientation: { roll: number; pitch: number; yaw: number };
}

export interface Command {
  id: string;
  robotId: string;
  type: string;
  parameters: Record<string, any>;
  issuedAt: Date;
  status: "pending" | "executed" | "failed";
}

export interface Telemetry {
  robotId: string;
  timestamp: Date;
  temperature: number;
  velocity: number;
  load: number;
}
