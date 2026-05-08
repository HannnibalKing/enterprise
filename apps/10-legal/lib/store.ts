import bcrypt from 'bcryptjs';
import type { LegalUser, Client, Case, Invoice, CalendarEvent } from './types';

function lcg(seed: number) {
  let s = seed >>> 0;
  return () => { s = (Math.imul(1664525, s) + 1013904223) >>> 0; return s / 0x100000000; };
}

const users: LegalUser[] = [
  { id:'u1', name:'Harrison Blackwood', email:'harrison@lexislaw.com', role:'managing_partner', passwordHash: bcrypt.hashSync('legal123',10) },
  { id:'u2', name:'Claire Montgomery',  email:'claire@lexislaw.com',   role:'senior_associate', passwordHash: bcrypt.hashSync('legal123',10) },
  { id:'u3', name:'Miguel Torres',      email:'miguel@lexislaw.com',   role:'associate',        passwordHash: bcrypt.hashSync('legal123',10) },
  { id:'u4', name:'Priya Sharma',       email:'priya@lexislaw.com',    role:'paralegal',        passwordHash: bcrypt.hashSync('legal123',10) },
  { id:'u5', name:'Fiona Kellerman',    email:'fiona@lexislaw.com',    role:'billing_manager',  passwordHash: bcrypt.hashSync('legal123',10) },
];

const CLIENT_NAMES = ['Apex Global Corp','Meridian Technologies','Starfield Capital','Northgate Pharma','Crestwood Industries','Pinnacle Real Estate','Halcyon Financial','Vector Systems','Crimson Healthcare','Solaris Energy','Pacific Ventures','Titan Manufacturing','Aurora Biotech','Nexus Retail Group','Vanguard Logistics'];
const INDUSTRIES = ['Conglomerate','Technology','Private Equity','Pharmaceuticals','Manufacturing','Real Estate','Financial Services','Defense','Healthcare','Energy','Venture Capital','Manufacturing','Biotechnology','Retail','Logistics'];
const cRand = lcg(22);
const clients: Client[] = CLIENT_NAMES.map((name, i) => ({
  id: `cli${i+1}`, name, type: i < 12 ? 'corporate' : 'individual',
  industry: INDUSTRIES[i], contactName: ['John Carter','Sarah Kim','Robert Nash','Emily Walsh','David Park'][i%5],
  contactEmail: `contact@${name.toLowerCase().replace(/\s+/g,'')}.com`,
  phone: `+1 (${200+i*7}) ${300+i*13}-${1000+i*37}`,
  ytdBilled: 250000+Math.round(cRand()*1500000),
  ytdCollected: 0, activeCases: 1+Math.floor(cRand()*4),
  since: `${2015+Math.floor(cRand()*8)}-01-01`,
  tier: (i<4?'platinum':i<9?'gold':'silver') as Client['tier'],
}));
clients.forEach(c => { c.ytdCollected = Math.round(c.ytdBilled * (0.88 + cRand()*0.1)); });

