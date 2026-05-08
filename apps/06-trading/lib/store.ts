import bcrypt from 'bcryptjs';
import { v4 as uuid } from 'uuid';
import type {
  TraderUser, Position, Trade, PortfolioSnapshot,
  RiskAlert, PortfolioMetrics,
} from './types';

interface Store {
  users: Map<string, TraderUser>;
  positions: Map<string, Position>;
  trades: Trade[];
  snapshots: PortfolioSnapshot[];
  alerts: RiskAlert[];
  metrics: PortfolioMetrics;
}

function lcg(seed: number) {
  let s = seed >>> 0;
  return () => { s = Math.imul(1664525, s) + 1013904223 >>> 0; return s / 0x100000000; };
}

function initStore(): Store {
  const PW = bcrypt.hashSync('nexus123', 10);

  const users = new Map<string, TraderUser>([
    ['u-victoria', { id:'u-victoria', name:'Victoria Chen',   email:'victoria@nexuscap.com', passwordHash:PW, avatar:'VC', role:'head_of_trading',     title:'Head of Trading' }],
    ['u-marcus',   { id:'u-marcus',   name:'Marcus Okafor',  email:'marcus@nexuscap.com',   passwordHash:PW, avatar:'MO', role:'portfolio_manager',    title:'Portfolio Manager' }],
    ['u-elena',    { id:'u-elena',    name:'Elena Sorokin',  email:'elena@nexuscap.com',    passwordHash:PW, avatar:'ES', role:'risk_officer',         title:'Chief Risk Officer' }],
    ['u-james',    { id:'u-james',    name:'James Harrington',email:'james@nexuscap.com',  passwordHash:PW, avatar:'JH', role:'quant_analyst',        title:'Quantitative Analyst' }],
    ['u-riya',     { id:'u-riya',     name:'Riya Mehta',     email:'riya@nexuscap.com',     passwordHash:PW, avatar:'RM', role:'compliance_officer',   title:'Compliance Officer' }],
  ]);

  // Positions — 18 holdings, ~$2.8B AUM
  const rawPositions = [
    { ticker:'AAPL',  name:'Apple Inc.',              assetClass:'equity' as const,      sector:'technology' as const,   shares:1200000, avgCost:152.40, currentPrice:187.62, dailyChangePct: 1.24,  beta:1.18, currency:'USD' },
    { ticker:'MSFT',  name:'Microsoft Corp.',         assetClass:'equity' as const,      sector:'technology' as const,   shares:800000,  avgCost:298.10, currentPrice:421.80, dailyChangePct: 0.87,  beta:0.92, currency:'USD' },
    { ticker:'NVDA',  name:'NVIDIA Corp.',            assetClass:'equity' as const,      sector:'technology' as const,   shares:350000,  avgCost:480.20, currentPrice:875.40, dailyChangePct: 3.21,  beta:1.74, currency:'USD' },
    { ticker:'JPM',   name:'JPMorgan Chase & Co.',    assetClass:'equity' as const,      sector:'financials' as const,   shares:1500000, avgCost:148.20, currentPrice:198.75, dailyChangePct: 0.42,  beta:1.12, currency:'USD' },
    { ticker:'GS',    name:'Goldman Sachs Group',     assetClass:'equity' as const,      sector:'financials' as const,   shares:420000,  avgCost:312.80, currentPrice:462.30, dailyChangePct:-0.18,  beta:1.28, currency:'USD' },
    { ticker:'LLY',   name:'Eli Lilly & Co.',         assetClass:'equity' as const,      sector:'healthcare' as const,   shares:310000,  avgCost:582.40, currentPrice:892.10, dailyChangePct: 1.84,  beta:0.68, currency:'USD' },
    { ticker:'UNH',   name:'UnitedHealth Group',      assetClass:'equity' as const,      sector:'healthcare' as const,   shares:280000,  avgCost:482.10, currentPrice:511.40, dailyChangePct:-0.63,  beta:0.74, currency:'USD' },
    { ticker:'XOM',   name:'Exxon Mobil Corp.',       assetClass:'equity' as const,      sector:'energy' as const,       shares:2200000, avgCost:88.40,  currentPrice:112.80, dailyChangePct: 0.95,  beta:0.94, currency:'USD' },
    { ticker:'AMZN',  name:'Amazon.com Inc.',         assetClass:'equity' as const,      sector:'consumer' as const,     shares:650000,  avgCost:148.20, currentPrice:208.45, dailyChangePct: 2.14,  beta:1.32, currency:'USD' },
    { ticker:'META',  name:'Meta Platforms Inc.',     assetClass:'equity' as const,      sector:'technology' as const,   shares:480000,  avgCost:298.40, currentPrice:512.80, dailyChangePct: 1.67,  beta:1.48, currency:'USD' },
    { ticker:'BRK.B', name:'Berkshire Hathaway B',   assetClass:'equity' as const,      sector:'financials' as const,   shares:900000,  avgCost:312.10, currentPrice:398.20, dailyChangePct: 0.28,  beta:0.84, currency:'USD' },
    { ticker:'CAT',   name:'Caterpillar Inc.',        assetClass:'equity' as const,      sector:'industrials' as const,  shares:480000,  avgCost:248.30, currentPrice:348.90, dailyChangePct: 0.74,  beta:1.06, currency:'USD' },
    { ticker:'SPY',   name:'SPDR S&P 500 ETF',       assetClass:'etf' as const,         sector:'multi_asset' as const,  shares:3200000, avgCost:412.10, currentPrice:521.40, dailyChangePct: 0.61,  beta:1.00, currency:'USD' },
    { ticker:'QQQ',   name:'Invesco QQQ Trust',       assetClass:'etf' as const,         sector:'technology' as const,   shares:1800000, avgCost:348.20, currentPrice:448.70, dailyChangePct: 1.12,  beta:1.18, currency:'USD' },
    { ticker:'TLT',   name:'iShares 20+ Yr Bond ETF', assetClass:'fixed_income' as const,sector:'multi_asset' as const,  shares:5000000, avgCost:98.40,  currentPrice:88.20,  dailyChangePct:-0.42,  beta:-0.12, currency:'USD' },
    { ticker:'GLD',   name:'SPDR Gold Shares',        assetClass:'commodity' as const,   sector:'materials' as const,    shares:2400000, avgCost:168.20, currentPrice:218.40, dailyChangePct: 0.54,  beta:0.08, currency:'USD' },
    { ticker:'EURUSD',name:'EUR/USD',                 assetClass:'forex' as const,       sector:'multi_asset' as const,  shares:50000000,avgCost:1.0820, currentPrice:1.0748, dailyChangePct:-0.22,  beta:0.02, currency:'EUR' },
    { ticker:'ES1!',  name:'S&P 500 Futures',         assetClass:'derivative' as const,  sector:'multi_asset' as const,  shares:120,     avgCost:5180.0, currentPrice:5312.0, dailyChangePct: 0.58,  beta:1.00, currency:'USD' },
  ];

  let totalMV = 0;
  const positionsArr = rawPositions.map(p => {
    const marketValue = p.shares * p.currentPrice;
    const unrealizedPnL = (p.currentPrice - p.avgCost) * p.shares;
    const unrealizedPnLPct = ((p.currentPrice - p.avgCost) / p.avgCost) * 100;
    const dailyChange = p.currentPrice * (p.dailyChangePct / 100) * p.shares;
    totalMV += marketValue;
    return { id: uuid(), ...p, marketValue, unrealizedPnL, unrealizedPnLPct, dailyChange, weight: 0 };
  });
  positionsArr.forEach(p => { p.weight = (p.marketValue / totalMV) * 100; });

  const positions = new Map(positionsArr.map(p => [p.id, p]));

  const dailyPnL = positionsArr.reduce((s, p) => s + p.dailyChange, 0);

  const metrics: PortfolioMetrics = {
    totalAUM: totalMV + 48_200_000, // + cash
    cash: 48_200_000,
    dailyPnL,
    dailyPnLPct: (dailyPnL / totalMV) * 100,
    ytdPnL: 284_400_000,
    ytdPnLPct: 11.42,
    totalUnrealizedPnL: positionsArr.reduce((s, p) => s + p.unrealizedPnL, 0),
    totalUnrealizedPnLPct: 0,
    sharpeRatio: 1.84,
    beta: 0.94,
    var95: -32_400_000,
    maxDrawdown: -8.42,
    alpha: 2.84,
    infoRatio: 1.21,
  };
  metrics.totalUnrealizedPnLPct = (metrics.totalUnrealizedPnL / (metrics.totalAUM - metrics.totalUnrealizedPnL)) * 100;

  // Trades — blotter
  const T = (minsAgo: number) => { const d = new Date(); d.setMinutes(d.getMinutes() - minsAgo); return d.toISOString(); };
  const trades: Trade[] = [
    { id:uuid(), timestamp:T(4),   ticker:'NVDA',   name:'NVIDIA Corp.',           side:'buy',  quantity:50000,   price:871.20, totalValue:43560000,  status:'filled',    traderId:'u-marcus',   commission:12500,  notes:'Momentum breakout — adding to core tech position' },
    { id:uuid(), timestamp:T(11),  ticker:'TLT',    name:'20+ Yr Bond ETF',        side:'sell', quantity:200000,  price:88.40,  totalValue:17680000,  status:'filled',    traderId:'u-victoria', commission:8400,   notes:'Duration reduction — rate risk management' },
    { id:uuid(), timestamp:T(18),  ticker:'JPM',    name:'JPMorgan Chase',         side:'buy',  quantity:80000,   price:197.80, totalValue:15824000,  status:'filled',    traderId:'u-marcus',   commission:6200,   notes:'Financials overweight — earnings play Q2' },
    { id:uuid(), timestamp:T(24),  ticker:'AAPL',   name:'Apple Inc.',             side:'sell', quantity:30000,   price:188.10, totalValue:5643000,   status:'filled',    traderId:'u-victoria', commission:2800,   notes:'Trimming — approaching position limit' },
    { id:uuid(), timestamp:T(35),  ticker:'GLD',    name:'SPDR Gold Shares',       side:'buy',  quantity:150000,  price:217.80, totalValue:32670000,  status:'filled',    traderId:'u-marcus',   commission:9800,   notes:'Inflation hedge — geopolitical tail risk' },
    { id:uuid(), timestamp:T(48),  ticker:'META',   name:'Meta Platforms',         side:'buy',  quantity:25000,   price:511.40, totalValue:12785000,  status:'filled',    traderId:'u-james',    commission:4800,   notes:'Quant signal — relative value vs FAANG peers' },
    { id:uuid(), timestamp:T(62),  ticker:'XOM',    name:'Exxon Mobil',            side:'sell', quantity:100000,  price:113.20, totalValue:11320000,  status:'filled',    traderId:'u-victoria', commission:4200,   notes:'Energy weight reduction — rebalance' },
    { id:uuid(), timestamp:T(75),  ticker:'EURUSD', name:'EUR/USD',                side:'sell', quantity:5000000, price:1.0762, totalValue:5381000,   status:'filled',    traderId:'u-james',    commission:1200,   notes:'FX hedge — USD exposure management' },
    { id:uuid(), timestamp:T(90),  ticker:'ES1!',   name:'S&P 500 Futures',        side:'buy',  quantity:20,      price:5290.0, totalValue:5290000,   status:'filled',    traderId:'u-victoria', commission:800,    notes:'Index futures — beta overlay' },
    { id:uuid(), timestamp:T(105), ticker:'LLY',    name:'Eli Lilly',              side:'buy',  quantity:15000,   price:888.40, totalValue:13326000,  status:'filled',    traderId:'u-marcus',   commission:5200,   notes:'Healthcare conviction — GLP-1 pipeline' },
    { id:uuid(), timestamp:T(120), ticker:'CAT',    name:'Caterpillar Inc.',       side:'sell', quantity:20000,   price:350.10, totalValue:7002000,   status:'filled',    traderId:'u-marcus',   commission:2800,   notes:'Industrials trim — capex cycle concerns' },
    { id:uuid(), timestamp:T(140), ticker:'SPY',    name:'SPDR S&P 500 ETF',       side:'sell', quantity:50000,   price:520.80, totalValue:26040000,  status:'filled',    traderId:'u-victoria', commission:9200,   notes:'Tactical underweight — reducing market beta' },
    { id:uuid(), timestamp:T(160), ticker:'QQQ',    name:'Invesco QQQ Trust',      side:'buy',  quantity:100000,  price:447.20, totalValue:44720000,  status:'pending',   traderId:'u-marcus',   commission:0,      notes:'Tech overweight signal — awaiting execution' },
    { id:uuid(), timestamp:T(180), ticker:'MSFT',   name:'Microsoft Corp.',        side:'buy',  quantity:10000,   price:421.80, totalValue:4218000,   status:'partial',   traderId:'u-james',    commission:1800,   notes:'Partial fill — 6K shares filled, 4K pending' },
  ];

  // Snapshots — 90 days
  const rng = lcg(42);
  const snapshots: PortfolioSnapshot[] = [];
  let baseAUM = 2_480_000_000;
  for (let i = 89; i >= 0; i--) {
    const date = new Date(); date.setDate(date.getDate() - i);
    const dow = date.getDay();
    if (dow === 0 || dow === 6) continue;
    const dailyRet = (rng() - 0.45) * 0.018;
    baseAUM *= (1 + dailyRet);
    const dailyPnLSnap = baseAUM * dailyRet;
    snapshots.push({
      date: date.toISOString().split('T')[0],
      aum: Math.round(baseAUM),
      dailyPnL: Math.round(dailyPnLSnap),
      dailyPnLPct: +(dailyRet * 100).toFixed(3),
    });
  }

  const alerts: RiskAlert[] = [
    { id:uuid(), level:'critical', title:'VaR Breach — Tech Concentration',   message:'Technology sector weight at 38.4%, exceeding 35% limit. NVDA single-stock beta contribution: 6.1%. Immediate review required.', ticker:'NVDA', timestamp:new Date(Date.now()-8*60000).toISOString(), acknowledged:false },
    { id:uuid(), level:'high',     title:'Drawdown Alert — TLT',              message:'TLT position down 10.4% from cost basis. Duration risk exposure elevated given rate environment.', ticker:'TLT', timestamp:new Date(Date.now()-22*60000).toISOString(), acknowledged:false },
    { id:uuid(), level:'medium',   title:'Margin Utilization — 84%',          message:'Prime brokerage margin utilization at 84.2%, approaching 90% soft limit. Review leverage ratios.', timestamp:new Date(Date.now()-45*60000).toISOString(), acknowledged:false },
    { id:uuid(), level:'medium',   title:'Correlation Spike Detected',        message:'30-day rolling correlation between equity positions increased to 0.82, reducing diversification benefit.', timestamp:new Date(Date.now()-90*60000).toISOString(), acknowledged:true },
    { id:uuid(), level:'low',      title:'Earnings Calendar — 3 positions',   message:'JPM, UNH, and CAT report earnings within 5 trading days. Review position sizing ahead of announcements.', timestamp:new Date(Date.now()-120*60000).toISOString(), acknowledged:true },
    { id:uuid(), level:'info',     title:'Rebalance Trigger — QQQ',           message:'QQQ weight drifted 1.8% above target. Automatic rebalance queued for next trading window.', ticker:'QQQ', timestamp:new Date(Date.now()-180*60000).toISOString(), acknowledged:true },
  ];

  return { users, positions, trades, snapshots, alerts, metrics };
}

const g = globalThis as typeof globalThis & { __trading?: Store };
export const store: Store = g.__trading ?? (g.__trading = initStore());
