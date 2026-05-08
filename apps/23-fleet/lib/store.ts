import bcrypt from 'bcryptjs';
import type { Store } from './types';
function lcg(seed: number) { let s=seed>>>0; return ()=>{ s=(Math.imul(1664525,s)+1013904223)>>>0; return s/0x100000000; }; }
function initStore(): Store {
  const pw = bcrypt.hashSync('fleet123', 10);
  const users = [
    { id:'u1', name:'fleet', role:'fleet_commander', passwordHash: pw },
    { id:'u2', name:'hangar', role:'hangar_chief', passwordHash: pw },
    { id:'u3', name:'avionics', role:'avionics_lead', passwordHash: pw },
    { id:'u4', name:'recovery', role:'recovery_lead', passwordHash: pw },
    { id:'u5', name:'turnaround', role:'ops_director', passwordHash: pw },
  ];
  const rng = lcg(23001);
  const vehicles = [
    { id:'v1', name:'Falcon 9 B1058', type:'Falcon 9' as const, serialNumber:'B1058.19', flightCount:19, status:'operational', location:'SLC-40 Launch Pad', nextLaunch:'2026-02-14', readinessScore:98 },
    { id:'v2', name:'Falcon 9 B1060', type:'Falcon 9' as const, serialNumber:'B1060.17', flightCount:17, status:'refurbishment', location:'Hangar 3', nextLaunch:null, readinessScore:72 },
    { id:'v3', name:'Falcon 9 B1062', type:'Falcon 9' as const, serialNumber:'B1062.14', flightCount:14, status:'operational', location:'Horizontal Integration Facility', nextLaunch:'2026-02-28', readinessScore:95 },
    { id:'v4', name:'Falcon 9 B1067', type:'Falcon 9' as const, serialNumber:'B1067.11', flightCount:11, status:'inspection', location:'Hangar 1', nextLaunch:null, readinessScore:85 },
    { id:'v5', name:'Falcon 9 B1073', type:'Falcon 9' as const, serialNumber:'B1073.8', flightCount:8, status:'operational', location:'HIF Bay 2', nextLaunch:'2026-03-10', readinessScore:99 },
    { id:'v6', name:'Falcon Heavy B1079', type:'Falcon Heavy' as const, serialNumber:'B1079C.4', flightCount:4, status:'operational', location:'LC-39A', nextLaunch:'2026-02-28', readinessScore:97 },
    { id:'v7', name:'Falcon Heavy B1081', type:'Falcon Heavy' as const, serialNumber:'B1081C.2', flightCount:2, status:'integration', location:'HIF Bay 1', nextLaunch:'2026-04-05', readinessScore:88 },
    { id:'v8', name:'Starship SN25', type:'Starship' as const, serialNumber:'SN25', flightCount:2, status:'testing', location:'Boca Chica Pad A', nextLaunch:'2026-03-20', readinessScore:65 },
  ];
  const launches = [
    { id:'l1', vehicleId:'v1', date:'2026-01-10', payload:'GPS III-7', orbit:'MEO 20200km', outcome:'success' as const, landingOutcome:'ASDS OCISLY', customer:'USSF', site:'SLC-40' },
    { id:'l2', vehicleId:'v5', date:'2026-01-02', payload:'Telesat LEO-3', orbit:'LEO 1015km', outcome:'success' as const, landingOutcome:'LZ-1', customer:'Telesat', site:'SLC-40' },
    { id:'l3', vehicleId:'v3', date:'2025-12-18', payload:'Starlink-9-7', orbit:'LEO 550km', outcome:'success' as const, landingOutcome:'ASDS JRTI', customer:'SpaceX', site:'SLC-40' },
    { id:'l4', vehicleId:'v6', date:'2025-11-30', payload:'AEHF-7', orbit:'GEO', outcome:'success' as const, landingOutcome:'LZ-1 LZ-2', customer:'USSF', site:'LC-39A' },
    { id:'l5', vehicleId:'v2', date:'2025-11-15', payload:'CRS-29', orbit:'ISS', outcome:'success' as const, landingOutcome:'ASDS OCISLY', customer:'NASA', site:'LC-39A' },
    { id:'l6', vehicleId:'v4', date:'2025-10-28', payload:'SES-22', orbit:'GEO', outcome:'success' as const, landingOutcome:'ASDS JRTI', customer:'SES', site:'SLC-40' },
    { id:'l7', vehicleId:'v1', date:'2025-10-05', payload:'Starlink-8-9', orbit:'LEO 550km', outcome:'success' as const, landingOutcome:'ASDS OCISLY', customer:'SpaceX', site:'SLC-40' },
    { id:'l8', vehicleId:'v8', date:'2025-09-20', payload:'Starship Demo-2', orbit:'Suborbital', outcome:'success' as const, landingOutcome:'Boca Chica', customer:'SpaceX', site:'Boca Chica' },
    { id:'l9', vehicleId:'v5', date:'2025-09-01', payload:'Starlink-8-1', orbit:'LEO 550km', outcome:'success' as const, landingOutcome:'LZ-1', customer:'SpaceX', site:'SLC-40' },
    { id:'l10', vehicleId:'v7', date:'2025-08-10', payload:'NASA SLS Demo', orbit:'TLI', outcome:'success' as const, landingOutcome:'LZ-1 LZ-2', customer:'NASA', site:'LC-39A' },
    { id:'l11', vehicleId:'v3', date:'2025-07-22', payload:'iridiumNEXT-10', orbit:'LEO 780km', outcome:'success' as const, landingOutcome:'ASDS JRTI', customer:'Iridium', site:'VLS-3W' },
    { id:'l12', vehicleId:'v2', date:'2025-06-30', payload:'OneWeb-17', orbit:'LEO 1200km', outcome:'success' as const, landingOutcome:'ASDS OCISLY', customer:'OneWeb', site:'SLC-40' },
    { id:'l13', vehicleId:'v4', date:'2025-06-01', payload:'Starlink-7-8', orbit:'LEO 550km', outcome:'success' as const, landingOutcome:'ASDS JRTI', customer:'SpaceX', site:'SLC-40' },
    { id:'l14', vehicleId:'v6', date:'2025-05-10', payload:'Maxar SSL-1', orbit:'GEO', outcome:'success' as const, landingOutcome:'LZ-1 LZ-2', customer:'Maxar', site:'LC-39A' },
    { id:'l15', vehicleId:'v1', date:'2025-04-15', payload:'GPS III-6', orbit:'MEO 20200km', outcome:'success' as const, landingOutcome:'ASDS OCISLY', customer:'USSF', site:'SLC-40' },
    { id:'l16', vehicleId:'v5', date:'2025-03-28', payload:'Starlink-6-10', orbit:'LEO 550km', outcome:'success' as const, landingOutcome:'LZ-1', customer:'SpaceX', site:'SLC-40' },
    { id:'l17', vehicleId:'v3', date:'2025-02-20', payload:'GOES-T', orbit:'GTO', outcome:'success' as const, landingOutcome:'ASDS JRTI', customer:'NOAA', site:'SLC-40' },
    { id:'l18', vehicleId:'v8', date:'2024-11-18', payload:'Starship Demo-1', orbit:'Suborbital', outcome:'partial' as const, landingOutcome:'Splashdown – recovery', customer:'SpaceX', site:'Boca Chica' },
    { id:'l19', vehicleId:'v2', date:'2024-09-05', payload:'Crew-9', orbit:'ISS', outcome:'success' as const, landingOutcome:'ASDS OCISLY', customer:'NASA', site:'LC-39A' },
    { id:'l20', vehicleId:'v1', date:'2024-07-12', payload:'Inmarsat-7', orbit:'GEO', outcome:'success' as const, landingOutcome:'ASDS OCISLY', customer:'Inmarsat', site:'SLC-40' },
  ];
  const rng2 = lcg(23002);
  const taskNames = ['Engine inspection post-flight','Avionics harness check','Grid fin actuator test','Propellant system purge','Heat shield tiles inspection','Landing leg retraction check','Battery replacement','OMS thruster alignment'];
  const maintenance = Array.from({length:16},(_,i)=>{
    const done = rng2()>0.4;
    return {
      id:`m${i+1}`, vehicleId:`v${(i%8)+1}`, task:taskNames[i%taskNames.length],
      type:i%2===0?'Scheduled':'Corrective',
      scheduledDate:`2026-01-${String(Math.floor(rng2()*14)+1).padStart(2,'0')}`,
      completedDate:done?`2026-01-${String(Math.floor(rng2()*14)+1).padStart(2,'0')}`:null,
      technician:['Torres','Chen','Vasquez','Kim','Patel'][i%5],
      status:done?'complete':rng2()<0.2?'in-progress':rng2()<0.1?'overdue':'scheduled' as 'scheduled'|'in-progress'|'complete'|'overdue',
    };
  });
  return { users, vehicles, launches, maintenance };
}
const g = globalThis as typeof globalThis & { __fleetStore?: Store };
export const store = g.__fleetStore ?? (g.__fleetStore = initStore());
