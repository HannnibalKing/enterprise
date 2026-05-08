import bcrypt from 'bcryptjs';
import type { ChainUser, Shipment, Warehouse, Supplier, PurchaseOrder, SupplyAlert, ThroughputSnapshot, GlobalMetrics, TransportMode, ShipmentStatus, OrderStatus } from './types';

function lcg(seed: number) { let s=seed>>>0; return ()=>{ s=Math.imul(1664525,s)+1013904223>>>0; return s/0x100000000; }; }

interface Store {
  users:     Map<string, ChainUser>;
  shipments: Shipment[];
  warehouses:Warehouse[];
  suppliers: Map<string, Supplier>;
  orders:    PurchaseOrder[];
  alerts:    SupplyAlert[];
  snapshots: ThroughputSnapshot[];
  metrics:   GlobalMetrics;
}

function initStore(): Store {
  const PW = bcrypt.hashSync('chain123', 10);
  const users = new Map<string, ChainUser>([
    ['u1',{id:'u1',name:'Diana Okonkwo',    email:'diana@atlaschain.com',   avatar:'DO',role:'chief_supply_officer', title:'Chief Supply Chain Officer',passwordHash:PW}],
    ['u2',{id:'u2',name:'Marco Fernandez',  email:'marco@atlaschain.com',   avatar:'MF',role:'logistics_director',   title:'Director of Logistics',     passwordHash:PW}],
    ['u3',{id:'u3',name:'Aisha Bergström',  email:'aisha@atlaschain.com',   avatar:'AB',role:'procurement_manager',  title:'Global Procurement Manager',passwordHash:PW}],
    ['u4',{id:'u4',name:'Kevin Nakamura',   email:'kevin@atlaschain.com',   avatar:'KN',role:'warehouse_manager',    title:'VP Warehouse Operations',   passwordHash:PW}],
    ['u5',{id:'u5',name:'Priscilla Owusu',  email:'priscilla@atlaschain.com',avatar:'PO',role:'analyst',             title:'Supply Chain Analyst',      passwordHash:PW}],
  ]);

  const ORIGINS      = ['Shanghai, CN','Rotterdam, NL','Los Angeles, US','Shenzhen, CN','Hamburg, DE','Singapore, SG','Dubai, AE','Tokyo, JP','Mumbai, IN','Chicago, US'];
  const DESTS        = ['Dallas, US','Chicago, US','London, GB','New York, US','Frankfurt, DE','Toronto, CA','Sydney, AU','São Paulo, BR','Mexico City, MX','Seoul, KR'];
  const CARRIERS     = ['Maersk Line','MSC','COSCO','CMA CGM','DHL Express','FedEx Freight','UPS Supply Chain','DB Schenker','Kuehne+Nagel','Evergreen'];
  const CONTENTS_ARR = ['Electronics components','Automotive parts','Consumer goods','Pharmaceutical raw materials','Textile fabrics','Industrial machinery','Food & beverage','Chemical compounds','Medical devices','Semiconductor wafers'];
  const MODES: TransportMode[]  = ['ocean','air','ground','rail'];
  const STATUSES: ShipmentStatus[] = ['in_transit','at_port','customs','delivered','delayed','exception'];
  const SUPPLIERS_IDS = ['s1','s2','s3','s4','s5','s6'];

  const rng = lcg(42);
  const shipments: Shipment[] = [];
  for (let i=0; i<32; i++) {
    const mode = MODES[Math.floor(rng()*MODES.length)];
    const status = i<2?'exception':i<6?'delayed':STATUSES[Math.floor(rng()*STATUSES.length)];
    const depDaysAgo = 2+Math.floor(rng()*28);
    const transitDays = mode==='air'?2+Math.floor(rng()*5):mode==='ocean'?18+Math.floor(rng()*25):mode==='ground'?3+Math.floor(rng()*10):6+Math.floor(rng()*12);
    const etaFuture = transitDays-depDaysAgo;
    const daysDelay = status==='delayed'?3+Math.floor(rng()*8):status==='exception'?8+Math.floor(rng()*12):0;
    shipments.push({
      id:`sh${(i+1).toString().padStart(3,'0')}`,
      trackingNo:`ATL${Date.now().toString().slice(-6)}${i.toString().padStart(3,'0')}`,
      origin:ORIGINS[Math.floor(rng()*ORIGINS.length)],
      destination:DESTS[Math.floor(rng()*DESTS.length)],
      mode,status,
      carrier:CARRIERS[Math.floor(rng()*CARRIERS.length)],
      containers:mode==='ocean'?Math.floor(rng()*10)+1:mode==='air'?0:Math.floor(rng()*3)+1,
      weightKg:1000+Math.floor(rng()*50000),
      valueUSD:50000+Math.floor(rng()*2000000),
      departureDate:new Date(Date.now()-depDaysAgo*86400000).toISOString().slice(0,10),
      etaDate:new Date(Date.now()+(etaFuture+daysDelay)*86400000).toISOString().slice(0,10),
      lastUpdate:new Date(Date.now()-Math.floor(rng()*6)*3600000).toISOString(),
      lastLocation:ORIGINS[Math.floor(rng()*ORIGINS.length)],
      contents:CONTENTS_ARR[Math.floor(rng()*CONTENTS_ARR.length)],
      supplierId:SUPPLIERS_IDS[Math.floor(rng()*SUPPLIERS_IDS.length)],
      poNumber:`PO-2026-${(1000+i).toString()}`,
      daysDelay,
      co2Kg:mode==='air'?1000+Math.floor(rng()*9000):mode==='ocean'?200+Math.floor(rng()*2000):50+Math.floor(rng()*500),
    });
  }

  const warehouses: Warehouse[] = [
    {id:'wh1',name:'Dallas Mega-Distribution Center',location:'Dallas, TX',country:'US',totalCapacitySqM:45000,usedCapacitySqM:38250,totalSkus:14200,totalUnits:2840000,valueUSD:284000000,inboundToday:142,outboundToday:168,fillPct:85,manager:'Kevin Nakamura',type:'distribution'},
    {id:'wh2',name:'Rotterdam Gateway Hub',location:'Rotterdam, NL',country:'NL',totalCapacitySqM:32000,usedCapacitySqM:22400,totalSkus:8900,totalUnits:1620000,valueUSD:198000000,inboundToday:88,outboundToday:72,fillPct:70,manager:'Hans Müller',type:'bonded'},
    {id:'wh3',name:'Singapore APAC Fulfillment',location:'Singapore, SG',country:'SG',totalCapacitySqM:28000,usedCapacitySqM:25200,totalSkus:11400,totalUnits:2100000,valueUSD:310000000,inboundToday:206,outboundToday:194,fillPct:90,manager:'Li Wei',type:'fulfillment'},
    {id:'wh4',name:'Chicago Cold Storage',location:'Chicago, IL',country:'US',totalCapacitySqM:12000,usedCapacitySqM:9000,totalSkus:2200,totalUnits:480000,valueUSD:72000000,inboundToday:34,outboundToday:28,fillPct:75,manager:'Maria Gonzalez',type:'cold_storage'},
    {id:'wh5',name:'Dubai Middle East Hub',location:'Dubai, AE',country:'AE',totalCapacitySqM:20000,usedCapacitySqM:14000,totalSkus:6800,totalUnits:920000,valueUSD:134000000,inboundToday:56,outboundToday:48,fillPct:70,manager:'Omar Khalil',type:'distribution'},
    {id:'wh6',name:'São Paulo Latam Center',location:'São Paulo, BR',country:'BR',totalCapacitySqM:18000,usedCapacitySqM:12600,totalSkus:5100,totalUnits:760000,valueUSD:88000000,inboundToday:42,outboundToday:38,fillPct:70,manager:'Carlos Silva',type:'distribution'},
  ];

  const suppliers = new Map<string, Supplier>([
    ['s1',{id:'s1',name:'Shenzhen Electronics Co.',country:'China',category:'Electronics',tier:1,onTimeDeliveryPct:94.2,qualityScore:96,riskScore:18,leadTimeDays:21,ytdSpendUSD:42800000,activeOrders:8,certifications:['ISO 9001','ISO 14001','RoHS'],status:'approved',contactEmail:'ops@szelectronics.cn'}],
    ['s2',{id:'s2',name:'Stuttgart Auto Parts GmbH',country:'Germany',category:'Automotive',tier:1,onTimeDeliveryPct:97.8,qualityScore:98,riskScore:8,leadTimeDays:14,ytdSpendUSD:38200000,activeOrders:5,certifications:['IATF 16949','ISO 9001','VDA 6.3'],status:'approved',contactEmail:'supply@stuauto.de'}],
    ['s3',{id:'s3',name:'Mumbai Textiles Ltd',country:'India',category:'Textiles',tier:2,onTimeDeliveryPct:78.4,qualityScore:82,riskScore:42,leadTimeDays:35,ytdSpendUSD:12400000,activeOrders:12,certifications:['GOTS','Oeko-Tex'],status:'probation',contactEmail:'export@mumbaitextiles.in'}],
    ['s4',{id:'s4',name:'Osaka Semiconductor KK',country:'Japan',category:'Semiconductors',tier:1,onTimeDeliveryPct:99.1,qualityScore:99,riskScore:5,leadTimeDays:28,ytdSpendUSD:86500000,activeOrders:6,certifications:['ISO 9001','EMAS','AEC-Q100'],status:'approved',contactEmail:'b2b@osakasemi.jp'}],
    ['s5',{id:'s5',name:'Guangzhou Packaging Inc',country:'China',category:'Packaging',tier:2,onTimeDeliveryPct:88.6,qualityScore:87,riskScore:28,leadTimeDays:18,ytdSpendUSD:8900000,activeOrders:9,certifications:['ISO 9001','FSC'],status:'approved',contactEmail:'int@gzpackaging.cn'}],
    ['s6',{id:'s6',name:'São Paulo Chemicals Ltda',country:'Brazil',category:'Chemicals',tier:2,onTimeDeliveryPct:71.2,qualityScore:74,riskScore:58,leadTimeDays:45,ytdSpendUSD:6200000,activeOrders:3,certifications:['REACH','GHS'],status:'probation',contactEmail:'export@spchemicals.br'}],
  ]);

  const ORDER_STATUSES: OrderStatus[] = ['confirmed','in_production','shipped','delivered'];
  const rng2=lcg(123);
  const orders: PurchaseOrder[] = [];
  for (let i=0; i<20; i++) {
    const suppList=[...suppliers.values()];
    const supp=suppList[Math.floor(rng2()*suppList.length)];
    const status=ORDER_STATUSES[Math.floor(rng2()*ORDER_STATUSES.length)];
    const qty=100+Math.floor(rng2()*5000);
    const unitPrice=10+Math.floor(rng2()*500);
    const total=qty*unitPrice;
    const ordDaysAgo=5+Math.floor(rng2()*60);
    const etaDays=supp.leadTimeDays+Math.floor(rng2()*10)-5;
    orders.push({
      id:`ord${i+1}`,poNumber:`PO-2026-${(2000+i)}`,supplierId:supp.id,supplierName:supp.name,status,
      items:[{sku:`SKU-${Math.floor(rng2()*99999).toString().padStart(5,'0')}`,description:supp.category+' component type '+String.fromCharCode(65+Math.floor(rng2()*10)),qty,unitPriceUSD:unitPrice}],
      totalValueUSD:total,
      orderDate:new Date(Date.now()-ordDaysAgo*86400000).toISOString().slice(0,10),
      requiredDate:new Date(Date.now()+(etaDays-ordDaysAgo+10)*86400000).toISOString().slice(0,10),
      etaDate:new Date(Date.now()+(etaDays-ordDaysAgo)*86400000).toISOString().slice(0,10),
      warehouseId:['wh1','wh2','wh3','wh4','wh5','wh6'][Math.floor(rng2()*6)],
      notes:`Standard terms · Incoterms CIF · Payment NET30`,
    });
  }

  const alerts: SupplyAlert[] = [
    {id:'a1',severity:'critical',category:'shipment',title:'Shipment SH002 — Port Strike Risk',message:'Port of Rotterdam reporting labor strike action from next Tuesday. 3 shipments at risk of 14+ day delay. Rerouting options being assessed via Hamburg.',entityId:'sh002',timestamp:new Date(Date.now()-25*60000).toISOString(),acknowledged:false},
    {id:'a2',severity:'critical',category:'supplier',title:'Supplier Probation — Mumbai Textiles',message:'Mumbai Textiles Ltd on-time delivery rate fallen to 78.4% YTD (SLA: 90%+). 12 open POs at risk. Backup supplier qualification in progress.',entityId:'s3',timestamp:new Date(Date.now()-2*3600000).toISOString(),acknowledged:false},
    {id:'a3',severity:'high',category:'inventory',title:'Singapore Warehouse Near Capacity',message:'Singapore APAC fulfillment center at 90% fill rate. 4 inbound shipments arriving this week. Cross-dock to Dallas or Dubai required.',entityId:'wh3',timestamp:new Date(Date.now()-4*3600000).toISOString(),acknowledged:false},
    {id:'a4',severity:'high',category:'shipment',title:'SH001 Exception — Customs Hold',message:'Shipment SH001 held at Shanghai customs for documentation review. Est. 8-day delay. Customer notified. Legal team engaged.',entityId:'sh001',timestamp:new Date(Date.now()-6*3600000).toISOString(),acknowledged:true},
    {id:'a5',severity:'medium',category:'compliance',title:'São Paulo Chemicals REACH Review Due',message:'Annual REACH compliance review overdue for São Paulo Chemicals Ltda. Submission deadline in 14 days.',entityId:'s6',timestamp:new Date(Date.now()-24*3600000).toISOString(),acknowledged:false},
    {id:'a6',severity:'medium',category:'inventory',title:'Dallas DC — Slow-Moving SKUs',message:'214 SKUs at Dallas DC with no movement in 90+ days. Estimated carrying cost $1.2M. Recommend markdown or liquidation review.',entityId:'wh1',timestamp:new Date(Date.now()-36*3600000).toISOString(),acknowledged:true},
    {id:'a7',severity:'low',category:'system',title:'System Maintenance — Sunday 01:00 UTC',message:'ATLAS tracking system scheduled for maintenance Sunday 01:00–03:00 UTC. Real-time tracking will be unavailable during window.',timestamp:new Date(Date.now()-48*3600000).toISOString(),acknowledged:true},
  ];

  const rng3=lcg(555);
  const snapshots: ThroughputSnapshot[] = [];
  for (let i=89; i>=0; i--) {
    const date=new Date(Date.now()-i*86400000).toISOString().slice(0,10);
    snapshots.push({date,shipmentsIn:8+Math.floor(rng3()*12),shipmentsOut:7+Math.floor(rng3()*12),ordersPlaced:3+Math.floor(rng3()*8),ordersDelivered:2+Math.floor(rng3()*8),avgTransitDays:14+Math.floor(rng3()*10)});
  }

  const inTransitShipments = shipments.filter(s=>s.status==='in_transit'||s.status==='at_port'||s.status==='customs'||s.status==='delayed'||s.status==='exception');
  const metrics: GlobalMetrics = {
    activeShipments: inTransitShipments.length,
    inTransitValue:  inTransitShipments.reduce((s,x)=>s+x.valueUSD,0),
    delayedShipments:shipments.filter(s=>s.status==='delayed'||s.status==='exception').length,
    onTimeDeliveryPct: +(([...suppliers.values()].reduce((s,x)=>s+x.onTimeDeliveryPct,0)/suppliers.size)).toFixed(1),
    totalWarehouses:  warehouses.length,
    totalInventoryValue:warehouses.reduce((s,w)=>s+w.valueUSD,0),
    avgWarehouseFill: +(warehouses.reduce((s,w)=>s+w.fillPct,0)/warehouses.length).toFixed(1),
    activeSuppliers:  [...suppliers.values()].filter(s=>s.status==='approved').length,
    openOrders:       orders.filter(o=>o.status!=='delivered'&&o.status!=='cancelled').length,
    openOrdersValue:  orders.filter(o=>o.status!=='delivered'&&o.status!=='cancelled').reduce((s,o)=>s+o.totalValueUSD,0),
    co2Saved:         124000,
    monthlyThroughputUSD: 284000000,
  };

  return { users, shipments, warehouses, suppliers, orders, alerts, snapshots, metrics };
}

const g = globalThis as typeof globalThis & { __atlas?: Store };
export const store = g.__atlas ?? (g.__atlas = initStore());
