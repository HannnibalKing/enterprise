import bcrypt from 'bcryptjs';
import type { MfgUser, ProductionLine, Equipment, ProductionOrder, QualityCheck, Material, ProductionSnapshot } from './types';

function lcg(seed: number) {
  let s = seed >>> 0;
  return () => { s = (Math.imul(1664525, s) + 1013904223) >>> 0; return s / 0x100000000; };
}

const users: MfgUser[] = [
  { id:'u1', name:'Victor Okafor',    email:'victor@forgemax.com',  role:'plant_director',       passwordHash: bcrypt.hashSync('forge123',10) },
  { id:'u2', name:'Sophie Laurent',   email:'sophie@forgemax.com',  role:'production_manager',   passwordHash: bcrypt.hashSync('forge123',10) },
  { id:'u3', name:'Leo Matsumoto',    email:'leo@forgemax.com',     role:'quality_engineer',     passwordHash: bcrypt.hashSync('forge123',10) },
  { id:'u4', name:'Ravi Patel',       email:'ravi@forgemax.com',    role:'maintenance_engineer', passwordHash: bcrypt.hashSync('forge123',10) },
  { id:'u5', name:'Chloe Dubois',     email:'chloe@forgemax.com',   role:'materials_planner',    passwordHash: bcrypt.hashSync('forge123',10) },
];

const LINE_STATUSES: ProductionLine['status'][] = ['running','running','running','running','maintenance','idle','changeover','fault'];
const PRODUCTS = ['Precision Shaft Assembly','Hydraulic Valve Body','Turbine Blade Set','Gear Housing Unit','Bearing Cartridge','Actuator Rod','Control Module','Drive Shaft'];
const pRand = lcg(11);
const productionLines: ProductionLine[] = Array.from({length:8}, (_,i) => {
  const target = 80+Math.round(pRand()*120);
  const oee = 0.6+pRand()*0.35;
  const avail = 0.8+pRand()*0.18;
  const perf = 0.75+pRand()*0.2;
  const qual = 0.9+pRand()*0.09;
  const actual = Math.round(target*oee);
  return {
    id: `line${i+1}`, name: `Line ${String.fromCharCode(65+i)}`,
    product: PRODUCTS[i], status: LINE_STATUSES[i],
    targetUnitsPerHour: target, actualUnitsPerHour: actual,
    oee: Math.round(oee*1000)/10,
    availability: Math.round(avail*1000)/10,
    performance: Math.round(perf*1000)/10,
    quality: Math.round(qual*1000)/10,
    shiftUnitsTarget: target*8, shiftUnitsActual: Math.round(target*8*oee),
    currentOperator: ['T. Williams','J. Kim','R. Gonzalez','A. Patel','L. Nguyen','S. Brown','M. Chen','O. Jackson'][i],
    supervisor: i<4?'Sophie Laurent':'Victor Okafor',
    downtimeMinutesToday: Math.round(pRand()*45),
    lastDowntime: i%3===0?`2026-05-07T0${6+i}:30:00`:undefined,
  };
});

const EQ_TYPES = ['CNC Mill','Hydraulic Press','Injection Molder','Robotic Welder','Lathe','Assembly Robot','Conveyor','Inspection System'];
const MODELS = ['Haas VF-4','Enerpac H-Series','KraussMaffei KX','Fanuc R-2000','Mazak Integrex','KUKA KR 150','Hytrol E24','Cognex In-Sight'];
const eqRand = lcg(22);
const equipment: Equipment[] = productionLines.flatMap((line, li) =>
  Array.from({length:2}, (_,ei) => {
    const idx = li*2+ei;
    const runHours = 2000+Math.round(eqRand()*8000);
    const nextPMDays = -10+Math.round(eqRand()*60);
    return {
      id: `eq${idx+1}`, name: `${EQ_TYPES[idx%EQ_TYPES.length]} ${idx+1}`,
      type: EQ_TYPES[idx%EQ_TYPES.length],
      lineId: line.id, lineName: line.name,
      status: (idx%7===0?'offline':idx%5===0?'degraded':'operational') as Equipment['status'],
      model: MODELS[idx%MODELS.length],
      serialNo: `SN-${100000+idx*1337}`,
      installDate: `${2018+Math.floor(eqRand()*6)}-${String(1+Math.floor(eqRand()*12)).padStart(2,'0')}-01`,
      lastPMDate: `2026-${String(1+Math.floor(eqRand()*4)).padStart(2,'0')}-15`,
      nextPMDate: nextPMDays > 0 ? `2026-${String(5+Math.ceil(nextPMDays/30)).padStart(2,'0')}-01` : '2026-04-15',
      totalRunHours: runHours,
      mtbf: 200+Math.round(eqRand()*600),
      mttr: 2+Math.round(eqRand()*8),
      alerts: idx%5===0?['Vibration threshold exceeded']:idx%7===0?['Offline — awaiting parts']:[],
      criticalSpares: idx%4===0,
    };
  })
);

