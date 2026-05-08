import bcrypt from 'bcryptjs';
import type { Store } from './types';
function lcg(seed: number) { let s=seed>>>0; return ()=>{ s=(Math.imul(1664525,s)+1013904223)>>>0; return s/0x100000000; }; }
function initStore(): Store {
  const pw = bcrypt.hashSync('orbital123', 10);
  const users = [
    { id:'u1', name:'kepler', role:'trajectory_lead', passwordHash: pw },
    { id:'u2', name:'cassini', role:'orbital_mech', passwordHash: pw },
    { id:'u3', name:'newton', role:'systems_eng', passwordHash: pw },
    { id:'u4', name:'hubble', role:'ground_ops', passwordHash: pw },
    { id:'u5', name:'voyager', role:'mission_analyst', passwordHash: pw },
  ];
  const rng = lcg(16001);
  const spacecraft = [
    { id:'sc1', name:'ISS', type:'Space Station', nation:'Multinational', altitudeKm:408, inclinationDeg:51.6, periodMin:92.68, status:'operational' as const, mission:'Continuous crewed habitation' },
    { id:'sc2', name:'Hubble ST', type:'Observatory', nation:'USA', altitudeKm:547, inclinationDeg:28.5, periodMin:95.47, status:'operational' as const, mission:'Astronomical imaging' },
    { id:'sc3', name:'GPS III-7', type:'Navigation', nation:'USA', altitudeKm:20200, inclinationDeg:55.0, periodMin:717.97, status:'operational' as const, mission:'GNSS signal broadcast' },
    { id:'sc4', name:'Starlink-V2-1', type:'Comms', nation:'USA', altitudeKm:550, inclinationDeg:53.0, periodMin:95.64, status:'operational' as const, mission:'Broadband internet' },
    { id:'sc5', name:'GOES-18', type:'Weather', nation:'USA', altitudeKm:35786, inclinationDeg:0.0, periodMin:1436.1, status:'operational' as const, mission:'Western US weather' },
    { id:'sc6', name:'Landsat 9', type:'Earth Obs', nation:'USA', altitudeKm:705, inclinationDeg:98.2, periodMin:98.9, status:'operational' as const, mission:'Land surface imaging' },
    { id:'sc7', name:'JWST', type:'Observatory', nation:'Multinational', altitudeKm:1500000, inclinationDeg:0, periodMin:262800, status:'operational' as const, mission:'Infrared astronomy L2' },
    { id:'sc8', name:'MRO', type:'Mars Orbiter', nation:'USA', altitudeKm:300, inclinationDeg:93.0, periodMin:112, status:'operational' as const, mission:'Mars reconnaissance' },
    { id:'sc9', name:'Voyager 1', type:'Probe', nation:'USA', altitudeKm:23400000000, inclinationDeg:35.5, periodMin:0, status:'operational' as const, mission:'Interstellar space' },
    { id:'sc10', name:'Galileo-IOV-1', type:'Navigation', nation:'EU', altitudeKm:23222, inclinationDeg:56.0, periodMin:844.8, status:'operational' as const, mission:'European GNSS' },
    { id:'sc11', name:'SDO', type:'Observatory', nation:'USA', altitudeKm:36000, inclinationDeg:28.5, periodMin:1440, status:'operational' as const, mission:'Solar dynamics observatory' },
    { id:'sc12', name:'DART-2', type:'Probe', nation:'USA', altitudeKm:0, inclinationDeg:0, periodMin:0, status:'anomaly' as const, mission:'Asteroid impact' },
    { id:'sc13', name:'Sentinel-2B', type:'Earth Obs', nation:'EU', altitudeKm:786, inclinationDeg:98.6, periodMin:100.6, status:'operational' as const, mission:'Multispectral land obs' },
    { id:'sc14', name:'TESS', type:'Observatory', nation:'USA', altitudeKm:373000, inclinationDeg:37.0, periodMin:13.7*24*60, status:'operational' as const, mission:'Exoplanet transit survey' },
    { id:'sc15', name:'CubeSat-Alpha', type:'Technology', nation:'USA', altitudeKm:450, inclinationDeg:51.6, periodMin:93.5, status:'operational' as const, mission:'Tech demonstration' },
    { id:'sc16', name:'Tianhe-CSS', type:'Space Station', nation:'China', altitudeKm:389, inclinationDeg:41.5, periodMin:92.1, status:'operational' as const, mission:'Chinese space station' },
  ];
  const stations = [
    { id:'gs1', name:'Goldstone', location:'Barstow, CA', lat:35.43, lon:-116.89, antennas:4, maxElevationDeg:88, status:'operational' },
    { id:'gs2', name:'Madrid DSS', location:'Robledo, Spain', lat:40.43, lon:-4.25, antennas:3, maxElevationDeg:85, status:'operational' },
    { id:'gs3', name:'Canberra DSN', location:'Tidbinbilla, AU', lat:-35.40, lon:148.98, antennas:3, maxElevationDeg:87, status:'operational' },
    { id:'gs4', name:'White Sands', location:'NM, USA', lat:32.50, lon:-106.61, antennas:2, maxElevationDeg:82, status:'operational' },
    { id:'gs5', name:'Svalbard SG', location:'Longyearbyen, NO', lat:78.23, lon:15.40, antennas:2, maxElevationDeg:90, status:'operational' },
  ];
  const contacts = [
    { id:'c1', spacecraftId:'sc1', stationId:'gs4', rosStart:'2026-01-14T08:00:00Z', rosEnd:'2026-01-14T08:12:00Z', maxElevDeg:72, status:'scheduled' },
    { id:'c2', spacecraftId:'sc2', stationId:'gs4', rosStart:'2026-01-14T09:30:00Z', rosEnd:'2026-01-14T09:55:00Z', maxElevDeg:45, status:'scheduled' },
    { id:'c3', spacecraftId:'sc7', stationId:'gs1', rosStart:'2026-01-14T10:00:00Z', rosEnd:'2026-01-14T11:00:00Z', maxElevDeg:60, status:'active' },
    { id:'c4', spacecraftId:'sc8', stationId:'gs1', rosStart:'2026-01-14T12:00:00Z', rosEnd:'2026-01-14T12:45:00Z', maxElevDeg:30, status:'scheduled' },
    { id:'c5', spacecraftId:'sc9', stationId:'gs3', rosStart:'2026-01-14T06:00:00Z', rosEnd:'2026-01-14T14:00:00Z', maxElevDeg:25, status:'active' },
    { id:'c6', spacecraftId:'sc11', stationId:'gs2', rosStart:'2026-01-14T07:30:00Z', rosEnd:'2026-01-14T08:30:00Z', maxElevDeg:55, status:'complete' },
  ];
  return { users, spacecraft, stations, contacts };
}
const g = globalThis as typeof globalThis & { __orbitalStore?: Store };
export const store = g.__orbitalStore ?? (g.__orbitalStore = initStore());
