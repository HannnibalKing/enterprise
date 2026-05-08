export interface SpaceUser {
  id: string; name: string; role: string; passwordHash: string;
}
export interface FleetVehicle {
  id: string; name: string; type: 'Falcon 9'|'Falcon Heavy'|'Starship';
  serialNumber: string; flightCount: number; status: string;
  location: string; nextLaunch: string | null; readinessScore: number;
}
export interface LaunchRecord {
  id: string; vehicleId: string; date: string; payload: string;
  orbit: string; outcome: 'success'|'partial'|'failure'; landingOutcome: string;
  customer: string; site: string;
}
export interface MaintenanceTask {
  id: string; vehicleId: string; task: string; type: string;
  scheduledDate: string; completedDate: string | null; technician: string;
  status: 'scheduled'|'in-progress'|'complete'|'overdue';
}
export interface Store {
  users: SpaceUser[];
  vehicles: FleetVehicle[];
  launches: LaunchRecord[];
  maintenance: MaintenanceTask[];
}
