import { store } from './store';
import type { PortfolioMetrics } from './types';

export function getProperties() { return store.properties; }
export function getLeases()     { return store.leases; }
export function getWorkOrders() { return store.workOrders; }
export function getFinancials() { return store.financials; }

export function getDashboardData() {
  const { properties, leases, workOrders, financials } = store;
  const portfolioValue = properties.reduce((s,p)=>s+p.currentValue,0);
  const annualNOI = properties.reduce((s,p)=>s+p.noi,0);
  const totalSqFt = properties.reduce((s,p)=>s+(p.type==='multifamily'?0:p.totalSqFt),0);
  const occupiedSqFt = properties.reduce((s,p)=>s+(p.type==='multifamily'?0:p.leasedSqFt),0);
  const avgOcc = properties.reduce((s,p)=>s+p.occupancyPct,0)/properties.length;
  const today = '2026-05-07';
  const in90 = new Date('2026-08-05').toISOString().slice(0,10);
  const leasesExpiring90d = leases.filter(l=>l.leaseEnd>=today&&l.leaseEnd<=in90).length;
  const openWorkOrders = workOrders.filter(w=>w.status!=='completed'&&w.status!=='cancelled').length;
  const metrics: PortfolioMetrics = {
    totalProperties: properties.length,
    totalSqFt, occupiedSqFt, portfolioValue, annualNOI,
    weightedCapRate: Math.round((annualNOI/portfolioValue)*10000)/100,
    avgOccupancy: Math.round(avgOcc*10)/10,
    leasesExpiring90d, openWorkOrders,
  };
  const lastMonth = financials[financials.length-1];
  const prevMonth  = financials[financials.length-2];
  return { metrics, lastMonth, prevMonth, recentWorkOrders: workOrders.slice(0,8), expiringLeases: leases.filter(l=>l.status==='expiring_soon').slice(0,6) };
}
