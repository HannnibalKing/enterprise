import { store } from './store';
import type { AssetClass, Sector } from './types';

export function getDashboardData() {
  const positions = [...store.positions.values()];
  const alerts    = store.alerts.filter(a => !a.acknowledged);
  const last5trades = store.trades.slice(0, 5);
  const last30snap  = store.snapshots.slice(-30);
  return { metrics: store.metrics, alerts, last5trades, last30snap, positionCount: positions.length };
}

export function getPositions(opts?: { assetClass?: AssetClass; sector?: Sector; sortBy?: 'marketValue' | 'unrealizedPnL' | 'dailyChange' | 'weight' }) {
  let list = [...store.positions.values()];
  if (opts?.assetClass) list = list.filter(p => p.assetClass === opts.assetClass);
  if (opts?.sector)     list = list.filter(p => p.sector     === opts.sector);
  const sort = opts?.sortBy ?? 'marketValue';
  list.sort((a, b) => Math.abs(b[sort]) - Math.abs(a[sort]));
  return list;
}

export function getTrades() {
  return [...store.trades].sort((a, b) => b.timestamp.localeCompare(a.timestamp));
}

export function getRiskData() {
  const positions = [...store.positions.values()];
  const sectorBreakdown: Record<string, number> = {};
  const assetBreakdown:  Record<string, number> = {};
  let totalMV = 0;
  for (const p of positions) {
    totalMV += p.marketValue;
    sectorBreakdown[p.sector]     = (sectorBreakdown[p.sector]     ?? 0) + p.marketValue;
    assetBreakdown[p.assetClass]  = (assetBreakdown[p.assetClass]  ?? 0) + p.marketValue;
  }
  const sectorPct = Object.entries(sectorBreakdown).map(([k, v]) => ({ name: k, value: +((v/totalMV)*100).toFixed(1) })).sort((a,b)=>b.value-a.value);
  const assetPct  = Object.entries(assetBreakdown) .map(([k, v]) => ({ name: k, value: +((v/totalMV)*100).toFixed(1) })).sort((a,b)=>b.value-a.value);
  return { alerts: store.alerts, metrics: store.metrics, sectorPct, assetPct };
}

export function getAnalyticsData() {
  return { snapshots: store.snapshots, metrics: store.metrics, trades: store.trades };
}
