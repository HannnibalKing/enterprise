export interface SpaceUser {
  id: string; name: string; role: string; passwordHash: string;
}
export interface Payload {
  id: string; name: string; customer: string; type: 'scientific'|'commercial'|'defense'|'government';
  massKg: number; status: string; targetOrbit: string; launchId: string | null;
  integrationComplete: boolean; hazardClass: string;
}
export interface Manifest {
  id: string; vehicleId: string; launchDate: string; payloadIds: string[];
  totalMassKg: number; status: string; orbit: string; customer: string;
}
export interface ProcessingMilestone {
  id: string; payloadId: string; milestone: string; plannedDate: string;
  completedDate: string | null; status: 'pending'|'in-progress'|'complete'|'delayed';
}
export interface Store {
  users: SpaceUser[];
  payloads: Payload[];
  manifests: Manifest[];
  milestones: ProcessingMilestone[];
}
