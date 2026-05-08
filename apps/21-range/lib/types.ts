export interface SpaceUser {
  id: string; name: string; role: string; passwordHash: string;
}
export interface HazardZone {
  id: string; name: string; type: string; radiusKm: number;
  status: 'active'|'cleared'|'pending'; activatedAt: string; clearanceRequired: string;
}
export interface Clearance {
  id: string; zoneId: string; authority: string; issuedAt: string;
  expiresAt: string; status: 'granted'|'pending'|'revoked'; conditions: string;
}
export interface WeatherData {
  id: string; date: string; windSpeedKnots: number; windDir: number;
  visibilityNm: number; cloudCeilingFt: number; lightning: boolean;
  launchGo: boolean; forecast: string;
}
export interface Incident {
  id: string; date: string; severity: 'minor'|'moderate'|'major'|'critical';
  system: string; description: string; status: 'open'|'investigating'|'closed';
}
export interface Store {
  users: SpaceUser[];
  hazards: HazardZone[];
  clearances: Clearance[];
  weather: WeatherData[];
  incidents: Incident[];
}
