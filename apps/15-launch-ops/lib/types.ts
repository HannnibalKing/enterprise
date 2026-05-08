export interface SpaceUser {
  id: string; name: string; role: string; passwordHash: string;
}
export interface Launch {
  id: string; vehicle: string; payload: string; site: string;
  scheduledDate: string; status: 'upcoming'|'hold'|'launched'|'success'|'failure';
  customer: string; orbit: string; massKg: number;
}
export interface Vehicle {
  id: string; name: string; type: string; flightCount: number; status: string;
  lastLanding: string; cores: number; height: number; thrust: number;
}
export interface Countdown {
  launchId: string; t0: string; holds: number; currentEvent: string; nextMilestone: string;
}
export interface Store {
  users: SpaceUser[];
  launches: Launch[];
  vehicles: Vehicle[];
  countdowns: Countdown[];
}
