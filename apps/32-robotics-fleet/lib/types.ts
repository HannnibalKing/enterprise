// Robotics Fleet types
export interface Fleet {
  id: string;
  name: string;
  robots: string[];
  location: string;
  status: "operational" | "maintenance" | "offline";
}

export interface FleetEvent {
  id: string;
  fleetId: string;
  timestamp: Date;
  type: string;
  description: string;
}

export interface FleetMetrics {
  fleetId: string;
  uptime: number;
  downtime: number;
  activeRobots: number;
  incidents: number;
}