const woRand = lcg(33);
const productionOrders: ProductionOrder[] = Array.from({length:18}, (_,i) => {
  const line = productionLines[i%productionLines.length];
  const qty = 200+Math.round(woRand()*800);
  const produced = Math.round(qty*(0.7+woRand()*0.3));
  const scrap = Math.round(produced*woRand()*0.03);
  const statuses: ProductionOrder['status'][] = ['in_progress','in_progress','scheduled','complete','on_hold'];
  return {
    id: `po${i+1}`, orderNo: `WO-2026-${String(1000+i).padStart(5,'0')}`,
    product: line.product, sku: `SKU-${String(10000+i*37).padStart(6,'0')}`,
    lineId: line.id, lineName: line.name,
    quantityOrdered: qty, quantityProduced: produced, quantityScrap: scrap,
    status: statuses[i%statuses.length],
    scheduledStart: `2026-05-${String(1+i%6).padStart(2,'0')}T06:00:00`,
    scheduledEnd: `2026-05-${String(3+i%5).padStart(2,'0')}T18:00:00`,
    actualStart: i%5!==4?`2026-05-${String(1+i%6).padStart(2,'0')}T06:15:00`:undefined,
    cycleTimeSec: 28+Math.round(woRand()*12),
    targetCycleTimeSec: 30,
  };
});

const CHECK_TYPES = ['Dimensional Check','Visual Inspection','Hardness Test','Leak Test','Surface Finish','Tensile Test','CMM Measurement','X-Ray Inspection'];
const qRand = lcg(44);
const qualityChecks: QualityCheck[] = Array.from({length:20}, (_,i) => {
  const defectRate = qRand()*0.04;
  const sample = 50+Math.round(qRand()*150);
  const defects = Math.round(sample*defectRate);
  const result: QualityCheck['result'] = defectRate > 0.03 ? 'fail' : defectRate > 0.015 ? 'conditional' : 'pass';
  return {
    id: `qc${i+1}`,
    orderId: productionOrders[i%productionOrders.length].orderNo,
    product: productionLines[i%productionLines.length].product,
    lineId: productionLines[i%productionLines.length].id,
    checkType: CHECK_TYPES[i%CHECK_TYPES.length],
    checkDate: `2026-05-${String(Math.max(1,7-Math.floor(i/3))).padStart(2,'0')}`,
    inspector: ['Leo Matsumoto','K. Tanaka','A. Rodriguez'][i%3],
    sampleSize: sample, defects, defectRate: Math.round(defectRate*10000)/100,
    result, notes: result==='fail'?'Exceeds tolerance – hold batch':'Within specification',
  };
});

const MAT_NAMES = ['Carbon Steel Billets','Aluminum 6061 Stock','Hydraulic Seals (Kit)','Stainless Fasteners M8','High-Speed Steel Inserts','Lubricant ISO-VG-68','Cutting Fluid Concentrate','Titanium Round Bar','Bearing Shells 80mm','O-Ring Assortment','Precision Shims','Carbide End Mills'];
const mRand = lcg(55);
const materials: Material[] = MAT_NAMES.map((name, i) => {
  const onHand = Math.round(mRand()*1000);
  const reorder = 100+Math.round(mRand()*200);
  const consume = 5+Math.round(mRand()*40);
  const days = onHand > 0 ? Math.round(onHand/consume) : 0;
  const status: Material['status'] = onHand===0?'out_of_stock':onHand<reorder?'low_stock':'in_stock';
  return {
    id: `mat${i+1}`, name, sku: `MAT-${String(2000+i*13).padStart(5,'0')}`,
    category: ['Raw Material','Raw Material','Consumable','Fastener','Tooling','Lubricant','Coolant','Raw Material','Component','Consumable','Tooling','Tooling'][i],
    onHandQty: onHand, reorderPoint: reorder, reorderQty: reorder*2,
    unitCost: 0.5+mRand()*250,
    supplier: ['Nucor Steel','Alcoa','Parker Hannifin','Grainger','Kennametal','Shell Lubricants'][i%6],
    leadTimeDays: 3+Math.round(mRand()*25),
    status, lastReceivedDate: `2026-${String(1+Math.floor(mRand()*4)).padStart(2,'0')}-15`,
    consumptionPerDay: consume, daysOfSupply: days,
  };
});

const hourRand = lcg(66);
const snapshots: ProductionSnapshot[] = Array.from({length:24}, (_,i) => ({
  hour: `${String(i).padStart(2,'0')}:00`,
  unitsProduced: i>=6&&i<=22 ? 400+Math.round(hourRand()*200) : Math.round(hourRand()*50),
  scrapRate: Math.round(hourRand()*3*100)/100,
  oee: 60+Math.round(hourRand()*30),
}));

interface Store {
  users: MfgUser[]; productionLines: ProductionLine[]; equipment: Equipment[];
  productionOrders: ProductionOrder[]; qualityChecks: QualityCheck[];
  materials: Material[]; snapshots: ProductionSnapshot[];
}
const g = globalThis as typeof globalThis & { __forgemax?: Store };
export const store: Store = g.__forgemax ?? (g.__forgemax = { users, productionLines, equipment, productionOrders, qualityChecks, materials, snapshots });
