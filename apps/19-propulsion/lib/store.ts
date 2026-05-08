import bcrypt from 'bcryptjs';
import type { Store } from './types';
function lcg(seed: number) { let s=seed>>>0; return ()=>{ s=(Math.imul(1664525,s)+1013904223)>>>0; return s/0x100000000; }; }
function initStore(): Store {
  const pw = bcrypt.hashSync('propulsion123', 10);
  const users = [
    { id:'u1', name:'goddard', role:'chief_propulsion', passwordHash: pw },
    { id:'u2', name:'vonbraun', role:'senior_engineer', passwordHash: pw },
    { id:'u3', name:'tsiol', role:'test_engineer', passwordHash: pw },
    { id:'u4', name:'oberth', role:'performance_eng', passwordHash: pw },
    { id:'u5', name:'rocketdyne', role:'materials', passwordHash: pw },
  ];
  const engines = [
    { id:'e1', designation:'Merlin 1D+', type:'Liquid', propellant:'RP-1/LOX', thrustKN:914, ispSL:282, ispVac:311, chamberPressureBar:97, throttleRange:'40-100%', status:'operational' as const },
    { id:'e2', designation:'Raptor 3', type:'Full-flow staged', propellant:'CH4/LOX', thrustKN:2300, ispSL:327, ispVac:380, chamberPressureBar:350, throttleRange:'40-106%', status:'operational' as const },
    { id:'e3', designation:'RS-25E', type:'Liquid', propellant:'LH2/LOX', thrustKN:2279, ispSL:366, ispVac:452, chamberPressureBar:206, throttleRange:'67-109%', status:'operational' as const },
    { id:'e4', designation:'RL-10C-3', type:'Liquid', propellant:'LH2/LOX', thrustKN:106, ispSL:0, ispVac:465, chamberPressureBar:46, throttleRange:'100%', status:'operational' as const },
    { id:'e5', designation:'BE-4', type:'Liquid', propellant:'CH4/LOX', thrustKN:2400, ispSL:310, ispVac:339, chamberPressureBar:134, throttleRange:'20-100%', status:'testing' as const },
    { id:'e6', designation:'Merlin Vacuum', type:'Liquid', propellant:'RP-1/LOX', thrustKN:934, ispSL:0, ispVac:348, chamberPressureBar:95, throttleRange:'39-100%', status:'operational' as const },
    { id:'e7', designation:'RD-180', type:'Liquid', propellant:'RP-1/LOX', thrustKN:4152, ispSL:311, ispVac:338, chamberPressureBar:267, throttleRange:'40-100%', status:'decommissioned' as const },
    { id:'e8', designation:'J-2X', type:'Liquid', propellant:'LH2/LOX', thrustKN:1307, ispSL:0, ispVac:448, chamberPressureBar:107, throttleRange:'80-100%', status:'testing' as const },
    { id:'e9', designation:'Kestrel', type:'Liquid', propellant:'RP-1/LOX', thrustKN:31, ispSL:0, ispVac:317, chamberPressureBar:14, throttleRange:'100%', status:'decommissioned' as const },
    { id:'e10', designation:'Draco RCS', type:'Biprop', propellant:'MMH/NTO', thrustKN:0.4, ispSL:0, ispVac:300, chamberPressureBar:9, throttleRange:'100%', status:'operational' as const },
  ];
  const rng = lcg(19001);
  const testRuns = [
    { id:'t1', engineId:'e2', date:'2026-01-10', duration:120, type:'hot-fire' as const, thrustAchievedKN:2280, result:'pass' as const, engineer:'vonbraun', notes:'Full-duration acceptance test — all params nominal' },
    { id:'t2', engineId:'e1', date:'2026-01-08', duration:170, type:'hot-fire' as const, thrustAchievedKN:910, result:'pass' as const, engineer:'tsiol', notes:'Flight-like test #14, regulator nominal' },
    { id:'t3', engineId:'e5', date:'2026-01-12', duration:90, type:'hot-fire' as const, thrustAchievedKN:2310, result:'pass' as const, engineer:'goddard', notes:'BE-4 milestone test – chamber pressure on target' },
    { id:'t4', engineId:'e8', date:'2026-01-06', duration:60, type:'ignition-test' as const, thrustAchievedKN:950, result:'partial' as const, engineer:'oberth', notes:'Ignition OK, throttle-down event at T+45s' },
    { id:'t5', engineId:'e3', date:'2025-12-20', duration:500, type:'hot-fire' as const, thrustAchievedKN:2270, result:'pass' as const, engineer:'vonbraun', notes:'Long-duration SLS qualification test' },
    { id:'t6', engineId:'e2', date:'2026-01-03', duration:20, type:'cold-flow' as const, thrustAchievedKN:0, result:'pass' as const, engineer:'tsiol', notes:'Propellant loading sequence validation' },
    { id:'t7', engineId:'e6', date:'2025-12-28', duration:155, type:'hot-fire' as const, thrustAchievedKN:930, result:'pass' as const, engineer:'rocketdyne', notes:'Second stage vacuum qualification' },
    { id:'t8', engineId:'e5', date:'2025-12-15', duration:30, type:'cold-flow' as const, thrustAchievedKN:0, result:'pass' as const, engineer:'goddard', notes:'BE-4 pre-test cold flow checkout' },
    { id:'t9', engineId:'e1', date:'2025-12-10', duration:170, type:'hot-fire' as const, thrustAchievedKN:890, result:'partial' as const, engineer:'oberth', notes:'Minor thrust shortfall – injector investigation' },
    { id:'t10', engineId:'e4', date:'2025-11-30', duration:480, type:'hot-fire' as const, thrustAchievedKN:105, result:'pass' as const, engineer:'vonbraun', notes:'RL-10 restartability test – 5 ignitions' },
    { id:'t11', engineId:'e2', date:'2025-11-20', duration:6, type:'ignition-test' as const, thrustAchievedKN:2100, result:'pass' as const, engineer:'tsiol', notes:'Raptor 3 ignition confidence test' },
    { id:'t12', engineId:'e3', date:'2025-11-10', duration:250, type:'hot-fire' as const, thrustAchievedKN:2200, result:'pass' as const, engineer:'rocketdyne', notes:'RS-25 gimbal response test' },
    { id:'t13', engineId:'e1', date:'2025-10-30', duration:170, type:'hot-fire' as const, thrustAchievedKN:912, result:'pass' as const, engineer:'tsiol', notes:'Batch acceptance test – unit 28' },
    { id:'t14', engineId:'e8', date:'2025-10-15', duration:40, type:'ignition-test' as const, thrustAchievedKN:1100, result:'fail' as const, engineer:'goddard', notes:'Turbopump anomaly – shutdown triggered at T+38s' },
    { id:'t15', engineId:'e6', date:'2025-10-01', duration:160, type:'hot-fire' as const, thrustAchievedKN:935, result:'pass' as const, engineer:'vonbraun', notes:'MVac sustained burn, nominal expander cycle' },
    { id:'t16', engineId:'e5', date:'2025-09-20', duration:60, type:'hot-fire' as const, thrustAchievedKN:2350, result:'pass' as const, engineer:'goddard', notes:'BE-4 max thrust demonstration' },
    { id:'t17', engineId:'e3', date:'2025-09-05', duration:500, type:'hot-fire' as const, thrustAchievedKN:2279, result:'pass' as const, engineer:'rocketdyne', notes:'Full qualification – flight cert complete' },
    { id:'t18', engineId:'e2', date:'2025-08-15', duration:3, type:'ignition-test' as const, thrustAchievedKN:2280, result:'pass' as const, engineer:'tsiol', notes:'Raptor 3 first ignition – milestone achieved' },
  ];
  const rng2 = lcg(19002);
  const components = [
    { id:'c1', engineId:'e1', name:'Turbopump Assembly', partNumber:'ML1D-TP-004', material:'Inconel 718', quantity:24, status:'flight-ready', supplier:'Barber-Nichols' },
    { id:'c2', engineId:'e1', name:'Main Injector', partNumber:'ML1D-INJ-007', material:'Copper alloy', quantity:24, status:'flight-ready', supplier:'SpaceX' },
    { id:'c3', engineId:'e2', name:'Preburner LOX', partNumber:'R3-PB-LOX-002', material:'Nickel superalloy', quantity:6, status:'testing', supplier:'SpaceX' },
    { id:'c4', engineId:'e2', name:'Main Chamber', partNumber:'R3-MC-001', material:'SX34 alloy', quantity:6, status:'flight-ready', supplier:'SpaceX' },
    { id:'c5', engineId:'e3', name:'High-Pressure Turbopump', partNumber:'RS25E-HPFTP-A', material:'Ti-6Al-4V', quantity:4, status:'flight-ready', supplier:'Aerojet' },
    { id:'c6', engineId:'e3', name:'Nozzle Extension', partNumber:'RS25E-NE-SIC', material:'Carbon-carbon', quantity:4, status:'flight-ready', supplier:'Aerojet' },
    { id:'c7', engineId:'e5', name:'Injector Head', partNumber:'BE4-IH-003', material:'GRCop-84', quantity:8, status:'testing', supplier:'Blue Origin' },
    { id:'c8', engineId:'e6', name:'MVac Nozzle', partNumber:'MVAC-NZ-012', material:'Niobium alloy', quantity:12, status:'flight-ready', supplier:'SpaceX' },
    { id:'c9', engineId:'e4', name:'Extendable Nozzle', partNumber:'RL10C3-EN-007', material:'Carbon composite', quantity:6, status:'flight-ready', supplier:'Aerojet' },
    { id:'c10', engineId:'e10', name:'Draco Valve', partNumber:'DRV-001', material:'Titanium', quantity:48, status:'flight-ready', supplier:'Moog' },
  ];
  return { users, engines, testRuns, components };
}
const g = globalThis as typeof globalThis & { __propulsionStore?: Store };
export const store = g.__propulsionStore ?? (g.__propulsionStore = initStore());
