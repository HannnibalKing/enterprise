import bcrypt from 'bcryptjs';
import type { Store } from './types';
function lcg(seed: number) { let s=seed>>>0; return ()=>{ s=(Math.imul(1664525,s)+1013904223)>>>0; return s/0x100000000; }; }
function initStore(): Store {
  const pw = bcrypt.hashSync('launch123', 10);
  const users = [
    { id:'u1', name:'commander', role:'launch_director', passwordHash: pw },
    { id:'u2', name:'merlin', role:'engine_chief', passwordHash: pw },
    { id:'u3', name:'raptor', role:'range_safety', passwordHash: pw },
    { id:'u4', name:'dragon', role:'mission_lead', passwordHash: pw },
    { id:'u5', name:'fairing', role:'pad_ops', passwordHash: pw },
  ];
  const rng = lcg(15001);
  const launches = [
    { id:'l1', vehicle:'Falcon 9 B1062', payload:'Starlink-9-1', site:'SLC-40', scheduledDate:'2026-02-14T18:30:00Z', status:'upcoming' as const, customer:'SpaceX', orbit:'LEO 550km', massKg:15600 },
    { id:'l2', vehicle:'Falcon Heavy B1079', payload:'GOES-U', site:'LC-39A', scheduledDate:'2026-02-28T21:15:00Z', status:'upcoming' as const, customer:'NOAA', orbit:'GTO', massKg:5765 },
    { id:'l3', vehicle:'Falcon 9 B1058', payload:'GPS III-7', site:'SLC-40', scheduledDate:'2026-01-10T14:00:00Z', status:'success' as const, customer:'USSF', orbit:'MEO 20200km', massKg:4311 },
    { id:'l4', vehicle:'Starship SN25', payload:'Starship Demo-3', site:'Boca Chica', scheduledDate:'2026-03-20T12:00:00Z', status:'upcoming' as const, customer:'SpaceX', orbit:'Suborbital', massKg:0 },
    { id:'l5', vehicle:'Falcon 9 B1073', payload:'SES-22', site:'LC-39A', scheduledDate:'2026-01-05T08:30:00Z', status:'success' as const, customer:'SES', orbit:'GEO', massKg:5300 },
    { id:'l6', vehicle:'Falcon 9 B1067', payload:'CRS-30', site:'SLC-40', scheduledDate:'2026-01-20T16:45:00Z', status:'hold' as const, customer:'NASA', orbit:'ISS', massKg:3000 },
    { id:'l7', vehicle:'Falcon Heavy B1081', payload:'NASA Psyche', site:'LC-39A', scheduledDate:'2026-04-05T10:00:00Z', status:'upcoming' as const, customer:'NASA', orbit:'Heliocentric', massKg:2608 },
    { id:'l8', vehicle:'Falcon 9 B1060', payload:'Telesat LEO-3', site:'SLC-40', scheduledDate:'2026-01-02T22:00:00Z', status:'success' as const, customer:'Telesat', orbit:'LEO 1015km', massKg:4400 },
    { id:'l9', vehicle:'Falcon 9 B1071', payload:'iridiumNEXT-11', site:'VLS-3W', scheduledDate:'2025-12-15T09:25:00Z', status:'success' as const, customer:'Iridium', orbit:'LEO 780km', massKg:12800 },
    { id:'l10', vehicle:'Falcon 9 B1063', payload:'Starlink-10-1', site:'SLC-40', scheduledDate:'2026-02-08T04:30:00Z', status:'upcoming' as const, customer:'SpaceX', orbit:'LEO 550km', massKg:15600 },
    { id:'l11', vehicle:'Falcon Heavy B1077', payload:'AEHF-7', site:'LC-39A', scheduledDate:'2025-11-30T19:00:00Z', status:'success' as const, customer:'USSF', orbit:'GEO', massKg:6800 },
    { id:'l12', vehicle:'Falcon 9 B1076', payload:'OneWeb-18', site:'VLS-3W', scheduledDate:'2026-03-10T06:15:00Z', status:'upcoming' as const, customer:'OneWeb', orbit:'LEO 1200km', massKg:5900 },
  ];
  const vehicles = [
    { id:'v1', name:'Falcon 9 B1062', type:'Falcon 9', flightCount:14, status:'nominal', lastLanding:'ASDS JRTI', cores:1, height:70, thrust:7607 },
    { id:'v2', name:'Falcon 9 B1058', type:'Falcon 9', flightCount:19, status:'refurbishment', lastLanding:'ASDS OCISLY', cores:1, height:70, thrust:7607 },
    { id:'v3', name:'Falcon Heavy B1079', type:'Falcon Heavy', flightCount:4, status:'nominal', lastLanding:'LZ-1 LZ-2', cores:3, height:70, thrust:22819 },
    { id:'v4', name:'Starship SN25', type:'Starship', flightCount:2, status:'testing', lastLanding:'Boca Chica', cores:1, height:121, thrust:74000 },
    { id:'v5', name:'Falcon 9 B1073', type:'Falcon 9', flightCount:8, status:'nominal', lastLanding:'ASDS OCISLY', cores:1, height:70, thrust:7607 },
    { id:'v6', name:'Falcon Heavy B1081', type:'Falcon Heavy', flightCount:2, status:'integration', lastLanding:'LZ-1 LZ-2', cores:3, height:70, thrust:22819 },
  ];
  const countdowns = [
    { launchId:'l1', t0:'2026-02-14T18:30:00Z', holds:0, currentEvent:'T-24h LOX pre-load', nextMilestone:'T-3h Propellant load' },
    { launchId:'l2', t0:'2026-02-28T21:15:00Z', holds:1, currentEvent:'T-72h Vehicle inspection', nextMilestone:'T-24h Range clear' },
    { launchId:'l6', t0:'2026-01-20T16:45:00Z', holds:2, currentEvent:'HOLD – weather evaluation', nextMilestone:'TBD Resume ops' },
  ];
  return { users, launches, vehicles, countdowns };
}
const g = globalThis as typeof globalThis & { __launchStore?: Store };
export const store = g.__launchStore ?? (g.__launchStore = initStore());