const CASE_TITLES = [
  'Apex v. Vector Patent Infringement','Meridian Technologies M&A Advisory','Starfield Capital Fund Formation',
  'Northgate Pharma FDA Regulatory','Crestwood Employment Class Action','Pinnacle REIT Acquisition',
  'Halcyon Financial SEC Investigation','Vector Systems DoD Contract Dispute','Crimson Healthcare HIPAA Compliance',
  'Solaris Energy JV Formation','Pacific Ventures Series B Structuring','Titan Manufacturing Trade Secret',
  'Aurora Biotech IP Portfolio','Nexus Retail Franchise Agreement','Vanguard Logistics OSHA Defense',
  'Apex Global Corp Restructuring','Meridian Tax Optimization','Starfield Merger Clearance',
];
const AREAS: Case['practiceArea'][] = ['litigation','corporate','ip','real_estate','employment','tax','mergers','corporate','litigation','corporate','corporate','litigation','ip','corporate','employment','corporate','tax','mergers'];
const JURISDICTIONS = ['SDNY','N.D. Cal.','D. Del.','C.D. Cal.','S.D. Tex.','D. Mass.','E.D. Va.','D.N.J.','N.D. Tex.','D. Md.'];
const ATTORNEYS = ['Harrison Blackwood','Claire Montgomery','Miguel Torres'];
const rCase = lcg(44);
const cases: Case[] = CASE_TITLES.map((title, i) => {
  const statuses: Case['status'][] = ['active','discovery','trial','settlement','closed','appeal'];
  const priorities: Case['priority'][] = ['critical','high','high','medium','medium','low'];
  const billed = 50+Math.round(rCase()*350);
  const budget = billed + 30 + Math.round(rCase()*120);
  const rate = 550+Math.round(rCase()*250);
  return {
    id: `case${i+1}`,
    caseNumber: `LEXI-${2025+Math.floor(i/6)}-${String(1000+i).padStart(4,'0')}`,
    title, clientId: clients[i%clients.length].id,
    clientName: clients[i%clients.length].name,
    practiceArea: AREAS[i],
    status: statuses[i%statuses.length],
    priority: priorities[i%priorities.length],
    leadAttorney: ATTORNEYS[i%ATTORNEYS.length],
    assignedTeam: [ATTORNEYS[i%ATTORNEYS.length], 'Priya Sharma'],
    openDate: `${2024+Math.floor(i/9)}-${String(1+i%12).padStart(2,'0')}-15`,
    targetClose: `${2026+Math.floor(i/6)}-${String(1+(i+3)%12).padStart(2,'0')}-30`,
    billedHours: billed, budgetedHours: budget,
    billedAmount: billed*rate, budgetAmount: budget*rate,
    description: `Complex matter involving ${AREAS[i].replace('_',' ')} issues requiring specialized expertise.`,
    jurisdiction: JURISDICTIONS[i%JURISDICTIONS.length],
    opponent: i%3===0 ? `Opposing Corp ${i+1}` : undefined,
  };
});

const invRand = lcg(66);
const invoices: Invoice[] = cases.slice(0,14).map((c, i) => {
  const amt = 15000+Math.round(invRand()*180000);
  const statuses: Invoice['status'][] = ['paid','paid','sent','overdue','draft','disputed'];
  const st = statuses[i%statuses.length];
  return {
    id: `inv${i+1}`,
    invoiceNumber: `INV-2026-${String(1000+i).padStart(4,'0')}`,
    clientId: c.clientId, clientName: c.clientName,
    caseId: c.id, caseName: c.title.slice(0,30),
    issueDate: `2026-${String(1+i%4).padStart(2,'0')}-01`,
    dueDate: `2026-${String(1+(i+1)%4+1).padStart(2,'0')}-01`,
    amount: amt, paid: st==='paid'?amt:st==='sent'?0:st==='overdue'?0:0,
    status: st, items: 3+Math.floor(invRand()*6),
  };
});

const EVT_TYPES: CalendarEvent['type'][] = ['hearing','deposition','filing_deadline','client_meeting','trial','mediation'];
const LOCATIONS = ['Room 12-A','SDNY Courtroom 4','Zoom Call','Office – Conf Rm B','C.D. Cal. Courtroom 7','Mediation Center'];
const evtRand = lcg(88);
const calendarEvents: CalendarEvent[] = cases.slice(0,12).map((c, i) => ({
  id: `evt${i+1}`, title: `${EVT_TYPES[i%EVT_TYPES.length].replace('_',' ').toUpperCase()}: ${c.title.slice(0,25)}`,
  type: EVT_TYPES[i%EVT_TYPES.length],
  caseId: c.id, caseName: c.title.slice(0,30),
  date: `2026-05-${String(7+Math.floor(evtRand()*24)).padStart(2,'0')}`,
  time: `${8+Math.floor(evtRand()*9)}:00`,
  duration: 60+Math.floor(evtRand()*180),
  location: LOCATIONS[i%LOCATIONS.length],
  attorney: ATTORNEYS[i%ATTORNEYS.length],
}));

interface Store {
  users: LegalUser[]; clients: Client[]; cases: Case[];
  invoices: Invoice[]; calendarEvents: CalendarEvent[];
}
const g = globalThis as typeof globalThis & { __lexis?: Store };
export const store: Store = g.__lexis ?? (g.__lexis = { users, clients, cases, invoices, calendarEvents });
