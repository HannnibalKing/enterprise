export interface SpaceUser {
  id: string; name: string; role: string; passwordHash: string;
}
export interface Spacecraft {
  id: string; name: string; type: string; nation: string;
  altitudeKm: number; inclinationDeg: number; periodMin: number;
  status: 'operational'|'decommissioned'|'anomaly'; mission: string;
}
export interface GroundStation {
  id: string; name: string; location: string; lat: number; lon: number;
  antennas: number; maxElevationDeg: number; status: string;
}
export interface Contact {
  id: string; spacecraftId: string; stationId: string;
  rosStart: string; rosEnd: string; maxElevDeg: number; status: string;
}
export interface Store {
  users: SpaceUser[];
  spacecraft: Spacecraft[];
  stations: GroundStation[];
  contacts: Contact[];
}
