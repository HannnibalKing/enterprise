// Robotics Simulation types
export interface Simulation {
  id: string;
  name: string;
  robots: string[];
  environment: string;
  startTime: Date;
  endTime?: Date;
  status: "pending" | "running" | "completed" | "failed";
}

export interface SimulationResult {
  simulationId: string;
  metrics: Record<string, number>;
  logs: string[];
  completedAt: Date;
}

export interface Environment {
  id: string;
  name: string;
  type: string;
  parameters: Record<string, any>;
}
