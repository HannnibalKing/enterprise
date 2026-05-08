import bcrypt from 'bcryptjs';
import type { Store } from './types';
function lcg(seed: number) { let s=seed>>>0; return ()=>{ s=(Math.imul(1664525,s)+1013904223)>>>0; return s/0x100000000; }; }
function initStore(): Store {
  const pw = bcrypt.hashSync('payload123', 10);
  const users = [
    { id:'u1', name:'cargo', role:'payload_manager', passwordHash: pw },
    { id:'u2', name:'atlas', role:'integration_lead', passwordHash: pw },
    { id:'u3', name:'titan', role:'processing_eng', passwordHash: pw },
    { id:'u4', name:'delta', role:'manifest_lead', passwordHash: pw },
    { id:'u5', name:'centaur', role:'systems_eng', passwordHash: pw },
  ];
  const payloads = [
    { id:'p1', name:'GOES-U', customer:'NOAA', type:'government' as const, massKg:5765, status:'integration', targetOrbit:'GTO', launchId:'l1', integrationComplete:false, hazardClass:'Class 3' },
    { id:'p2', name:'GPS III-8', customer:'USSF', type:'defense' as const, massKg:4311, status:'processing', targetOrbit:'MEO 20200km', launchId:null, integrationComplete:false, hazardClass:'Class 2' },
    { id:'p3', name:'Starlink-10 Batch', customer:'SpaceX', type:'commercial' as const, massKg:15600, status:'encapsulated', targetOrbit:'LEO 550km', launchId:'l2', integrationComplete:true, hazardClass:'Class 1' },
    { id:'p4', name:'Europa Clipper', customer:'NASA JPL', type:'scientific' as const, massKg:6065, status:'testing', targetOrbit:'Heliocentric', launchId:null, integrationComplete:false, hazardClass:'Class 1' },
    { id:'p5', name:'AEHF-8', customer:'USSF', type:'defense' as const, massKg:6800, status:'processing', targetOrbit:'GEO', launchId:null, integrationComplete:false, hazardClass:'Class 3' },
    { id:'p6', name:'OneWeb-19 Batch', customer:'OneWeb', type:'commercial' as const, massKg:5900, status:'encapsulated', targetOrbit:'LEO 1200km', launchId:'l3', integrationComplete:true, hazardClass:'Class 1' },
    { id:'p7', name:'NISAR', customer:'NASA/ISRO', type:'scientific' as const, massKg:2800, status:'testing', targetOrbit:'SSO 740km', launchId:null, integrationComplete:false, hazardClass:'Class 1' },
    { id:'p8', name:'SES-26', customer:'SES', type:'commercial' as const, massKg:5500, status:'ready', targetOrbit:'GEO', launchId:'l4', integrationComplete:true, hazardClass:'Class 2' },
    { id:'p9', name:'DART-3', customer:'NASA', type:'scientific' as const, massKg:610, status:'processing', targetOrbit:'Heliocentric', launchId:null, integrationComplete:false, hazardClass:'Class 1' },
    { id:'p10', name:'Inmarsat-8', customer:'Inmarsat', type:'commercial' as const, massKg:4100, status:'integration', targetOrbit:'GEO', launchId:null, integrationComplete:false, hazardClass:'Class 2' },
    { id:'p11', name:'XMM-Newton-2', customer:'ESA', type:'scientific' as const, massKg:3800, status:'processing', targetOrbit:'HEO', launchId:null, integrationComplete:false, hazardClass:'Class 1' },
    { id:'p12', name:'CRS-31', customer:'NASA', type:'government' as const, massKg:3000, status:'ready', targetOrbit:'ISS', launchId:'l5', integrationComplete:true, hazardClass:'Class 2' },
    { id:'p13', name:'ViaSat-4', customer:'ViaSat', type:'commercial' as const, massKg:6700, status:'testing', targetOrbit:'GEO', launchId:null, integrationComplete:false, hazardClass:'Class 2' },
    { id:'p14', name:'JPSS-3', customer:'NOAA', type:'government' as const, massKg:2200, status:'processing', targetOrbit:'SSO 824km', launchId:null, integrationComplete:false, hazardClass:'Class 1' },
  ];
  const rng = lcg(20001);
  const manifests = [
    { id:'mf1', vehicleId:'Falcon 9 B1062', launchDate:'2026-02-14', payloadIds:['p3'], totalMassKg:15600, status:'confirmed', orbit:'LEO 550km', customer:'SpaceX' },
    { id:'mf2', vehicleId:'Falcon Heavy B1079', launchDate:'2026-02-28', payloadIds:['p1'], totalMassKg:5765, status:'confirmed', orbit:'GTO', customer:'NOAA' },
    { id:'mf3', vehicleId:'Falcon 9 B1073', launchDate:'2026-03-10', payloadIds:['p6'], totalMassKg:5900, status:'planning', orbit:'LEO 1200km', customer:'OneWeb' },
    { id:'mf4', vehicleId:'Falcon 9 B1065', launchDate:'2026-03-25', payloadIds:['p8'], totalMassKg:5500, status:'confirmed', orbit:'GEO', customer:'SES' },
    { id:'mf5', vehicleId:'Falcon 9 B1071', launchDate:'2026-04-10', payloadIds:['p12'], totalMassKg:3000, status:'confirmed', orbit:'ISS', customer:'NASA' },
  ];
  const milestones = [
    { id:'ms1', payloadId:'p1', milestone:'Pre-ship review', plannedDate:'2026-01-20', completedDate:'2026-01-20', status:'complete' as const },
    { id:'ms2', payloadId:'p1', milestone:'Arrival at launch site', plannedDate:'2026-01-25', completedDate:'2026-01-25', status:'complete' as const },
    { id:'ms3', payloadId:'p1', milestone:'Mechanical integration', plannedDate:'2026-02-05', completedDate:null, status:'in-progress' as const },
    { id:'ms4', payloadId:'p1', milestone:'Electrical checkouts', plannedDate:'2026-02-10', completedDate:null, status:'pending' as const },
    { id:'ms5', payloadId:'p3', milestone:'Fairing encapsulation', plannedDate:'2026-02-07', completedDate:'2026-02-07', status:'complete' as const },
    { id:'ms6', payloadId:'p3', milestone:'Payload mate to vehicle', plannedDate:'2026-02-12', completedDate:null, status:'in-progress' as const },
    { id:'ms7', payloadId:'p8', milestone:'Customer acceptance test', plannedDate:'2026-02-20', completedDate:'2026-02-20', status:'complete' as const },
    { id:'ms8', payloadId:'p8', milestone:'Launch site transport', plannedDate:'2026-03-01', completedDate:null, status:'pending' as const },
    { id:'ms9', payloadId:'p4', milestone:'Thermal vacuum test', plannedDate:'2026-02-01', completedDate:null, status:'delayed' as const },
    { id:'ms10', payloadId:'p4', milestone:'EMI/EMC test', plannedDate:'2026-01-15', completedDate:null, status:'delayed' as const },
    { id:'ms11', payloadId:'p2', milestone:'Security review', plannedDate:'2026-01-10', completedDate:'2026-01-10', status:'complete' as const },
    { id:'ms12', payloadId:'p12', milestone:'Dragon cargo loading', plannedDate:'2026-03-30', completedDate:null, status:'pending' as const },
  ];
  return { users, payloads, manifests, milestones };
}
const g = globalThis as typeof globalThis & { __payloadStore?: Store };
export const store = g.__payloadStore ?? (g.__payloadStore = initStore());
