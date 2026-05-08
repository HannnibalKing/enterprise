import bcrypt from 'bcryptjs';
import { v4 as uuid } from 'uuid';
import type {
  StaffUser, FloorPosition, Patron, PatronVisit,
  DailyRevenue, MonthlyRevenue, ChipStock, CageTransaction,
} from './types';

interface Store {
  users: Map<string, StaffUser>;
  positions: Map<string, FloorPosition>;
  patrons: Map<string, Patron>;
  patronVisits: PatronVisit[];
  dailyRevenue: DailyRevenue[];
  monthlyRevenue: MonthlyRevenue[];
  chipStock: ChipStock[];
  cageTransactions: CageTransaction[];
}

/* ── Deterministic pseudo-random (avoids crypto dep) ────────────────────── */
function lcg(seed: number) {
  let s = seed >>> 0;
  return () => { s = Math.imul(1664525, s) + 1013904223 >>> 0; return s / 0x100000000; };
}

/* ── Revenue generation ─────────────────────────────────────────────────── */
function buildDailyRevenue(): DailyRevenue[] {
  const rng = lcg(777);
  const out: DailyRevenue[] = [];
  for (let d = 59; d >= 0; d--) {
    const date = new Date(); date.setDate(date.getDate() - d);
    const dow = date.getDay();
    const isWeekend = dow === 0 || dow === 5 || dow === 6;
    const dateStr = date.toISOString().split('T')[0];
    const baseMult = (isWeekend ? 1.38 : 1.0) * (0.85 + rng() * 0.30);
    const tableGGR  = Math.round(520000 * baseMult);
    const slotGGR   = Math.round(310000 * baseMult);
    const totalGGR  = tableGGR + slotGGR;
    const tableHandle = Math.round(tableGGR / 0.172);
    const slotHandle  = Math.round(slotGGR  / 0.082);
    const baccaratGGR   = Math.round(tableGGR * 0.45);
    const blackjackGGR  = Math.round(tableGGR * 0.28);
    const rouletteGGR   = Math.round(tableGGR * 0.12);
    const otherGGR      = tableGGR - baccaratGGR - blackjackGGR - rouletteGGR;
    out.push({
      date: dateStr, tableGGR, slotGGR, totalGGR,
      tableHandle, slotHandle,
      tableHoldPct: +((tableGGR / tableHandle) * 100).toFixed(1),
      slotHoldPct:  +((slotGGR  / slotHandle)  * 100).toFixed(1),
      baccaratGGR, blackjackGGR, rouletteGGR, otherGGR,
      headcount: Math.round(3800 * baseMult),
    });
  }
  return out;
}

function buildMonthlyRevenue(): MonthlyRevenue[] {
  const MONTHS = [
    { month: '2025-06', label: 'Jun 25', tMult: 0.97, sMult: 0.95 },
    { month: '2025-07', label: 'Jul 25', tMult: 1.12, sMult: 1.10 },
    { month: '2025-08', label: 'Aug 25', tMult: 1.08, sMult: 1.06 },
    { month: '2025-09', label: 'Sep 25', tMult: 0.94, sMult: 0.93 },
    { month: '2025-10', label: 'Oct 25', tMult: 1.02, sMult: 1.00 },
    { month: '2025-11', label: 'Nov 25', tMult: 1.15, sMult: 1.12 },
    { month: '2025-12', label: 'Dec 25', tMult: 1.28, sMult: 1.24 },
    { month: '2026-01', label: 'Jan 26', tMult: 0.89, sMult: 0.88 },
    { month: '2026-02', label: 'Feb 26', tMult: 0.93, sMult: 0.91 },
    { month: '2026-03', label: 'Mar 26', tMult: 1.18, sMult: 1.15 },
    { month: '2026-04', label: 'Apr 26', tMult: 1.09, sMult: 1.07 },
    { month: '2026-05', label: 'May 26', tMult: 0.21, sMult: 0.21 }, // partial
  ];
  const BASE_T = 520000 * 30, BASE_S = 310000 * 30;
  return MONTHS.map(({ month, label, tMult, sMult }) => {
    const tableGGR  = Math.round(BASE_T * tMult);
    const slotGGR   = Math.round(BASE_S * sMult);
    const totalGGR  = tableGGR + slotGGR;
    return { month, label, tableGGR, slotGGR, totalGGR, tableHoldPct: 17.2, slotHoldPct: 8.2 };
  });
}

