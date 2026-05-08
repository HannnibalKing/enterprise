import bcrypt from 'bcryptjs';
import type { RealtyUser, Property, Lease, WorkOrder, FinancialSnapshot } from './types';

function lcg(seed: number) {
  let s = seed >>> 0;
  return () => { s = (Math.imul(1664525, s) + 1013904223) >>> 0; return s / 0x100000000; };
}

const users: RealtyUser[] = [
  { id:'u1', name:'Patricia Holloway', email:'patricia@nexusrealty.com', role:'vp_operations',       passwordHash: bcrypt.hashSync('realty123',10) },
  { id:'u2', name:'James Whitfield',   email:'james@nexusrealty.com',    role:'property_manager',    passwordHash: bcrypt.hashSync('realty123',10) },
  { id:'u3', name:'Selena Vargas',     email:'selena@nexusrealty.com',   role:'leasing_agent',       passwordHash: bcrypt.hashSync('realty123',10) },
  { id:'u4', name:'Derek Powell',      email:'derek@nexusrealty.com',    role:'maintenance_manager', passwordHash: bcrypt.hashSync('realty123',10) },
  { id:'u5', name:'Vivian Chen',       email:'vivian@nexusrealty.com',   role:'accountant',          passwordHash: bcrypt.hashSync('realty123',10) },
];

const propData: [string,string,string,string,string,number,number,number,number,number,number,string][] = [
  ['Meridian Tower','450 Park Ave','New York','NY','office',  425000,391000,1200,1128,185000000,220000000,'James Whitfield'],
  ['Eastgate Plaza','2100 Commerce Dr','Chicago','IL','retail',  310000,279000,85, 76, 98000000, 112000000,'James Whitfield'],
  ['Sunbelt Logistics Center','8800 I-10 West','Houston','TX','industrial',980000,931000,1,1, 72000000,88000000,'James Whitfield'],
  ['Harbor View Mixed Use','500 Waterfront Blvd','Seattle','WA','mixed_use', 245000,210000,320,278,145000000,168000000,'Patricia Holloway'],
  ['Westfield Apartments','1200 Westfield Dr','Austin','TX','multifamily',0,0,480,432,95000000,118000000,'Selena Vargas'],
  ['Pinnacle Office Park','9900 Pinnacle Pkwy','Atlanta','GA','office',   520000,442000,8,7, 210000000,238000000,'James Whitfield'],
  ['Riverside Retail Center','3300 River Rd','Denver','CO','retail',  175000,157500,42,38,54000000,61000000,'Selena Vargas'],
  ['Metro Industrial Complex','1500 Metro Blvd','Dallas','TX','industrial',1200000,1080000,1,1,89000000,104000000,'Derek Powell'],
];

const PROP_STATUS: Property['status'][] = ['stabilized','stabilized','stabilized','stabilized','lease_up','stabilized','renovation','stabilized'];

const properties: Property[] = propData.map((p, i) => {
  const [name,address,city,state,type,sqFt,leasedSqFt,units,leasedUnits,purchasePrice,currentValue,manager] = p;
  const occ = units > 0 ? Math.round((leasedUnits/units)*1000)/10 : Math.round((leasedSqFt/sqFt)*1000)/10;
  const noi = Math.round(currentValue * (0.055 + (i%3)*0.005));
  return {
    id:`prop${i+1}`, name, address, city, state,
    type: type as Property['type'],
    status: PROP_STATUS[i],
    totalSqFt: sqFt, leasedSqFt, occupancyPct: occ,
    units, leasedUnits, purchasePrice, currentValue, noi,
    capRate: Math.round((noi/currentValue)*10000)/100,
    yearBuilt: 1985 + i*4, manager,
  };
});

