import { store } from './store';
export function getUsers() { return store.users; }
export function getUserByName(name: string) { return store.users.find(u => u.name === name); }
export function getVehicles() { return store.vehicles; }
export function getVehicleById(id: string) { return store.vehicles.find(v => v.id === id); }
export function getOperationalVehicles() { return store.vehicles.filter(v => v.status === 'operational'); }
export function getLaunches() { return store.launches; }
export function getLaunchById(id: string) { return store.launches.find(l => l.id === id); }
export function getLaunchesByVehicle(vehicleId: string) { return store.launches.filter(l => l.vehicleId === vehicleId); }
export function getMaintenance() { return store.maintenance; }
export function getMaintenanceByVehicle(vehicleId: string) { return store.maintenance.filter(m => m.vehicleId === vehicleId); }
export function getPendingMaintenance() { return store.maintenance.filter(m => m.status !== 'complete'); }
export function getStats() {
  return {
    totalVehicles: store.vehicles.length,
    operational: store.vehicles.filter(v => v.status === 'operational').length,
    inRefurb: store.vehicles.filter(v => v.status === 'refurbishment').length,
    totalLaunches: store.launches.length,
    successRate: Math.round(store.launches.filter(l => l.outcome === 'success').length / store.launches.length * 100),
    pendingMaint: store.maintenance.filter(m => m.status !== 'complete').length,
  };
}
