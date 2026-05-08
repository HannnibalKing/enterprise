export interface SpaceUser {
  id: string; name: string; role: string; passwordHash: string;
}
export interface Station {
  id: string; name: string; complex: 'goldstone'|'madrid'|'canberra'; location: string;
  lat: number; lon: number; antennas: Antenna[]; status: string;
}
export interface Antenna {
  id: string; stationId: string; designation: string; diameterM: number;
  freqBands: string[]; uplinkKbps: number; downlinkMbps: number; status: string;
}
export interface DSNContact {
  id: string; antennaId: string; spacecraft: string; startTime: string; endTime: string;
  uplinkKbps: number; downlinkMbps: number; status: 'scheduled'|'active'|'complete';
}
export interface LinkBudget {
  id: string; contactId: string; eirpDbw: number; snrDb: number;
  rangeKm: number; rtltSec: number; bitErrorRate: number;
}
export interface Store {
  users: SpaceUser[];
  stations: Station[];
  contacts: DSNContact[];
  links: LinkBudget[];
}