/* ── Store factory ──────────────────────────────────────────────────────── */
function initStore(): Store {
  const PW = bcrypt.hashSync('casino123', 10);
  const now = new Date().toISOString();

  /* ── Staff ──────────────────────────────────────────────────────────── */
  const users = new Map<string, StaffUser>([
    ['u-victoria', { id: 'u-victoria', name: 'Victoria Rhodes',  email: 'victoria@palazzo.vip', passwordHash: PW, avatar: 'VR', role: 'director',        title: 'Casino Director'       }],
    ['u-marcus',   { id: 'u-marcus',   name: 'Marcus Kane',      email: 'marcus@palazzo.vip',   passwordHash: PW, avatar: 'MK', role: 'pit_boss',         title: 'Senior Pit Boss'       }],
    ['u-elena',    { id: 'u-elena',    name: 'Elena Vasquez',    email: 'elena@palazzo.vip',    passwordHash: PW, avatar: 'EV', role: 'host',              title: 'VIP Host Manager'      }],
    ['u-james',    { id: 'u-james',    name: 'James Calloway',   email: 'james@palazzo.vip',    passwordHash: PW, avatar: 'JC', role: 'cage_supervisor',   title: 'Cage Supervisor'       }],
    ['u-riya',     { id: 'u-riya',     name: 'Riya Patel',       email: 'riya@palazzo.vip',     passwordHash: PW, avatar: 'RP', role: 'analyst',           title: 'Revenue Analyst'       }],
  ]);

  /* ── Floor positions ────────────────────────────────────────────────── */
  const P = (p: Omit<FloorPosition, 'id'>): [string, FloorPosition] => {
    const id = uuid(); return [id, { ...p, id }];
  };
  const positions = new Map<string, FloorPosition>([
    /* ── Grand Floor ─────────────────────────────── */
    P({ code:'BJ-01',     label:'Blackjack 1',      gameType:'blackjack',        section:'grand_floor',    status:'active',      dealerName:'Alice Murphy',   minBet:25,    maxBet:2000,   seats:7,  occupied:5, shiftGGR:47200 }),
    P({ code:'BJ-02',     label:'Blackjack 2',      gameType:'blackjack',        section:'grand_floor',    status:'active',      dealerName:'James Chen',     minBet:25,    maxBet:2000,   seats:7,  occupied:7, shiftGGR:68900 }),
    P({ code:'BJ-03',     label:'Blackjack 3',      gameType:'blackjack',        section:'grand_floor',    status:'active',      dealerName:'Marcus Lee',     minBet:25,    maxBet:2000,   seats:7,  occupied:4, shiftGGR:34800 }),
    P({ code:'BJ-04',     label:'Blackjack 4',      gameType:'blackjack',        section:'grand_floor',    status:'active',      dealerName:'Sofia Torres',   minBet:50,    maxBet:3000,   seats:6,  occupied:5, shiftGGR:52100 }),
    P({ code:'BJ-05',     label:'Blackjack 5',      gameType:'blackjack',        section:'grand_floor',    status:'idle',        dealerName:undefined,        minBet:25,    maxBet:2000,   seats:6,  occupied:0, shiftGGR:0 }),
    P({ code:'BAC-01',    label:'Baccarat 1',        gameType:'baccarat',         section:'grand_floor',    status:'active',      dealerName:'David Park',     minBet:50,    maxBet:10000,  seats:14, occupied:9, shiftGGR:187500 }),
    P({ code:'BAC-02',    label:'Baccarat 2',        gameType:'baccarat',         section:'grand_floor',    status:'active',      dealerName:'Lisa Wong',      minBet:50,    maxBet:10000,  seats:14, occupied:11,shiftGGR:234000 }),
    P({ code:'BAC-03',    label:'Baccarat 3',        gameType:'baccarat',         section:'grand_floor',    status:'active',      dealerName:'Robert Nash',    minBet:50,    maxBet:10000,  seats:14, occupied:6, shiftGGR:98400 }),
    P({ code:'RLT-01',    label:'Roulette 1',        gameType:'roulette',         section:'grand_floor',    status:'active',      dealerName:'Emma Davis',     minBet:10,    maxBet:1000,   seats:8,  occupied:5, shiftGGR:28600 }),
    P({ code:'RLT-02',    label:'Roulette 2',        gameType:'roulette',         section:'grand_floor',    status:'active',      dealerName:'Miguel Santos',  minBet:10,    maxBet:1000,   seats:8,  occupied:7, shiftGGR:38200 }),
    P({ code:'CRP-01',    label:'Craps 1',           gameType:'craps',            section:'grand_floor',    status:'active',      dealerName:'Team',           minBet:10,    maxBet:1000,   seats:12, occupied:9, shiftGGR:54300 }),
    P({ code:'TCP-01',    label:'Three Card Poker',  gameType:'three_card_poker', section:'grand_floor',    status:'idle',        dealerName:undefined,        minBet:15,    maxBet:500,    seats:7,  occupied:0, shiftGGR:0 }),
    /* ── Apex High Limit ──────────────────────────── */
    P({ code:'HLBJ-01',   label:'High Limit BJ 1',   gameType:'blackjack',        section:'apex_high_limit',status:'active',      dealerName:'Victoria Park',  minBet:500,   maxBet:25000,  seats:5,  occupied:4, shiftGGR:87000 }),
    P({ code:'HLBJ-02',   label:'High Limit BJ 2',   gameType:'blackjack',        section:'apex_high_limit',status:'active',      dealerName:'Richard Gold',   minBet:500,   maxBet:25000,  seats:5,  occupied:3, shiftGGR:62000 }),
    P({ code:'HLBAC-01',  label:'High Limit Bac 1',  gameType:'baccarat',         section:'apex_high_limit',status:'active',      dealerName:'Jennifer Wu',    minBet:1000,  maxBet:100000, seats:14, occupied:8, shiftGGR:425000 }),
    P({ code:'HLBAC-02',  label:'High Limit Bac 2',  gameType:'baccarat',         section:'apex_high_limit',status:'maintenance', dealerName:undefined,        minBet:1000,  maxBet:100000, seats:14, occupied:0, shiftGGR:0 }),
    P({ code:'HLRLT-01',  label:'High Limit Rlt',    gameType:'roulette',         section:'apex_high_limit',status:'active',      dealerName:'Catherine Bell', minBet:500,   maxBet:25000,  seats:6,  occupied:3, shiftGGR:74800 }),
    /* ── The Arcade ─────────────────────────────────── */
    P({ code:'SLT-A01', label:'Penny Slots A',  gameType:'slot', section:'arcade', status:'active', minBet:0.01, maxBet:5,   seats:24, occupied:18, shiftGGR:12400, denomination:0.01 }),
    P({ code:'SLT-A02', label:'Penny Slots B',  gameType:'slot', section:'arcade', status:'active', minBet:0.01, maxBet:5,   seats:24, occupied:14, shiftGGR:9800,  denomination:0.01 }),
    P({ code:'SLT-A03', label:'Nickel Slots A', gameType:'slot', section:'arcade', status:'active', minBet:0.05, maxBet:25,  seats:16, occupied:11, shiftGGR:11200, denomination:0.05 }),
    P({ code:'SLT-A04', label:'Nickel Slots B', gameType:'slot', section:'arcade', status:'active', minBet:0.05, maxBet:25,  seats:16, occupied:8,  shiftGGR:8900,  denomination:0.05 }),
    P({ code:'SLT-B01', label:'Dollar Slots A', gameType:'slot', section:'arcade', status:'active', minBet:1,    maxBet:500, seats:15, occupied:10, shiftGGR:28400, denomination:1 }),
    P({ code:'SLT-B02', label:'Dollar Slots B', gameType:'slot', section:'arcade', status:'active', minBet:1,    maxBet:500, seats:15, occupied:7,  shiftGGR:22100, denomination:1 }),
    P({ code:'SLT-B03', label:'$5 Slots A',     gameType:'slot', section:'arcade', status:'active', minBet:5,    maxBet:2500,seats:10, occupied:6,  shiftGGR:34600, denomination:5, isJackpotEligible:true, progressiveAmount:187420 }),
    P({ code:'SLT-B04', label:'$5 Slots B',     gameType:'slot', section:'arcade', status:'idle',   minBet:5,    maxBet:2500,seats:10, occupied:0,  shiftGGR:0,     denomination:5 }),
    /* ── VIP Slots ───────────────────────────────────── */
    P({ code:'SLT-V01', label:'High Limit $25',  gameType:'slot', section:'vip_slots', status:'active',      minBet:25,  maxBet:5000, seats:6, occupied:4, shiftGGR:48200, denomination:25,  isJackpotEligible:true, progressiveAmount:842100 }),
    P({ code:'SLT-V02', label:'High Limit $100', gameType:'slot', section:'vip_slots', status:'active',      minBet:100, maxBet:5000, seats:4, occupied:3, shiftGGR:67500, denomination:100, isJackpotEligible:true, progressiveAmount:2140800 }),
    P({ code:'SLT-V03', label:'High Limit $100', gameType:'slot', section:'vip_slots', status:'maintenance', minBet:100, maxBet:5000, seats:4, occupied:0, shiftGGR:0,     denomination:100 }),
  ]);

  /* ── Patrons ────────────────────────────────────────────────────────── */
  const patrons = new Map<string, Patron>([
    ['p-carlos',    { id:'p-carlos',    memberId:'PLZ-000001', firstName:'Carlos',    lastName:'Rodriguez',      email:'c.rodriguez@privado.mx',    phone:'+52-555-0101', nationality:'Mexican',       tier:'noir',     hostId:'u-elena', onProperty:true,  roomNumber:'Palazzo Suite 4201', checkInDate:'2026-05-04', checkOutDate:'2026-05-09', lifetimeValue:18500000, ytdValue:2100000, compBalance:85000,  lifetimeComps:1250000, visitCount:84,  lastVisitDate:'2026-05-04', avgDailyTheoretical:150000, preferredGames:['baccarat'],                 creditLine:5000000, creditUsed:1000000, tags:['whale','requires-limo','vip-suite','no-photos'],      notes:'Requires private elevator access. Plays exclusively at HLBAC-01. Must have Patron Tequila on table at all times.',              vipServices:['private-elevator','jet-charter','butler','villa-comp','limo'],    drinkPreference:'Patrón Añejo', preferredRoomType:'Villa Suite', joinDate:'2018-03-12' }],
    ['p-kwame',     { id:'p-kwame',     memberId:'PLZ-000002', firstName:'Prince',    lastName:'Kwame Asante',   email:'office@asanteholdings.com',  phone:'+44-20-0202',  nationality:'Ghanaian',      tier:'noir',     hostId:'u-elena', onProperty:true,  roomNumber:'Chairman Villa',    checkInDate:'2026-05-05', checkOutDate:'2026-05-08', lifetimeValue:24200000, ytdValue:3400000, compBalance:120000, lifetimeComps:2100000, visitCount:62,  lastVisitDate:'2026-05-05', avgDailyTheoretical:200000, preferredGames:['baccarat'],                 creditLine:10000000,creditUsed:2000000, tags:['whale','private-arrival','royal-protocol','no-press'],notes:'Arrives via private hangar. Security detail of 4. Requires full floor buy-out for private sessions on occasion.',               vipServices:['jet-charter','villa-comp','private-floor','butler','security-escort'], drinkPreference:'Dom Pérignon 2013', preferredRoomType:'Chairman Villa', joinDate:'2016-09-28' }],
    ['p-omar',      { id:'p-omar',      memberId:'PLZ-000003', firstName:'Omar',      lastName:'Al-Rashidi',     email:'omar.ar@rashidi-group.ae',   phone:'+971-50-0303', nationality:'Saudi',          tier:'noir',     hostId:'u-elena', onProperty:false, lifetimeValue:31500000, ytdValue:1800000, compBalance:200000, lifetimeComps:3800000, visitCount:49,  lastVisitDate:'2026-04-14', avgDailyTheoretical:300000, preferredGames:['baccarat'],                 creditLine:15000000,creditUsed:0,       tags:['whale','private-jet','no-comps-needed','cultural-req'], notes:'Preferred play schedule: 11pm–5am. Requires dedicated staff. Non-alcoholic beverages only.',                                   vipServices:['private-jet','villa-comp','butler','private-floor'],              drinkPreference:'Sparkling water', preferredRoomType:'Penthouse', joinDate:'2015-01-15' }],
    ['p-jennifer',  { id:'p-jennifer',  memberId:'PLZ-000004', firstName:'Jennifer',  lastName:'Blackwood-Hall', email:'jbh@blackwoodhall.com',      phone:'+1-212-0404',  nationality:'American',      tier:'diamond',  hostId:'u-elena', onProperty:true,  roomNumber:'3892',             checkInDate:'2026-05-05', checkOutDate:'2026-05-07', lifetimeValue:2800000,  ytdValue:380000,  compBalance:28000,  lifetimeComps:195000,  visitCount:142, lastVisitDate:'2026-05-05', avgDailyTheoretical:45000,  preferredGames:['blackjack','baccarat'],     creditLine:1000000, creditUsed:200000,  tags:['high-roller','return-guest','prefers-HLBJ'],           notes:'Prefers female dealers when available. Always books 3+ nights. Excellent tipper.',                                              vipServices:['suite-comp','limo','restaurant-priority'],                        drinkPreference:'Ketel One martini', preferredRoomType:'Luxury Suite', joinDate:'2019-07-22' }],
    ['p-meilin',    { id:'p-meilin',    memberId:'PLZ-000005', firstName:'Mei-Lin',   lastName:'Zhang',          email:'mlz@zhangcap.hk',           phone:'+852-0505',    nationality:'Hong Kong',     tier:'diamond',  hostId:'u-elena', onProperty:true,  roomNumber:'Apex Suite 1204',   checkInDate:'2026-05-03', checkOutDate:'2026-05-10', lifetimeValue:3400000,  ytdValue:520000,  compBalance:42000,  lifetimeComps:280000,  visitCount:98,  lastVisitDate:'2026-05-03', avgDailyTheoretical:55000,  preferredGames:['baccarat'],                 creditLine:2000000, creditUsed:500000,  tags:['high-roller','long-stay','silent-player'],             notes:'Never discusses bet strategy. Prefers minimal interruptions during play. Brings personal assistant.',                           vipServices:['suite-comp','butler','restaurant-priority','spa'],                drinkPreference:'Oolong tea', preferredRoomType:'Apex Suite', joinDate:'2020-02-14' }],
    ['p-takeshi',   { id:'p-takeshi',   memberId:'PLZ-000006', firstName:'Takeshi',   lastName:'Yamamoto',       email:'t.yamamoto@yaminvest.jp',    phone:'+81-3-0606',   nationality:'Japanese',      tier:'diamond',  hostId:'u-elena', onProperty:false, lifetimeValue:4100000,  ytdValue:290000,  compBalance:35000,  lifetimeComps:320000,  visitCount:77,  lastVisitDate:'2026-03-18', avgDailyTheoretical:75000,  preferredGames:['baccarat','blackjack'],     creditLine:2500000, creditUsed:300000,  tags:['high-roller','international','jet-charter'],          notes:'Annual spring visit. Always brings business associates (group of 6–10). Requires Japanese-speaking staff if available.',        vipServices:['jet-charter','suite-comp','group-dining'],                        drinkPreference:'Japanese whisky', preferredRoomType:'Penthouse', joinDate:'2017-05-30' }],
    ['p-bobby',     { id:'p-bobby',     memberId:'PLZ-000007', firstName:'Robert',    lastName:'Fitch III',      email:'bobby@fitchenergy.com',      phone:'+1-214-0707',  nationality:'American',      tier:'diamond',  hostId:'u-elena', onProperty:true,  roomNumber:'3215',             checkInDate:'2026-05-05', checkOutDate:'2026-05-07', lifetimeValue:1900000,  ytdValue:240000,  compBalance:19000,  lifetimeComps:142000,  visitCount:208, lastVisitDate:'2026-05-05', avgDailyTheoretical:30000,  preferredGames:['craps','blackjack'],        creditLine:800000,  creditUsed:150000,  tags:['high-roller','craps-player','regular'],                notes:'Very social player. Draws crowd at craps table. Generous tipper to dealers. Will recommend Palazzo to anyone.',                  vipServices:['suite-comp','limo','show-tickets'],                               drinkPreference:'Maker\'s Mark on rocks', preferredRoomType:'Luxury Suite', joinDate:'2018-11-03' }],
    ['p-alex',      { id:'p-alex',      memberId:'PLZ-000008', firstName:'Alexander', lastName:'Petrov',         email:'apetrov@petrovholding.ru',   phone:'+7-495-0808',  nationality:'Russian',       tier:'diamond',  hostId:'u-elena', onProperty:false, lifetimeValue:2600000,  ytdValue:180000,  compBalance:22000,  lifetimeComps:210000,  visitCount:55,  lastVisitDate:'2026-04-02', avgDailyTheoretical:42000,  preferredGames:['blackjack','baccarat'],     creditLine:1500000, creditUsed:0,       tags:['high-roller','analytical-player'],                    notes:'Studies house rules extensively before playing. Prefers 6-deck blackjack. Usually plays late evening.',                         vipServices:['suite-comp','restaurant-priority'],                               drinkPreference:'Grey Goose vodka', preferredRoomType:'Luxury Suite', joinDate:'2020-08-19' }],
    ['p-marcus_p',  { id:'p-marcus_p',  memberId:'PLZ-000009', firstName:'Marcus',    lastName:'St. Claire',     email:'msc@stclairellc.com',        phone:'+44-207-0909', nationality:'British',       tier:'platinum', hostId:'u-elena', onProperty:true,  roomNumber:'2104',             checkInDate:'2026-05-06', checkOutDate:'2026-05-08', lifetimeValue:480000,   ytdValue:68000,   compBalance:8500,   lifetimeComps:38000,   visitCount:89,  lastVisitDate:'2026-05-06', avgDailyTheoretical:12000,  preferredGames:['texas_holdem','blackjack'],creditLine:300000,  creditUsed:50000,   tags:['poker-player','regular'],                             notes:'Primarily a poker player. Books tournaments. Referral source for 3 other high-value patrons.',                                  vipServices:['suite-comp','tournament-priority'],                               drinkPreference:'Glenlivet 18', preferredRoomType:'Deluxe Suite', joinDate:'2021-06-14' }],
    ['p-priya',     { id:'p-priya',     memberId:'PLZ-000010', firstName:'Priya',     lastName:'Kapoor-Singh',   email:'priya@kapoorsg.ae',          phone:'+971-4-1010',  nationality:'Indian',        tier:'platinum', hostId:'u-elena', onProperty:false, lifetimeValue:670000,   ytdValue:92000,   compBalance:11000,  lifetimeComps:52000,   visitCount:44,  lastVisitDate:'2026-04-28', avgDailyTheoretical:18000,  preferredGames:['baccarat'],                 creditLine:400000,  creditUsed:80000,   tags:['international','regular'],                            notes:'Visits 4–5 times per year from Dubai. Prefers weekday play. Very private.',                                                     vipServices:['suite-comp','spa','restaurant-priority'],                         drinkPreference:'Champagne', preferredRoomType:'Deluxe Suite', joinDate:'2022-01-10' }],
    ['p-jimmy',     { id:'p-jimmy',     memberId:'PLZ-000011', firstName:'James',     lastName:'Castellano',     email:'jimmy.c@castellanore.com',   phone:'+1-312-1111',  nationality:'American',      tier:'platinum', hostId:'u-elena', onProperty:false, lifetimeValue:295000,   ytdValue:44000,   compBalance:6200,   lifetimeComps:24000,   visitCount:167, lastVisitDate:'2026-05-01', avgDailyTheoretical:15000,  preferredGames:['craps','blackjack'],        creditLine:250000,  creditUsed:30000,   tags:['craps-player','regular','chicago'],                   notes:'Long-term loyal patron. 20+ year Palazzo customer. Knows most staff by name.',                                                  vipServices:['suite-comp','show-tickets'],                                      drinkPreference:'Old Fashioned', preferredRoomType:'Standard Suite', joinDate:'2005-08-22' }],
    ['p-valentina', { id:'p-valentina', memberId:'PLZ-000012', firstName:'Valentina', lastName:'Reyes',          email:'v.reyes@reyesglobal.mx',     phone:'+52-55-1212',  nationality:'Mexican',       tier:'platinum', hostId:'u-elena', onProperty:true,  roomNumber:'1847',             checkInDate:'2026-05-05', checkOutDate:'2026-05-07', lifetimeValue:212000,   ytdValue:38000,   compBalance:5400,   lifetimeComps:17000,   visitCount:56,  lastVisitDate:'2026-05-05', avgDailyTheoretical:8000,   preferredGames:['baccarat','roulette'],      creditLine:200000,  creditUsed:40000,   tags:['baccarat','international'],                           notes:'Prefers table minimums above $500. Accompanied by personal assistant.',                                                         vipServices:['suite-comp','limo','spa'],                                        drinkPreference:'Casamigos Blanco', preferredRoomType:'Luxury Suite', joinDate:'2022-09-15' }],
    ['p-david_k',   { id:'p-david_k',   memberId:'PLZ-000013', firstName:'David',     lastName:'Kim',            email:'davidk@kimventures.la',      phone:'+1-310-1313',  nationality:'Korean-American',tier:'platinum', hostId:'u-elena', onProperty:false, lifetimeValue:385000,   ytdValue:52000,   compBalance:7800,   lifetimeComps:31000,   visitCount:103, lastVisitDate:'2026-04-20', avgDailyTheoretical:9500,   preferredGames:['texas_holdem','blackjack'],creditLine:300000,  creditUsed:60000,   tags:['poker-player','tech','la-based'],                     notes:'Tech entrepreneur. Plays poker strategy apps between sessions. Regular for weekend trips.',                                      vipServices:['suite-comp','restaurant-priority'],                               drinkPreference:'Tequila shots', preferredRoomType:'Standard Suite', joinDate:'2020-04-12' }],
    ['p-sophia',    { id:'p-sophia',    memberId:'PLZ-000014', firstName:'Sophia',    lastName:'Chen-Williams',  email:'sophia@cwdesigngroup.com',   phone:'+1-415-1414',  nationality:'American',      tier:'gold',     hostId:'u-elena', onProperty:false, lifetimeValue:87000,    ytdValue:18000,   compBalance:2100,   lifetimeComps:7800,    visitCount:38,  lastVisitDate:'2026-04-15', avgDailyTheoretical:4500,   preferredGames:['slot','baccarat'],          tags:['slots-player','weekend'],                             notes:'Enjoys the progressive jackpot machines. Always visits with spouse.',    vipServices:['dining-comp'],  drinkPreference:'Aperol Spritz', preferredRoomType:'Standard Room', joinDate:'2021-11-08' }],
    ['p-victor',    { id:'p-victor',    memberId:'PLZ-000015', firstName:'Victor',    lastName:'Espinoza',       email:'vespinoza@espinozacap.ar',   phone:'+54-11-1515',  nationality:'Argentine',     tier:'gold',     hostId:'u-elena', onProperty:true,  roomNumber:'1205',             checkInDate:'2026-05-05', checkOutDate:'2026-05-07', lifetimeValue:92000,    ytdValue:21000,   compBalance:2800,   lifetimeComps:8400,    visitCount:47,  lastVisitDate:'2026-05-05', avgDailyTheoretical:5500,   preferredGames:['texas_holdem','blackjack'],tags:['poker','international'],                              notes:'South American business executive. Visits twice yearly.',                vipServices:['dining-comp','show-tickets'], drinkPreference:'Malbec', preferredRoomType:'Standard Suite', joinDate:'2022-06-20' }],
    ['p-thomas',    { id:'p-thomas',    memberId:'PLZ-000016', firstName:'Thomas',    lastName:'Beckett',        email:'tbeckett@beckettmfg.com',    phone:'+1-206-1616',  nationality:'American',      tier:'gold',     hostId:'u-elena', onProperty:false, lifetimeValue:68000,    ytdValue:12000,   compBalance:1600,   lifetimeComps:5400,    visitCount:61,  lastVisitDate:'2026-04-30', avgDailyTheoretical:4200,   preferredGames:['blackjack'],                tags:['bj-only','regular'],                                  notes:'Classic blackjack player. Basic strategy adherent. Quiet and focused.',  vipServices:['dining-comp'], drinkPreference:'Coors Light', preferredRoomType:'Standard Room', joinDate:'2019-12-01' }],
    ['p-lena',      { id:'p-lena',      memberId:'PLZ-000017', firstName:'Dr. Lena',  lastName:'Hoffmann',       email:'l.hoffmann@hoffmann-med.de', phone:'+49-89-1717',  nationality:'German',        tier:'gold',     hostId:'u-elena', onProperty:false, lifetimeValue:74000,    ytdValue:9800,    compBalance:1900,   lifetimeComps:6200,    visitCount:28,  lastVisitDate:'2026-03-25', avgDailyTheoretical:3200,   preferredGames:['roulette','blackjack'],     tags:['roulette','european'],                                notes:'Medical professional from Munich. Visits annually for medical conference + leisure.', vipServices:['dining-comp'], drinkPreference:'Dry white wine', preferredRoomType:'Luxury Room', joinDate:'2020-10-18' }],
    ['p-anastasia', { id:'p-anastasia', memberId:'PLZ-000018', firstName:'Anastasia', lastName:'Volkov',         email:'avolkov@volkovpr.com',       phone:'+1-212-1818',  nationality:'Russian-American',tier:'gold',   hostId:'u-elena', onProperty:false, lifetimeValue:31000,    ytdValue:7200,    compBalance:900,    lifetimeComps:2600,    visitCount:22,  lastVisitDate:'2026-04-10', avgDailyTheoretical:2800,   preferredGames:['slot','roulette'],          tags:['slots'],                                              notes:'PR executive based in NYC. Social media influence — positive mentions.',  vipServices:['dining-comp'], drinkPreference:'Moët rosé', preferredRoomType:'Standard Suite', joinDate:'2023-02-14' }],
    ['p-isabella',  { id:'p-isabella',  memberId:'PLZ-000019', firstName:'Isabella',  lastName:'Moreau',         email:'imoreau@moreau-design.fr',   phone:'+33-1-1919',   nationality:'French',        tier:'silver',   hostId:'u-elena', onProperty:false, lifetimeValue:18000,    ytdValue:3400,    compBalance:400,    lifetimeComps:1200,    visitCount:14,  lastVisitDate:'2026-04-22', avgDailyTheoretical:850,    preferredGames:['roulette'],                 tags:['roulette','tourist'],                                 notes:'Interior designer visiting for design expo + leisure.',                  vipServices:[], drinkPreference:'Kir Royale', preferredRoomType:'Standard Room', joinDate:'2023-08-05' }],
    ['p-hannah',    { id:'p-hannah',    memberId:'PLZ-000020', firstName:'Hannah',    lastName:'Bergström',      email:'hbergstrom@gmail.com',       phone:'+46-8-2020',   nationality:'Swedish',       tier:'bronze',   hostId:'u-elena', onProperty:false, lifetimeValue:2400,     ytdValue:600,     compBalance:80,     lifetimeComps:150,     visitCount:6,   lastVisitDate:'2026-03-14', avgDailyTheoretical:180,    preferredGames:['slot'],                     tags:['casual'],                                             notes:'Recreational visitor. Referred by the Beckett account.',                 vipServices:[], drinkPreference:'White wine', preferredRoomType:'Standard Room', joinDate:'2024-03-14' }],
  ]);

  /* ── Patron visits (sample history) ────────────────────────────────── */
  const mkVisit = (patronId: string, days: number, ggr: number, game: PatronVisit['primaryGame'], notes = ''): PatronVisit => {
    const arr = new Date(); arr.setDate(arr.getDate() - days);
    const dep = new Date(arr); dep.setDate(dep.getDate() + Math.ceil(ggr / (patrons.get(patronId)!.avgDailyTheoretical || 1000)));
    return { id: uuid(), patronId, arrivalDate: arr.toISOString().split('T')[0], departureDate: dep.toISOString().split('T')[0], durationDays: Math.ceil(ggr / (patrons.get(patronId)!.avgDailyTheoretical || 1000)), ggr, compsUsed: Math.round(ggr * 0.08), primaryGame: game, notes };
  };
  const patronVisits: PatronVisit[] = [
    mkVisit('p-carlos',   2, 420000,'baccarat','Private session HLBAC-01. Three security staff on floor.'),
    mkVisit('p-carlos',  38, 380000,'baccarat'),
    mkVisit('p-carlos',  95, 510000,'baccarat','Record single-session win for patron. Issued $50K in dining/entertainment comps.'),
    mkVisit('p-kwame',    1, 520000,'baccarat','Purchased floor for 2hr private session.'),
    mkVisit('p-kwame',   45, 890000,'baccarat','Largest single visit GGR in Q1.'),
    mkVisit('p-jennifer', 2, 98000, 'blackjack','Played HLBJ-01 exclusively. Arrived by private car.'),
    mkVisit('p-jennifer',22, 82000, 'blackjack'),
    mkVisit('p-jennifer',60, 74000, 'blackjack'),
    mkVisit('p-meilin',   3, 145000,'baccarat','Extended stay. Ordered in-room private dining nightly.'),
    mkVisit('p-meilin',  40, 112000,'baccarat'),
    mkVisit('p-bobby',    1, 64000, 'craps',   'Big night at CRP-01. Team of 8 at the table.'),
    mkVisit('p-bobby',   18, 48000, 'craps'),
    mkVisit('p-alex',    34, 110000,'blackjack','Played late-night sessions exclusively.'),
    mkVisit('p-marcus_p', 0, 28000, 'texas_holdem','Weekend tournament.'),
    mkVisit('p-valentina',1, 22000, 'baccarat'),
    mkVisit('p-victor',   1, 16000, 'texas_holdem'),
    mkVisit('p-omar',    22, 780000,'baccarat','Record visit. Requested Japanese whisky import for table service.'),
    mkVisit('p-omar',    78, 650000,'baccarat'),
  ];

  /* ── Chip inventory ─────────────────────────────────────────────────── */
  const chipStock: ChipStock[] = [
    { denomination: 1,      label: '$1',       color: '#f5f5f5', count: 8000,  totalValue: 8000     },
    { denomination: 5,      label: '$5',       color: '#c0392b', count: 5000,  totalValue: 25000    },
    { denomination: 25,     label: '$25',      color: '#27ae60', count: 4000,  totalValue: 100000   },
    { denomination: 100,    label: '$100',     color: '#111111', count: 3000,  totalValue: 300000   },
    { denomination: 500,    label: '$500',     color: '#8e44ad', count: 1500,  totalValue: 750000   },
    { denomination: 1000,   label: '$1K',      color: '#e1b800', count: 800,   totalValue: 800000   },
    { denomination: 5000,   label: '$5K',      color: '#6b3c12', count: 200,   totalValue: 1000000  },
    { denomination: 25000,  label: '$25K',     color: '#e8dcc0', count: 40,    totalValue: 1000000  },
    { denomination: 100000, label: '$100K',    color: '#b8ffd8', count: 5,     totalValue: 500000   },
  ];

  /* ── Cage transactions ──────────────────────────────────────────────── */
  const T = (h: number, m: number): string => {
    const d = new Date(); d.setHours(h, m, 0, 0); return d.toISOString();
  };
  const cageTransactions: CageTransaction[] = [
    { id: uuid(), type:'fill',       tableCode:'HLBAC-01', amount:200000,  staffId:'u-james', timestamp:T(7,14),  approved:true,  notes:'Morning fill — $1K chips × 200 to HLBAC-01' },
    { id: uuid(), type:'fill',       tableCode:'BAC-01',   amount:50000,   staffId:'u-james', timestamp:T(7,28),  approved:true,  notes:'Morning fill — $100 chips × 500 to BAC-01' },
    { id: uuid(), type:'fill',       tableCode:'BAC-02',   amount:50000,   staffId:'u-james', timestamp:T(7,31),  approved:true,  notes:'Morning fill — $100 chips × 500 to BAC-02' },
    { id: uuid(), type:'marker',     tableCode:undefined,  amount:500000,  staffId:'u-james', patronId:'p-carlos',  timestamp:T(8,45),  approved:true,  notes:'Marker issued — Carlos Rodriguez. Auth: Victoria Rhodes.' },
    { id: uuid(), type:'marker',     tableCode:undefined,  amount:1000000, staffId:'u-james', patronId:'p-kwame',   timestamp:T(9,2),   approved:true,  notes:'Marker issued — Prince Kwame Asante. Auth: Victoria Rhodes.' },
    { id: uuid(), type:'credit',     tableCode:'BJ-02',    amount:30000,   staffId:'u-james', timestamp:T(9,48),  approved:true,  notes:'Credit — BJ-02 over float threshold' },
    { id: uuid(), type:'drop_count', tableCode:'HLBAC-02', amount:425000,  staffId:'u-james', timestamp:T(11,15), approved:true,  notes:'Drop count — HLBAC-02 prior to maintenance close' },
    { id: uuid(), type:'exchange',   tableCode:undefined,  amount:25000,   staffId:'u-james', patronId:'p-jennifer',timestamp:T(11,50), approved:true,  notes:'Chip color-up — Jennifer Blackwood-Hall. $25 → $100 chips.' },
    { id: uuid(), type:'fill',       tableCode:'SLT-V01',  amount:20000,   staffId:'u-james', timestamp:T(12,5),  approved:true,  notes:'Slot fill — SLT-V01 low on $25 tokens' },
    { id: uuid(), type:'redemption', tableCode:undefined,  amount:8500,    staffId:'u-james', patronId:'p-victor',  timestamp:T(13,22), approved:true,  notes:'Cash redemption — Victor Espinoza' },
    { id: uuid(), type:'fill',       tableCode:'HLBJ-01',  amount:100000,  staffId:'u-james', timestamp:T(13,44), approved:true,  notes:'Afternoon fill — $500 chips × 200 to HLBJ-01' },
    { id: uuid(), type:'credit',     tableCode:'BAC-01',   amount:85000,   staffId:'u-james', timestamp:T(14,2),  approved:true,  notes:'Credit — BAC-01 over float' },
    { id: uuid(), type:'marker',     tableCode:undefined,  amount:200000,  staffId:'u-james', patronId:'p-meilin',  timestamp:T(14,30), approved:false, notes:'Marker request — Mei-Lin Zhang. PENDING approval.' },
  ];

  return {
    users,
    positions,
    patrons,
    patronVisits,
    dailyRevenue: buildDailyRevenue(),
    monthlyRevenue: buildMonthlyRevenue(),
    chipStock,
    cageTransactions,
  };
}

const g = globalThis as typeof globalThis & { __casino?: Store };
export const store: Store = g.__casino ?? (g.__casino = initStore());