const TENANTS = ['Goldman Sachs','Microsoft','Starbucks','WeWork','Amazon','Deloitte','JP Morgan','KPMG','Nike','Tesla','Cisco','Salesforce','Pfizer','Boeing','3M','Oracle','Caterpillar','Walmart','Target','FedEx'];
const INDUSTRIES = ['Finance','Technology','Retail','Co-Working','E-Commerce','Professional Services','Finance','Consulting','Apparel','Automotive','Technology','CRM','Pharmaceuticals','Aerospace','Manufacturing','Software','Industrial','Retail','Retail','Logistics'];
const rand = lcg(77);
const leases: Lease[] = properties.slice(0,7).flatMap((prop, pi) => {
  const count = prop.type === 'multifamily' ? 6 : prop.type === 'office' ? 5 : 3;
  return Array.from({length: count}, (_, li) => {
    const ti = (pi*3+li) % TENANTS.length;
    const rentPsf = prop.type === 'office' ? 42+Math.round(rand()*20) : prop.type === 'retail' ? 28+Math.round(rand()*15) : prop.type === 'multifamily' ? 0 : 8+Math.round(rand()*6);
    const sqFt = prop.type === 'multifamily' ? 900+Math.round(rand()*600) : prop.type === 'industrial' ? 50000+Math.round(rand()*80000) : 5000+Math.round(rand()*20000);
    const monthlyRent = prop.type === 'multifamily' ? 2200+Math.round(rand()*1800) : Math.round(sqFt*rentPsf/12);
    const yr = 2020+Math.floor(rand()*3);
    const mon = 1+Math.floor(rand()*12);
    const term = 3+Math.floor(rand()*7);
    const STATUS_OPTS: Lease['status'][] = ['active','active','active','active','expiring_soon','pending'];
    return {
      id: `L${String(pi*10+li+1).padStart(4,'0')}`,
      propertyId: prop.id, propertyName: prop.name,
      tenantName: TENANTS[ti], tenantIndustry: INDUSTRIES[ti],
      unit: prop.type==='multifamily'?`${100+li+1}`:`Suite ${100+li*100}`,
      sqFt, monthlyRent, annualRent: monthlyRent*12,
      rentPsf: prop.type==='multifamily' ? Math.round(monthlyRent*12/sqFt*100)/100 : rentPsf,
      leaseStart: `${yr}-${String(mon).padStart(2,'0')}-01`,
      leaseEnd: `${yr+term}-${String(mon).padStart(2,'0')}-01`,
      status: STATUS_OPTS[Math.floor(rand()*STATUS_OPTS.length)],
      depositHeld: monthlyRent*2, escalationPct: 2.5+rand()*2,
      options: Math.random()>0.5?'1x5yr renewal':'None',
    };
  });
});

const WO_CATS = ['HVAC','Plumbing','Electrical','Elevator','Roofing','Painting','Landscaping','Lighting','Carpeting','Security'];
const WO_DESC = ['AC unit failure in unit','Pipe leak reported','Breaker tripped floor 3','Elevator cab inspection due','Roof membrane cracking','Interior repaint needed','Sprinkler head replacement','Lobby lighting upgrade','Common area carpet replacement','Access control battery replacement'];
const WO_PRIO: WorkOrder['priority'][] = ['critical','high','high','medium','medium','medium','low','low','low','low'];
const WO_STATUS: WorkOrder['status'][] = ['open','in_progress','in_progress','completed','completed','pending_parts','open','in_progress','completed','completed'];
const STAFF = ['Derek Powell','J. Hernandez','T. Nguyen','K. Smith','R. Patel'];
const wRand = lcg(33);
const workOrders: WorkOrder[] = Array.from({length:22}, (_,i) => {
  const prop = properties[i%properties.length];
  const cat = WO_CATS[i%WO_CATS.length];
  const est = 500+Math.round(wRand()*4500);
  const completed = WO_STATUS[i%WO_STATUS.length]==='completed';
  return {
    id:`WO-${String(i+1001).padStart(5,'0')}`,
    propertyId: prop.id, propertyName: prop.name,
    unit: `${200+i}`,
    category: cat,
    description: WO_DESC[i%WO_DESC.length],
    priority: WO_PRIO[i%WO_PRIO.length],
    status: WO_STATUS[i%WO_STATUS.length],
    reportedBy: TENANTS[i%TENANTS.length],
    assignedTo: STAFF[i%STAFF.length],
    createdDate: `2026-${String(1+Math.floor(wRand()*4)).padStart(2,'0')}-${String(1+Math.floor(wRand()*28)).padStart(2,'0')}`,
    dueDate: `2026-05-${String(10+i%20).padStart(2,'0')}`,
    completedDate: completed ? `2026-04-${String(10+i%18).padStart(2,'0')}` : undefined,
    estimatedCost: est,
    actualCost: completed ? Math.round(est*(0.85+wRand()*0.3)) : undefined,
  };
});

const fRand = lcg(55);
const financials: FinancialSnapshot[] = Array.from({length:12}, (_,i) => {
  const month = `2025-${String(i+5>12?i+5-12:i+5).padStart(2,'0')}`;
  const rev = 3800000+Math.round(fRand()*400000);
  const exp = 1600000+Math.round(fRand()*200000);
  return { month, totalRevenue:rev, totalExpenses:exp, noi:rev-exp, occupancyPct:88+fRand()*8, collectionRate:94+fRand()*5 };
});

interface Store {
  users: RealtyUser[];
  properties: Property[];
  leases: Lease[];
  workOrders: WorkOrder[];
  financials: FinancialSnapshot[];
}
const g = globalThis as typeof globalThis & { __realty?: Store };
export const store: Store = g.__realty ?? (g.__realty = { users, properties, leases, workOrders, financials });
