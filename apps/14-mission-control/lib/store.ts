import bcrypt from 'bcryptjs';
import type { Store } from './types';
function lcg(seed: number) { let s=seed>>>0; return ()=>{ s=(Math.imul(1664525,s)+1013904223)>>>0; return s/0x100000000; }; }
function initStore(): Store {
  const pw = bcrypt.hashSync('mission123', 10);
  const users = [
    { id:'u1', name:'falcon', role:'flight_director', passwordHash: pw },
    { id:'u2', name:'sagan', role:'fco', passwordHash: pw },
    { id:'u3', name:'ada', role:'guidance_officer', passwordHash: pw },
    { id:'u4', name:'turing', role:'telemetry_lead', passwordHash: pw },
    { id:'u5', name:'copernicus', role:'range_safety', passwordHash: pw },
  ];
  const rng = lcg(14001);
  const missionNames = ['ARTEMIS-VII','MARS-ODYSSEY-3','ISS-RESUPPLY-29','LUNAR-GATEWAY-4','HELIOS-PROBE','EUROPA-SURVEY','GEO-STAR-12','DEBRIS-CLEAN-1'];
  const types = ['LEO','GEO','Lunar','Mars','Heliocentric','Europa','GEO','LEO'];
  const statuses = ['active','active','active','transit','active','cruise','nominal','nominal'];
  const phases = ['Orbital Ops','Transit','Docking','TLI','Cruise','Science','Station-Keeping','Deorbit Prep'];
  const objectives = [
    'Lunar surface survey and sample return','Mars atmospheric science mission',
    'Crew and cargo delivery to ISS','Lunar Gateway habitat installation',
    'Solar wind particle measurement','Europa ocean subsurface survey',
    'Geostationary communications relay','Orbital debris collection prototype',
  ];
  const missions = missionNames.map((name,i)=>({
    id:`m${i+1}`, name, type:types[i], status:statuses[i], phase:phases[i],
    crew: i<4 ? ['CDR','PLT','MS1'] : [],
    launchDate:`2025-0${(i%9)+1}-${String(Math.floor(rng()*28)+1).padStart(2,'0')}`,
    duration: Math.floor(rng()*365+30),
    altitude: Math.floor(rng()*35000+400),
    inclination: Math.floor(rng()*90+5),
    objective: objectives[i],
  }));
  const params = ['TEMP_FUEL','PRES_LOX','VOLT_BUS1','CURR_MAIN','TEMP_ENG','PRES_CABIN'];
  const rng2 = lcg(14002);
  const telemetry = Array.from({length:24},(_,i)=>({
    id:`t${i+1}`, missionId:`m${(i%8)+1}`,
    timestamp: `2026-01-${String(Math.floor(i/3)+1).padStart(2,'0')}T${String(i*1%24).padStart(2,'0')}:00:00Z`,
    parameter: params[i%params.length], value: Math.floor(rng2()*200+50),
    unit: ['K','kPa','V','A','K','kPa'][i%6],
    status: (rng2()<0.15?'warning':rng2()<0.05?'caution':'nominal') as 'nominal'|'caution'|'warning',
  }));
  const rng3 = lcg(14003);
  const anomalies = [
    { id:'a1', missionId:'m1', timestamp:'2026-01-14T08:23:00Z', severity:'medium' as const, system:'Guidance', description:'Star tracker calibration drift exceeding 0.02 arcsec', status:'investigating' as const },
    { id:'a2', missionId:'m2', timestamp:'2026-01-12T15:40:00Z', severity:'low' as const, system:'Thermal', description:'Panel temperature 3K above nominal during periapsis', status:'resolved' as const },
    { id:'a3', missionId:'m3', timestamp:'2026-01-13T22:10:00Z', severity:'high' as const, system:'Power', description:'Solar array efficiency drop on panel 3B', status:'open' as const },
    { id:'a4', missionId:'m5', timestamp:'2026-01-11T09:05:00Z', severity:'low' as const, system:'Comms', description:'Downlink bit error rate slightly elevated', status:'resolved' as const },
    { id:'a5', missionId:'m7', timestamp:'2026-01-10T19:30:00Z', severity:'critical' as const, system:'Propulsion', description:'RCS thruster B4 low efficiency firing', status:'investigating' as const },
  ];
  return { users, missions, telemetry, anomalies };
}
const g = globalThis as typeof globalThis & { __missionStore?: Store };
export const store = g.__missionStore ?? (g.__missionStore = initStore());
