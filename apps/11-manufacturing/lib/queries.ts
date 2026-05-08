import { store } from './store';
import type { PlantMetrics } from './types';
export function getProductionLines() { return store.productionLines; }
export function getEquipment()       { return store.equipment; }
export function getProductionOrders(){ return store.productionOrders; }
export function getQualityChecks()   { return store.qualityChecks; }
export function getMaterials()       { return store.materials; }
export function getDashboardData() {
  const { productionLines, productionOrders, qualityChecks, materials, snapshots } = store;
  const running = productionLines.filter(l=>l.status==='running').length;
  const plantOEE = Math.round(productionLines.reduce((s,l)=>s+l.oee,0)/productionLines.length*10)/10;
  const unitsToday = productionLines.reduce((s,l)=>s+l.shiftUnitsActual,0);
  const scrapToday = productionOrders.reduce((s,o)=>s+o.quantityScrap,0);
  const scrapTotal = productionOrders.reduce((s,o)=>s+o.quantityProduced,0);
  const openQuality = qualityChecks.filter(q=>q.result==='fail').length;
  const critMat = materials.filter(m=>m.status==='out_of_stock'||m.status==='low_stock').length;
  const metrics: PlantMetrics = {
    totalLines: productionLines.length, runningLines: running, plantOEE,
    unitsToday, scrapToday,
    scrapRatePct: scrapTotal>0 ? Math.round((scrapToday/scrapTotal)*1000)/10 : 0,
    activeWorkOrders: productionOrders.filter(o=>o.status==='in_progress').length,
    openQualityIssues: openQuality, criticalMaterials: critMat,
    plannedDowntimeToday: 30, unplannedDowntimeToday: productionLines.reduce((s,l)=>s+l.downtimeMinutesToday,0),
  };
  return { metrics, productionLines, recentQuality: qualityChecks.slice(0,6), criticalMaterials: materials.filter(m=>m.status!=='in_stock').slice(0,5), snapshots };
}
