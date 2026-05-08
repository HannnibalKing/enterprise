export interface SpaceUser {
  id: string; name: string; role: string; passwordHash: string;
}
export interface Astronaut {
  id: string; name: string; agency: string; status: string;
  currentMission: string | null; flightHours: number; evaHours: number;
  specializations: string[]; bloodType: string;
}
export interface TrainingRecord {
  id: string; astronautId: string; module: string; completedDate: string;
  score: number; certificationExpiry: string; instructor: string;
}
export interface HealthRecord {
  id: string; astronautId: string; date: string; heartRate: number;
  bloodPressure: string; vo2Max: number; boneDensity: number; status: string;
}
export interface Store {
  users: SpaceUser[];
  astronauts: Astronaut[];
  training: TrainingRecord[];
  health: HealthRecord[];
}
