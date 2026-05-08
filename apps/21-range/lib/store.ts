import bcrypt from 'bcryptjs';
import type { Store } from './types';
function lcg(seed: number) { let s=seed>>>0; return ()=>{ s=(Math.imul(1664525,s)+1013904223)>>>0; return s/0x100000000; }; }
function initStore(): Store {
  const pw = bcrypt.hashSync('range123', 10);
  const users = [
    { id:'u1', name:'rso', role:'range_safety_officer', passwordHash: pw },
    { id:'u2', name:'hazmat', role:'hazard_officer', passwordHash: pw },
    { id:'u3', name:'weather', role:'meteorologist', passwordHash: pw },
    { id:'u4', name:'radar', role:'radar_operator', passwordHash: pw },
    { id:'u5', name:'dispatcher', role:'range_controller', passwordHash: pw },
  ];
  const hazards = [
    { id:'hz1', name:'LOX Storage Zone A', type:'Cryogenic', radiusKm:1.2, status:'active' as const, activatedAt:'2026-01-10T06:00:00Z', clearanceRequired:'RSO + Hazmat' },
    { id:'hz2', name:'Flight Azimuth Corridor', type:'Flight Path', radiusKm:15.0, status:'active' as const, activatedAt:'2026-01-14T04:00:00Z', clearanceRequired:'RSO' },
    { id:'hz3', name:'RP-1 Fuel Farm', type:'Flammable Liquid', radiusKm:0.8, status:'active' as const, activatedAt:'2026-01-10T06:00:00Z', clearanceRequired:'RSO + Hazmat' },
    { id:'hz4', name:'Debris Impact Zone B', type:'Debris', radiusKm:50.0, status:'cleared' as const, activatedAt:'2026-01-13T12:00:00Z', clearanceRequired:'RSO + USCG' },
    { id:'hz5', name:'Lightning Protection Arc', type:'Electrical', radiusKm:3.0, status:'pending' as const, activatedAt:'2026-01-14T09:30:00Z', clearanceRequired:'Weather Officer' },
    { id:'hz6', name:'Toxic Gas Exclusion', type:'Chemical', radiusKm:0.5, status:'cleared' as const, activatedAt:'2026-01-12T08:00:00Z', clearanceRequired:'Hazmat' },
    { id:'hz7', name:'Maritime Exclusion Zone', type:'Naval', radiusKm:120.0, status:'active' as const, activatedAt:'2026-01-13T00:00:00Z', clearanceRequired:'USCG + RSO' },
  ];
  const clearances = [
    { id:'cl1', zoneId:'hz4', authority:'USCG Sector Jacksonville', issuedAt:'2026-01-13T14:00:00Z', expiresAt:'2026-01-15T14:00:00Z', status:'granted' as const, conditions:'Vessel exclusion confirmed – AIS monitoring active' },
    { id:'cl2', zoneId:'hz6', authority:'AFSC Hazmat Officer', issuedAt:'2026-01-12T10:00:00Z', expiresAt:'2026-01-14T20:00:00Z', status:'granted' as const, conditions:'Air quality nominal – CH4 below 5 ppm' },
    { id:'cl3', zoneId:'hz2', authority:'RSO', issuedAt:'2026-01-14T04:30:00Z', expiresAt:'2026-01-14T22:00:00Z', status:'granted' as const, conditions:'Aircraft NOTAMs filed – airspace clear' },
    { id:'cl4', zoneId:'hz5', authority:'45th Weather Squadron', issuedAt:'', expiresAt:'', status:'pending' as const, conditions:'Awaiting lightning discharge confirmation' },
    { id:'cl5', zoneId:'hz7', authority:'USCG District 7', issuedAt:'2026-01-13T02:00:00Z', expiresAt:'2026-01-15T06:00:00Z', status:'granted' as const, conditions:'Maritime patrol on station' },
  ];
  const rng = lcg(21001);
  const forecasts = ['Clear – GO','Partly cloudy – GO','Thunderstorm risk – NO-GO','Overcast – MARGINAL','Clear – GO','Partly cloudy – GO','Clear – GO'];
  const weather = Array.from({length:7},(_,i)=>{
    const d = new Date('2026-01-14');
    d.setDate(d.getDate()+i);
    const wind = Math.floor(rng()*20+5);
    const go = wind<18 && i!==2;
    return {
      id:`w${i+1}`, date:d.toISOString().split('T')[0], windSpeedKnots:wind,
      windDir:Math.floor(rng()*360), visibilityNm:Math.floor(rng()*8+2),
      cloudCeilingFt:Math.floor(rng()*5000+1000), lightning:i===2,
      launchGo:go, forecast:forecasts[i],
    };
  });
  const incidents = [
    { id:'in1', date:'2026-01-13T15:20:00Z', severity:'minor' as const, system:'LOX Vent', description:'Unexpected LOX vent during pre-load ops – contained', status:'closed' as const },
    { id:'in2', date:'2026-01-12T09:45:00Z', severity:'moderate' as const, system:'Power', description:'Pad power interruption – UPS activated, 4min outage', status:'closed' as const },
    { id:'in3', date:'2026-01-10T17:30:00Z', severity:'minor' as const, system:'Communications', description:'UHF radio link degraded between RSO and pad', status:'closed' as const },
    { id:'in4', date:'2026-01-14T07:15:00Z', severity:'minor' as const, system:'Weather', description:'Lightning within 5nm – operations suspended 40 min', status:'open' as const },
    { id:'in5', date:'2025-12-20T11:00:00Z', severity:'major' as const, system:'Propellant', description:'RP-1 spill at pump station – HAZMAT response activated', status:'closed' as const },
  ];
  return { users, hazards, clearances, weather, incidents };
}
const g = globalThis as typeof globalThis & { __rangeStore?: Store };
export const store = g.__rangeStore ?? (g.__rangeStore = initStore());
