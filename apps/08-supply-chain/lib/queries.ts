import { store } from './store';
export function getDashboardData() {
  return { metrics:store.metrics, alerts:store.alerts.filter(a=>!a.acknowledged), snapshots:store.snapshots.slice(-30), shipments:store.shipments.slice(0,8), warehouses:store.warehouses };
}
export function getShipments() { return [...store.shipments].sort((a,b)=>b.lastUpdate.localeCompare(a.lastUpdate)); }
export function getWarehouses() { return store.warehouses; }
export function getSuppliers() { return [...store.suppliers.values()].sort((a,b)=>b.ytdSpendUSD-a.ytdSpendUSD); }
export function getOrders() { return [...store.orders].sort((a,b)=>b.orderDate.localeCompare(a.orderDate)); }
export function getAlerts() { return [...store.alerts].sort((a,b)=>b.timestamp.localeCompare(a.timestamp)); }
export function getAnalyticsData() { return { snapshots:store.snapshots, metrics:store.metrics, shipments:store.shipments, suppliers:[...store.suppliers.values()] }; }
