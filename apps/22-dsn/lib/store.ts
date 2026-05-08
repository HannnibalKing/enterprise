import bcrypt from 'bcryptjs';
import type { Store, Station, Antenna } from './types';
function lcg(seed: number) { let s=seed>>>0; return ()=>{ s=(Math.imul(1664525,s)+1013904223)>>>0; return s/0x100000000; }; }
function initStore(): Store {
  const pw = bcrypt.hashSync('dsn123', 10);
  const users = [
    { id:'u1', name:'goldstone', role:'station_director', passwordHash: pw },
    { id:'u2', name:'madrid', role:'contact_lead', passwordHash: pw },
    { id:'u3', name:'canberra', role:'scheduler', passwordHash: pw },
    { id:'u4', name:'uplink', role:'rf_engineer', passwordHash: pw },
    { id:'u5', name:'comm', role:'comm_ops', passwordHash: pw },
  ];
  const dss14Antennas: Antenna[] = [
    { id:'a1', stationId:'gs1', designation:'DSS-14 70m', diameterM:70, freqBands:['S','X','Ka'], uplinkKbps:1000, downlinkMbps:115, status:'operational' },
    { id:'a2', stationId:'gs1', designation:'DSS-24 34m BWG', diameterM:34, freqBands:['X','Ka'], uplinkKbps:500, downlinkMbps:500, status:'operational' },
    { id:'a3', stationId:'gs1', designation:'DSS-25 34m HEF', diameterM:34, freqBands:['X','Ka'], uplinkKbps:500, downlinkMbps:500, status:'maintenance' },
    { id:'a4', stationId:'gs1', designation:'DSS-26 34m BWG', diameterM:34, freqBands:['X','Ka'], uplinkKbps:500, downlinkMbps:500, status:'operational' },
  ];
  const madridAntennas: Antenna[] = [
    { id:'a5', stationId:'gs2', designation:'DSS-63 70m', diameterM:70, freqBands:['S','X'], uplinkKbps:1000, downlinkMbps:115, status:'operational' },
    { id:'a6', stationId:'gs2', designation:'DSS-53 34m BWG', diameterM:34, freqBands:['X','Ka'], uplinkKbps:500, downlinkMbps:500, status:'operational' },
    { id:'a7', stationId:'gs2', designation:'DSS-54 34m HEF', diameterM:34, freqBands:['X','Ka'], uplinkKbps:500, downlinkMbps:500, status:'operational' },
  ];
  const canberraAntennas: Antenna[] = [
    { id:'a8', stationId:'gs3', designation:'DSS-43 70m', diameterM:70, freqBands:['S','X'], uplinkKbps:1000, downlinkMbps:115, status:'operational' },
    { id:'a9', stationId:'gs3', designation:'DSS-34 34m BWG', diameterM:34, freqBands:['X','Ka'], uplinkKbps:500, downlinkMbps:500, status:'operational' },
    { id:'a10', stationId:'gs3', designation:'DSS-35 34m', diameterM:34, freqBands:['X','Ka'], uplinkKbps:500, downlinkMbps:500, status:'operational' },
  ];
  const stations: Station[] = [
    { id:'gs1', name:'Goldstone', complex:'goldstone', location:'Barstow, CA', lat:35.43, lon:-116.89, antennas:dss14Antennas, status:'operational' },
    { id:'gs2', name:'Madrid', complex:'madrid', location:'Robledo, Spain', lat:40.43, lon:-4.25, antennas:madridAntennas, status:'operational' },
    { id:'gs3', name:'Canberra', complex:'canberra', location:'Tidbinbilla, AU', lat:-35.40, lon:148.98, antennas:canberraAntennas, status:'operational' },
  ];
  const contacts = [
    { id:'c1', antennaId:'a1', spacecraft:'Voyager 1', startTime:'2026-01-14T09:00:00Z', endTime:'2026-01-14T17:00:00Z', uplinkKbps:1, downlinkMbps:0.00016, status:'active' as const },
    { id:'c2', antennaId:'a5', spacecraft:'Mars Reconnaissance Orbiter', startTime:'2026-01-14T08:00:00Z', endTime:'2026-01-14T10:00:00Z', uplinkKbps:500, downlinkMbps:4.0, status:'active' as const },
    { id:'c3', antennaId:'a8', spacecraft:'JWST', startTime:'2026-01-14T10:30:00Z', endTime:'2026-01-14T12:30:00Z', uplinkKbps:1000, downlinkMbps:28.0, status:'scheduled' as const },
    { id:'c4', antennaId:'a2', spacecraft:'Europa Clipper', startTime:'2026-01-14T11:00:00Z', endTime:'2026-01-14T13:00:00Z', uplinkKbps:500, downlinkMbps:0.5, status:'scheduled' as const },
    { id:'c5', antennaId:'a6', spacecraft:'Mars Odyssey', startTime:'2026-01-14T06:00:00Z', endTime:'2026-01-14T08:00:00Z', uplinkKbps:250, downlinkMbps:2.0, status:'complete' as const },
    { id:'c6', antennaId:'a9', spacecraft:'New Horizons', startTime:'2026-01-14T14:00:00Z', endTime:'2026-01-14T22:00:00Z', uplinkKbps:100, downlinkMbps:0.001, status:'scheduled' as const },
    { id:'c7', antennaId:'a4', spacecraft:'ISS', startTime:'2026-01-14T07:45:00Z', endTime:'2026-01-14T08:00:00Z', uplinkKbps:500, downlinkMbps:10.0, status:'complete' as const },
    { id:'c8', antennaId:'a7', spacecraft:'Artemis VII', startTime:'2026-01-14T12:00:00Z', endTime:'2026-01-14T14:00:00Z', uplinkKbps:1000, downlinkMbps:6.0, status:'scheduled' as const },
  ];
  const rng = lcg(22001);
  const links = contacts.map((c,i)=>({
    id:`lk${i+1}`, contactId:c.id, eirpDbw:Math.floor(rng()*20+70),
    snrDb:Math.floor(rng()*15+8), rangeKm:Math.floor(rng()*1e9+1e6),
    rtltSec:Math.floor(rng()*8000+10), bitErrorRate:rng()*1e-6,
  }));
  return { users, stations, contacts, links };
}
const g = globalThis as typeof globalThis & { __dsnStore?: Store };
export const store = g.__dsnStore ?? (g.__dsnStore = initStore());
